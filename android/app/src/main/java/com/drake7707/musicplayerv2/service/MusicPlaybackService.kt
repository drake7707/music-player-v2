package com.drake7707.musicplayerv2.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.os.Binder
import android.os.IBinder
import android.support.v4.media.MediaMetadataCompat
import android.support.v4.media.session.MediaSessionCompat
import android.support.v4.media.session.PlaybackStateCompat
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.lifecycle.LifecycleService
import androidx.lifecycle.lifecycleScope
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import com.bumptech.glide.Glide
import com.drake7707.musicplayerv2.R
import com.drake7707.musicplayerv2.data.MusicRepository
import com.drake7707.musicplayerv2.data.api.RetrofitClient
import com.drake7707.musicplayerv2.data.api.models.PlayerState
import com.drake7707.musicplayerv2.data.api.models.Track
import com.drake7707.musicplayerv2.ui.MainActivity
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import java.util.concurrent.atomic.AtomicBoolean

class MusicPlaybackService : LifecycleService() {

    companion object {
        private const val TAG = "MusicPlaybackService"
        const val NOTIFICATION_ID = 1001
        const val CHANNEL_ID = "music_playback_channel"

        const val ACTION_PLAY = "com.drake7707.musicplayerv2.ACTION_PLAY"
        const val ACTION_PAUSE = "com.drake7707.musicplayerv2.ACTION_PAUSE"
        const val ACTION_NEXT = "com.drake7707.musicplayerv2.ACTION_NEXT"
        const val ACTION_PREVIOUS = "com.drake7707.musicplayerv2.ACTION_PREVIOUS"
        const val ACTION_STOP = "com.drake7707.musicplayerv2.ACTION_STOP"

        // Listener for state changes
        var playerStateListener: PlayerStateListener? = null
    }

    interface PlayerStateListener {
        fun onPlayerStateChanged(state: PlayerState?, isPlaying: Boolean, currentPositionMs: Long)
        fun onError(message: String)
    }

    inner class LocalBinder : Binder() {
        fun getService(): MusicPlaybackService = this@MusicPlaybackService
    }

    private val binder = LocalBinder()
    private lateinit var exoPlayer: ExoPlayer
    private lateinit var mediaSession: MediaSessionCompat
    private var albumArtBitmap: Bitmap? = null
    private var albumArtUrl: String? = null

    // Always returns a fresh repository using the current base URL
    private val repository get() = MusicRepository(RetrofitClient.getApiService())

    var currentPlayerState: PlayerState? = null
        private set

    val isPlaying: Boolean get() = exoPlayer.isPlaying
    val currentPositionMs: Long get() = exoPlayer.currentPosition
    val durationMs: Long get() = exoPlayer.duration.coerceAtLeast(0L)

    private val isAdvancing = AtomicBoolean(false)
    private var trackStartedPlayingMs: Long = 0L
    private var progressUpdateJob: Job? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        exoPlayer = ExoPlayer.Builder(this).build()
        exoPlayer.addListener(playerListener)
        mediaSession = MediaSessionCompat(this, "MusicPlaybackService").apply {
            setCallback(object : MediaSessionCompat.Callback() {
                override fun onPlay() { resumePlayback() }
                override fun onPause() { pausePlayback() }
                override fun onSkipToNext() { skipToNext(false) }
                override fun onSkipToPrevious() { skipToPrevious() }
                override fun onSeekTo(pos: Long) { seekTo(pos) }
                override fun onStop() { stopSelf() }
            })
            isActive = true
        }
    }

    override fun onBind(intent: Intent): IBinder {
        super.onBind(intent)
        return binder
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        super.onStartCommand(intent, flags, startId)
        when (intent?.action) {
            ACTION_PLAY -> resumePlayback()
            ACTION_PAUSE -> pausePlayback()
            ACTION_NEXT -> skipToNext(false)
            ACTION_PREVIOUS -> skipToPrevious()
            ACTION_STOP -> stopSelf()
        }
        return START_NOT_STICKY
    }

    // Called from UI to load and play a track from a new PlayerState
    fun loadPlayerState(state: PlayerState, playWhenReady: Boolean = true) {
        currentPlayerState = state
        val track = state.currentTrack ?: return

        val mediaItem = MediaItem.Builder()
            .setUri(RetrofitClient.getBaseUrl().trimEnd('/') + track.url)
            .setMediaMetadata(
                MediaMetadata.Builder()
                    .setTitle(track.title)
                    .setArtist(track.artists.joinToString(", "))
                    .setAlbumTitle(track.album)
                    .build()
            )
            .build()

        exoPlayer.setMediaItem(mediaItem)
        exoPlayer.prepare()
        exoPlayer.playWhenReady = playWhenReady

        if (playWhenReady) {
            trackStartedPlayingMs = System.currentTimeMillis()
        }
        // Always promote to foreground so background network calls (e.g. auto-advance) work
        // Start with whatever art we have cached; updateMediaSession will reload art if URL changed
        albumArtUrl = null // reset so updateMediaSession re-fetches art for the new track
        albumArtBitmap = null
        startForeground(NOTIFICATION_ID, buildNotification(track, null))
        updateMediaSession()
        notifyStateChanged()
    }

    // Update the player state without reloading/restarting the media item (e.g. after shuffle toggle)
    fun updateStateOnly(state: PlayerState) {
        currentPlayerState = state
        updateMediaSession()
        notifyStateChanged()
    }

    fun resumePlayback() {
        exoPlayer.play()
        if (trackStartedPlayingMs == 0L) trackStartedPlayingMs = System.currentTimeMillis()
        currentPlayerState?.currentTrack?.let { startForeground(NOTIFICATION_ID, buildNotification(it, albumArtBitmap)) }
        updateMediaSession()
        notifyStateChanged()
    }

    fun pausePlayback() {
        exoPlayer.pause()
        updateNotificationIfNeeded()
        updateMediaSession()
        notifyStateChanged()
    }

    fun togglePlayback() {
        if (exoPlayer.isPlaying) pausePlayback() else resumePlayback()
    }

    fun seekTo(positionMs: Long) {
        exoPlayer.seekTo(positionMs)
    }

    fun skipToNext(playedToEnd: Boolean) {
        val trackId = currentPlayerState?.currentTrack?.id ?: return
        if (isAdvancing.getAndSet(true)) return

        lifecycleScope.launch {
            try {
                val newState = repository.nextTrack(trackId, playedToEnd)
                if (newState != null) {
                    currentPlayerState = newState
                    loadPlayerState(newState, exoPlayer.isPlaying || playedToEnd)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error getting next track", e)
                playerStateListener?.onError("Failed to get next track: ${e.message}")
            } finally {
                isAdvancing.set(false)
            }
        }
    }

    fun skipToPrevious() {
        val trackId = currentPlayerState?.currentTrack?.id ?: return

        lifecycleScope.launch {
            try {
                val newState = repository.previousTrack(trackId)
                if (newState != null) {
                    currentPlayerState = newState
                    loadPlayerState(newState, exoPlayer.isPlaying)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error getting previous track", e)
                playerStateListener?.onError("Failed to get previous track: ${e.message}")
            }
        }
    }

    private val playerListener = object : Player.Listener {
        override fun onPlaybackStateChanged(playbackState: Int) {
            when (playbackState) {
                Player.STATE_ENDED -> {
                    // Track finished playing - auto-advance to next track
                    Log.d(TAG, "Track ended, advancing to next track")
                    skipToNext(true)
                }
                Player.STATE_READY -> {
                    updateMediaSession()
                    notifyStateChanged()
                }
                else -> {}
            }
        }

        override fun onIsPlayingChanged(isPlaying: Boolean) {
            updateNotificationIfNeeded()
            updateMediaSession()
            notifyStateChanged()
        }
    }

    private fun notifyStateChanged() {
        playerStateListener?.onPlayerStateChanged(
            currentPlayerState,
            exoPlayer.isPlaying,
            exoPlayer.currentPosition
        )
    }

    private fun updateNotificationIfNeeded() {
        val track = currentPlayerState?.currentTrack ?: return
        val notification = buildNotification(track, albumArtBitmap)
        val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        nm.notify(NOTIFICATION_ID, notification)
    }

    private fun publishMetadata(track: Track, art: Bitmap?) {
        mediaSession.setMetadata(
            MediaMetadataCompat.Builder()
                .putString(MediaMetadataCompat.METADATA_KEY_TITLE, track.title)
                .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, track.artists.joinToString(", "))
                .putString(MediaMetadataCompat.METADATA_KEY_ALBUM, track.album)
                .putLong(MediaMetadataCompat.METADATA_KEY_DURATION, exoPlayer.duration.coerceAtLeast(0L))
                .apply { if (art != null) putBitmap(MediaMetadataCompat.METADATA_KEY_ALBUM_ART, art) }
                .build()
        )
        val notification = buildNotification(track, art)
        val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        nm.notify(NOTIFICATION_ID, notification)
    }

    private fun updateMediaSession() {
        val track = currentPlayerState?.currentTrack
        if (track != null) {
            val rawArt = track.artImage
            val artUrl = if (!rawArt.isNullOrEmpty()) {
                if (rawArt.startsWith("http")) rawArt
                else RetrofitClient.getBaseUrl().trimEnd('/') + rawArt
            } else null

            // Publish metadata immediately (art may already be cached from a previous load)
            publishMetadata(track, if (artUrl == albumArtUrl) albumArtBitmap else null)

            if (artUrl != null && artUrl != albumArtUrl) {
                albumArtUrl = artUrl
                albumArtBitmap = null
                Glide.with(this)
                    .asBitmap()
                    .load(artUrl)
                    .into(object : com.bumptech.glide.request.target.CustomTarget<Bitmap>() {
                        override fun onResourceReady(resource: Bitmap, transition: com.bumptech.glide.request.transition.Transition<in Bitmap>?) {
                            albumArtBitmap = resource
                            // Only update if the same track is still current
                            if (currentPlayerState?.currentTrack?.artImage == track.artImage) {
                                publishMetadata(track, resource)
                            }
                        }
                        override fun onLoadCleared(placeholder: android.graphics.drawable.Drawable?) {
                            albumArtBitmap = null
                        }
                    })
            }
        }
        val playbackState = PlaybackStateCompat.Builder()
            .setActions(
                PlaybackStateCompat.ACTION_PLAY or
                PlaybackStateCompat.ACTION_PAUSE or
                PlaybackStateCompat.ACTION_PLAY_PAUSE or
                PlaybackStateCompat.ACTION_SKIP_TO_NEXT or
                PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS or
                PlaybackStateCompat.ACTION_SEEK_TO
            )
            .setState(
                if (exoPlayer.isPlaying) PlaybackStateCompat.STATE_PLAYING else PlaybackStateCompat.STATE_PAUSED,
                exoPlayer.currentPosition,
                1.0f
            )
            .build()
        mediaSession.setPlaybackState(playbackState)
    }

    private fun buildNotification(track: Track, albumArt: Bitmap? = null): Notification {
        val openAppIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val contentIntent = PendingIntent.getActivity(
            this, 0, openAppIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val playPauseAction = if (exoPlayer.isPlaying) {
            NotificationCompat.Action(
                R.drawable.ic_pause, "Pause",
                buildServicePendingIntent(ACTION_PAUSE, 1)
            )
        } else {
            NotificationCompat.Action(
                R.drawable.ic_play, "Play",
                buildServicePendingIntent(ACTION_PLAY, 2)
            )
        }

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_music_note)
            .setContentTitle(track.title)
            .setContentText(track.artists.joinToString(", "))
            .setSubText(track.album)
            .setLargeIcon(albumArt)
            .setContentIntent(contentIntent)
            .addAction(
                R.drawable.ic_skip_previous, "Previous",
                buildServicePendingIntent(ACTION_PREVIOUS, 3)
            )
            .addAction(playPauseAction)
            .addAction(
                R.drawable.ic_skip_next, "Next",
                buildServicePendingIntent(ACTION_NEXT, 4)
            )
            .setStyle(
                androidx.media.app.NotificationCompat.MediaStyle()
                    .setMediaSession(mediaSession.sessionToken)
                    .setShowActionsInCompactView(0, 1, 2)
            )
            .setOngoing(exoPlayer.isPlaying)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .build()
    }

    private fun buildServicePendingIntent(action: String, requestCode: Int): PendingIntent {
        val intent = Intent(this, MusicPlaybackService::class.java).apply { this.action = action }
        return PendingIntent.getService(
            this, requestCode, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            CHANNEL_ID,
            "Music Playback",
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description = "Controls music playback"
            setShowBadge(false)
        }
        val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        nm.createNotificationChannel(channel)
    }

    override fun onDestroy() {
        progressUpdateJob?.cancel()
        mediaSession.release()
        exoPlayer.release()
        super.onDestroy()
    }
}
