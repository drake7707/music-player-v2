package com.drake7707.musicplayerv2.ui.player

import android.os.Bundle
import android.view.LayoutInflater
import android.view.Menu
import android.view.MenuInflater
import android.view.MenuItem
import android.view.View
import android.view.ViewGroup
import android.widget.SeekBar
import androidx.core.view.MenuProvider
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.Lifecycle
import androidx.navigation.fragment.findNavController
import com.bumptech.glide.Glide
import com.bumptech.glide.load.resource.drawable.DrawableTransitionOptions
import com.drake7707.musicplayerv2.R
import com.drake7707.musicplayerv2.data.api.RetrofitClient
import com.drake7707.musicplayerv2.data.api.models.PlayerState
import com.drake7707.musicplayerv2.databinding.FragmentPlayerBinding
import com.drake7707.musicplayerv2.ui.SharedPlayerViewModel

private const val LIKE_STATUS_NONE = 0
private const val LIKE_STATUS_LIKED = 1

class PlayerFragment : Fragment() {

    private var _binding: FragmentPlayerBinding? = null
    private val binding get() = _binding!!
    private val sharedViewModel: SharedPlayerViewModel by activityViewModels()

    private var isSeekingByUser = false

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentPlayerBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupMenuProvider()
        setupClickListeners()
        observeViewModel()
    }

    private fun setupMenuProvider() {
        requireActivity().addMenuProvider(object : MenuProvider {
            override fun onCreateMenu(menu: Menu, menuInflater: MenuInflater) {
                menuInflater.inflate(R.menu.player_menu, menu)
            }

            override fun onMenuItemSelected(menuItem: MenuItem): Boolean {
                return when (menuItem.itemId) {
                    R.id.action_browse -> {
                        findNavController().navigate(R.id.action_playerFragment_to_browseFragment)
                        true
                    }
                    R.id.action_playlists -> {
                        findNavController().navigate(R.id.action_playerFragment_to_playlistsFragment)
                        true
                    }
                    R.id.action_details -> {
                        val trackId = sharedViewModel.playerState.value?.currentTrack?.id
                        if (trackId != null) {
                            val action = PlayerFragmentDirections.actionPlayerFragmentToTrackDetailsFragment(trackId)
                            findNavController().navigate(action)
                        }
                        true
                    }
                    R.id.action_add_to_playlist -> {
                        val track = sharedViewModel.playerState.value?.currentTrack
                        if (track != null) {
                            val action = PlayerFragmentDirections.actionPlayerFragmentToAddToPlaylistFragment(
                                track.id, track.title, true
                            )
                            findNavController().navigate(action)
                        }
                        true
                    }
                    R.id.action_settings -> {
                        findNavController().navigate(R.id.action_playerFragment_to_settingsFragment)
                        true
                    }
                    else -> false
                }
            }
        }, viewLifecycleOwner, Lifecycle.State.RESUMED)
    }

    private fun setupClickListeners() {
        binding.btnPlayPause.setOnClickListener {
            sharedViewModel.togglePlayback()
        }

        binding.btnNext.setOnClickListener {
            sharedViewModel.playNext()
        }

        binding.btnPrevious.setOnClickListener {
            sharedViewModel.playPrevious()
        }

        binding.btnShuffle.setOnClickListener {
            sharedViewModel.toggleShuffle()
        }

        binding.btnLike.setOnClickListener {
            val track = sharedViewModel.playerState.value?.currentTrack ?: return@setOnClickListener
            val newStatus = if (track.liked == LIKE_STATUS_LIKED) LIKE_STATUS_NONE else LIKE_STATUS_LIKED
            sharedViewModel.setLikeStatus(track.id, newStatus)
        }

        binding.swipeRefresh.setOnRefreshListener {
            sharedViewModel.loadCurrentState()
        }

        binding.seekBar.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                if (fromUser) {
                    val durationMs = sharedViewModel.durationMs.value ?: 0L
                    val positionMs = (progress.toLong() * durationMs) / 1000L
                    binding.tvCurrentTime.text = formatDuration(positionMs)
                }
            }

            override fun onStartTrackingTouch(seekBar: SeekBar?) {
                isSeekingByUser = true
            }

            override fun onStopTrackingTouch(seekBar: SeekBar?) {
                isSeekingByUser = false
                val progress = seekBar?.progress ?: 0
                val durationMs = sharedViewModel.durationMs.value ?: 0L
                val positionMs = (progress.toLong() * durationMs) / 1000L
                sharedViewModel.seekTo(positionMs)
            }
        })
    }

    private fun observeViewModel() {
        sharedViewModel.playerState.observe(viewLifecycleOwner) { state ->
            updateUI(state)
        }

        sharedViewModel.isPlaying.observe(viewLifecycleOwner) { playing ->
            binding.btnPlayPause.setImageResource(
                if (playing) R.drawable.ic_pause else R.drawable.ic_play
            )
        }

        sharedViewModel.currentPositionMs.observe(viewLifecycleOwner) { posMs ->
            if (!isSeekingByUser) {
                val durationMs = sharedViewModel.durationMs.value ?: 0L
                binding.tvCurrentTime.text = formatDuration(posMs)
                if (durationMs > 0) {
                    val progress = ((posMs.toDouble() / durationMs) * 1000).toInt()
                    binding.seekBar.progress = progress.coerceIn(0, 1000)
                }
            }
        }

        sharedViewModel.durationMs.observe(viewLifecycleOwner) { durationMs ->
            binding.tvTotalTime.text = formatDuration(durationMs)
        }

        sharedViewModel.isLoading.observe(viewLifecycleOwner) { loading ->
            binding.progressLoading.visibility = if (loading) View.VISIBLE else View.GONE
            if (!loading) binding.swipeRefresh.isRefreshing = false
        }
    }

    private fun updateUI(state: PlayerState?) {
        val track = state?.currentTrack

        if (track == null) {
            binding.tvTitle.text = getString(R.string.no_track_playing)
            binding.tvArtists.text = ""
            binding.tvAlbum.text = ""
            binding.imgArt.setImageResource(R.drawable.ic_music_note)
            binding.btnLike.setImageResource(R.drawable.ic_heart_empty)
            binding.btnShuffle.alpha = 0.5f
            return
        }

        binding.tvTitle.text = track.title
        binding.tvArtists.text = track.artists.joinToString(", ")
        binding.tvAlbum.text = track.album

        // Load album art
        val artUrl = if (!track.artImage.isNullOrEmpty()) {
            if (track.artImage.startsWith("http")) track.artImage
            else RetrofitClient.getBaseUrl().trimEnd('/') + track.artImage
        } else null

        if (artUrl != null) {
            Glide.with(this)
                .load(artUrl)
                .transition(DrawableTransitionOptions.withCrossFade())
                .placeholder(R.drawable.ic_music_note)
                .error(R.drawable.ic_music_note)
                .into(binding.imgArt)
        } else {
            binding.imgArt.setImageResource(R.drawable.ic_music_note)
        }

        // Like button
        binding.btnLike.setImageResource(
            if (track.liked == LIKE_STATUS_LIKED) R.drawable.ic_heart else R.drawable.ic_heart_empty
        )

        // Shuffle
        binding.btnShuffle.alpha = if (state.shuffle) 1.0f else 0.5f
    }

    private fun formatDuration(ms: Long): String {
        val totalSeconds = ms / 1000
        val minutes = totalSeconds / 60
        val seconds = totalSeconds % 60
        return String.format("%d:%02d", minutes, seconds)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
