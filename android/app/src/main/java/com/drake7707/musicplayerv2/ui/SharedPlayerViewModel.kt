package com.drake7707.musicplayerv2.ui

import android.app.Application
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.os.IBinder
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.drake7707.musicplayerv2.data.MusicRepository
import com.drake7707.musicplayerv2.data.api.RetrofitClient
import com.drake7707.musicplayerv2.data.api.models.*
import com.drake7707.musicplayerv2.service.MusicPlaybackService
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

class SharedPlayerViewModel(application: Application) : AndroidViewModel(application) {

    companion object {
        private const val TAG = "SharedPlayerViewModel"
    }

    private val _playerState = MutableLiveData<PlayerState?>()
    val playerState: LiveData<PlayerState?> = _playerState

    private val _isPlaying = MutableLiveData(false)
    val isPlaying: LiveData<Boolean> = _isPlaying

    private val _currentPositionMs = MutableLiveData(0L)
    val currentPositionMs: LiveData<Long> = _currentPositionMs

    private val _durationMs = MutableLiveData(0L)
    val durationMs: LiveData<Long> = _durationMs

    private val _errorMessage = MutableLiveData<String?>()
    val errorMessage: LiveData<String?> = _errorMessage

    private val _isLoading = MutableLiveData(false)
    val isLoading: LiveData<Boolean> = _isLoading

    private var service: MusicPlaybackService? = null
    private var isBound = false
    private var progressJob: Job? = null

    private val repository: MusicRepository by lazy {
        MusicRepository(RetrofitClient.getApiService())
    }

    private val serviceConnection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, binder: IBinder?) {
            service = (binder as MusicPlaybackService.LocalBinder).getService()
            isBound = true
            MusicPlaybackService.playerStateListener = object : MusicPlaybackService.PlayerStateListener {
                override fun onPlayerStateChanged(state: PlayerState?, isPlaying: Boolean, currentPositionMs: Long) {
                    _playerState.postValue(state)
                    _isPlaying.postValue(isPlaying)
                    _currentPositionMs.postValue(currentPositionMs)
                    service?.durationMs?.let { _durationMs.postValue(it) }
                }

                override fun onError(message: String) {
                    _errorMessage.postValue(message)
                }
            }
            // Load current player state from server
            loadCurrentState()
            startProgressUpdates()
        }

        override fun onServiceDisconnected(name: ComponentName?) {
            isBound = false
            service = null
        }
    }

    fun bindService(context: Context) {
        val intent = Intent(context, MusicPlaybackService::class.java)
        context.startService(intent)
        context.bindService(intent, serviceConnection, Context.BIND_AUTO_CREATE)
    }

    fun unbindService(context: Context) {
        if (isBound) {
            MusicPlaybackService.playerStateListener = null
            context.unbindService(serviceConnection)
            isBound = false
        }
        progressJob?.cancel()
    }

    private fun startProgressUpdates() {
        progressJob?.cancel()
        progressJob = viewModelScope.launch {
            while (isActive) {
                service?.let { svc ->
                    if (svc.isPlaying) {
                        _currentPositionMs.postValue(svc.currentPositionMs)
                        _durationMs.postValue(svc.durationMs)
                    }
                }
                delay(500)
            }
        }
    }

    fun loadCurrentState() {
        viewModelScope.launch {
            try {
                val state = repository.getCurrentPlayerState()
                _playerState.postValue(state)
                if (state?.currentTrack != null && service != null) {
                    // Only load into player if service doesn't already have a track playing
                    val svc = service ?: return@launch
                    if (svc.currentPlayerState == null) {
                        svc.loadPlayerState(state, playWhenReady = false)
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error loading player state", e)
                _errorMessage.postValue("Cannot connect to server. Please check settings.")
            }
        }
    }

    fun togglePlayback() {
        service?.togglePlayback()
    }

    fun playNext() {
        service?.skipToNext(false)
    }

    fun playPrevious() {
        service?.skipToPrevious()
    }

    fun seekTo(positionMs: Long) {
        service?.seekTo(positionMs)
    }

    fun toggleShuffle() {
        val currentState = _playerState.value ?: return
        viewModelScope.launch {
            try {
                val newState = repository.toggleShuffle(!currentState.shuffle)
                _playerState.postValue(newState)
                if (newState != null) {
                    service?.currentPlayerState?.let { svcState ->
                        if (svcState.currentTrack?.id == newState.currentTrack?.id) {
                            service?.loadPlayerState(newState, service!!.isPlaying)
                        }
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error toggling shuffle", e)
                _errorMessage.postValue("Failed to toggle shuffle: ${e.message}")
            }
        }
    }

    fun setLikeStatus(trackId: String, likeStatus: Int) {
        viewModelScope.launch {
            try {
                val newState = repository.setLikeStatus(trackId, likeStatus)
                _playerState.postValue(newState)
            } catch (e: Exception) {
                Log.e(TAG, "Error setting like status", e)
                _errorMessage.postValue("Failed to set like status: ${e.message}")
            }
        }
    }

    fun playAlbumOrTrackNow(item: Item, playlistId: String? = null) {
        viewModelScope.launch {
            _isLoading.postValue(true)
            try {
                val newState = repository.playAlbumOrTrackNow(item, playlistId)
                if (newState != null) {
                    _playerState.postValue(newState)
                    service?.loadPlayerState(newState, true)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error playing item", e)
                _errorMessage.postValue("Failed to play: ${e.message}")
            } finally {
                _isLoading.postValue(false)
            }
        }
    }

    fun playPlaylistNow(playlistId: String) {
        viewModelScope.launch {
            _isLoading.postValue(true)
            try {
                val newState = repository.playPlaylistNow(playlistId)
                if (newState != null) {
                    _playerState.postValue(newState)
                    service?.loadPlayerState(newState, true)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error playing playlist", e)
                _errorMessage.postValue("Failed to play playlist: ${e.message}")
            } finally {
                _isLoading.postValue(false)
            }
        }
    }

    fun clearError() {
        _errorMessage.postValue(null)
    }
}
