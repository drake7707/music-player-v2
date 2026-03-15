package com.drake7707.musicplayerv2.ui.playlists

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.widget.PopupMenu
import android.view.ViewGroup
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.drake7707.musicplayerv2.R
import com.drake7707.musicplayerv2.data.api.models.Playlist
import com.drake7707.musicplayerv2.databinding.FragmentPlaylistsBinding
import com.drake7707.musicplayerv2.ui.SharedPlayerViewModel

class PlaylistsFragment : Fragment() {

    private var _binding: FragmentPlaylistsBinding? = null
    private val binding get() = _binding!!
    private val viewModel: PlaylistsViewModel by viewModels()
    private val sharedViewModel: SharedPlayerViewModel by activityViewModels()
    private lateinit var adapter: PlaylistsAdapter

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentPlaylistsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupRecyclerView()
        setupFab()
        observeViewModel()
        viewModel.loadPlaylists()
    }

    private fun setupRecyclerView() {
        adapter = PlaylistsAdapter(
            onItemClick = { playlist -> showPlaylistActions(playlist, null) },
            onOverflowClick = { playlist, anchor -> showPlaylistActions(playlist, anchor) }
        )
        binding.recyclerView.layoutManager = LinearLayoutManager(requireContext())
        binding.recyclerView.adapter = adapter

        binding.swipeRefresh.setOnRefreshListener {
            viewModel.loadPlaylists()
        }
    }

    private fun setupFab() {
        binding.fabNewPlaylist.setOnClickListener {
            showCreatePlaylistDialog()
        }
    }

    private fun showPlaylistActions(playlist: Playlist, anchor: View?) {
        val isSpecialPlaylist = playlist.id == "0" || playlist.id == "-1"
        if (anchor != null) {
            val popup = PopupMenu(requireContext(), anchor)
            popup.menuInflater.inflate(R.menu.menu_playlist_item, popup.menu)
            popup.menu.findItem(R.id.action_delete)?.isVisible = !isSpecialPlaylist
            popup.setOnMenuItemClickListener { item ->
                when (item.itemId) {
                    R.id.action_browse_tracks -> {
                        navigateToBrowse(playlist)
                        true
                    }
                    R.id.action_play_now -> {
                        sharedViewModel.playPlaylistNow(playlist.id)
                        findNavController().navigate(R.id.playerFragment)
                        true
                    }
                    R.id.action_delete -> {
                        confirmDelete(playlist)
                        true
                    }
                    else -> false
                }
            }
            popup.show()
        } else {
            navigateToBrowse(playlist)
        }
    }

    private fun navigateToBrowse(playlist: Playlist) {
        val action = PlaylistsFragmentDirections.actionPlaylistsFragmentToBrowseFragment(
            albumId = "",
            playlistId = playlist.id,
            title = playlist.name
        )
        findNavController().navigate(action)
    }

    private fun confirmDelete(playlist: Playlist) {
        AlertDialog.Builder(requireContext())
            .setTitle("Delete Playlist")
            .setMessage("Delete '${playlist.name}'?")
            .setPositiveButton("Delete") { _, _ -> viewModel.deletePlaylist(playlist) }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun showCreatePlaylistDialog() {
        val input = android.widget.EditText(requireContext())
        input.hint = "Playlist name"
        AlertDialog.Builder(requireContext())
            .setTitle("New Playlist")
            .setView(input)
            .setPositiveButton("Create") { _, _ ->
                val name = input.text.toString().trim()
                if (name.isNotEmpty()) viewModel.createPlaylist(name)
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun observeViewModel() {
        viewModel.playlists.observe(viewLifecycleOwner) { playlists ->
            adapter.submitList(playlists)
            binding.tvEmpty.visibility = if (playlists.isEmpty()) View.VISIBLE else View.GONE
        }

        viewModel.isLoading.observe(viewLifecycleOwner) { loading ->
            binding.swipeRefresh.isRefreshing = loading
        }

        viewModel.error.observe(viewLifecycleOwner) { error ->
            if (!error.isNullOrEmpty()) {
                Toast.makeText(requireContext(), error, Toast.LENGTH_LONG).show()
                viewModel.clearError()
            }
        }

        viewModel.success.observe(viewLifecycleOwner) { msg ->
            if (!msg.isNullOrEmpty()) {
                Toast.makeText(requireContext(), msg, Toast.LENGTH_SHORT).show()
                viewModel.clearSuccess()
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
