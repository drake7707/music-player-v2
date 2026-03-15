package com.drake7707.musicplayerv2.ui.addtoplaylist

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import androidx.navigation.fragment.findNavController
import androidx.navigation.fragment.navArgs
import androidx.recyclerview.widget.LinearLayoutManager
import android.app.Application
import com.drake7707.musicplayerv2.R
import com.drake7707.musicplayerv2.data.MusicRepository
import com.drake7707.musicplayerv2.data.api.RetrofitClient
import com.drake7707.musicplayerv2.data.api.models.Item
import com.drake7707.musicplayerv2.data.api.models.Playlist
import com.drake7707.musicplayerv2.databinding.FragmentAddToPlaylistBinding
import com.drake7707.musicplayerv2.ui.playlists.PlaylistsAdapter
import kotlinx.coroutines.launch

class AddToPlaylistViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = MusicRepository(RetrofitClient.getApiService())
    val playlists = MutableLiveData<List<Playlist>>(emptyList())
    val isLoading = MutableLiveData(false)
    val result = MutableLiveData<String?>()
    val error = MutableLiveData<String?>()

    fun loadPlaylists(item: Item) {
        isLoading.value = true
        viewModelScope.launch {
            try {
                playlists.postValue(repository.getPlaylists(asSelector = true, forItem = item))
            } catch (e: Exception) {
                error.postValue("Failed to load playlists: ${e.message}")
            } finally {
                isLoading.postValue(false)
            }
        }
    }

    fun addToPlaylist(item: Item, playlist: Playlist) {
        viewModelScope.launch {
            try {
                repository.addToPlaylist(item, playlist.id)
                result.postValue("Added to '${playlist.name}'")
            } catch (e: Exception) {
                error.postValue("Failed to add to playlist: ${e.message}")
            }
        }
    }

    fun removeFromPlaylist(item: Item, playlist: Playlist) {
        viewModelScope.launch {
            try {
                repository.removeFromPlaylist(item, playlist.id)
                result.postValue("Removed from '${playlist.name}'")
            } catch (e: Exception) {
                error.postValue("Failed to remove from playlist: ${e.message}")
            }
        }
    }
}

class AddToPlaylistFragment : Fragment() {

    private var _binding: FragmentAddToPlaylistBinding? = null
    private val binding get() = _binding!!
    private val viewModel: AddToPlaylistViewModel by viewModels()
    private val args: AddToPlaylistFragmentArgs by navArgs()
    private lateinit var adapter: PlaylistsAdapter

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentAddToPlaylistBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        activity?.title = "Add to Playlist"
        val item = Item(args.itemId, args.itemName, args.isTrack)

        adapter = PlaylistsAdapter { playlist ->
            handlePlaylistSelected(item, playlist)
        }
        binding.recyclerView.layoutManager = LinearLayoutManager(requireContext())
        binding.recyclerView.adapter = adapter

        viewModel.playlists.observe(viewLifecycleOwner) { playlists ->
            adapter.submitList(playlists)
        }

        viewModel.isLoading.observe(viewLifecycleOwner) { loading ->
            binding.progressBar.visibility = if (loading) View.VISIBLE else View.GONE
        }

        viewModel.result.observe(viewLifecycleOwner) { msg ->
            if (!msg.isNullOrEmpty()) {
                Toast.makeText(requireContext(), msg, Toast.LENGTH_SHORT).show()
                viewModel.result.value = null
                findNavController().navigateUp()
            }
        }

        viewModel.error.observe(viewLifecycleOwner) { err ->
            if (!err.isNullOrEmpty()) {
                Toast.makeText(requireContext(), err, Toast.LENGTH_LONG).show()
                viewModel.error.value = null
            }
        }

        viewModel.loadPlaylists(item)
    }

    private fun handlePlaylistSelected(item: Item, playlist: Playlist) {
        // If already on playlist, offer to remove; otherwise add
        val alreadyOn = playlist.alreadyOnPlaylistCount > 0
        if (alreadyOn) {
            androidx.appcompat.app.AlertDialog.Builder(requireContext())
                .setTitle("Remove from playlist?")
                .setMessage("'${item.name}' is already on '${playlist.name}'. Remove it?")
                .setPositiveButton("Remove") { _, _ -> viewModel.removeFromPlaylist(item, playlist) }
                .setNegativeButton("Add anyway") { _, _ -> viewModel.addToPlaylist(item, playlist) }
                .setNeutralButton("Cancel", null)
                .show()
        } else {
            viewModel.addToPlaylist(item, playlist)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
