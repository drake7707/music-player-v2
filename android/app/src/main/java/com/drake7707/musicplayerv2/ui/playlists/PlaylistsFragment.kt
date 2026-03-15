package com.drake7707.musicplayerv2.ui.playlists

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
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
        adapter = PlaylistsAdapter { playlist -> showPlaylistActions(playlist) }
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

    private fun showPlaylistActions(playlist: Playlist) {
        val isSpecialPlaylist = playlist.id == "0" || playlist.id == "-1"

        val options = mutableListOf<String>().apply {
            add("Browse tracks")
            add("Play now")
            if (!isSpecialPlaylist) {
                add("Delete")
            }
        }

        AlertDialog.Builder(requireContext())
            .setTitle(playlist.name)
            .setItems(options.toTypedArray()) { _, which ->
                when (options[which]) {
                    "Browse tracks" -> {
                        val action = PlaylistsFragmentDirections.actionPlaylistsFragmentToBrowseFragment(
                            albumId = "",
                            playlistId = playlist.id,
                            title = playlist.name
                        )
                        findNavController().navigate(action)
                    }
                    "Play now" -> {
                        sharedViewModel.playPlaylistNow(playlist.id)
                        findNavController().navigate(R.id.playerFragment)
                    }
                    "Delete" -> {
                        confirmDelete(playlist)
                    }
                }
            }
            .show()
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
