package com.drake7707.musicplayerv2.ui.browse

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.EditorInfo
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import androidx.navigation.fragment.navArgs
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.RecyclerView
import com.drake7707.musicplayerv2.R
import com.drake7707.musicplayerv2.data.api.RetrofitClient
import com.drake7707.musicplayerv2.data.api.models.AlbumOrTrackItem
import com.drake7707.musicplayerv2.data.api.models.Item
import com.drake7707.musicplayerv2.databinding.FragmentBrowseBinding
import com.drake7707.musicplayerv2.ui.SharedPlayerViewModel
import kotlinx.coroutines.launch

class BrowseFragment : Fragment() {

    private var _binding: FragmentBrowseBinding? = null
    private val binding get() = _binding!!

    private val viewModel: BrowseViewModel by viewModels()
    private val sharedViewModel: SharedPlayerViewModel by activityViewModels()
    private val args: BrowseFragmentArgs by navArgs()
    private lateinit var adapter: BrowseAdapter

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentBrowseBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupRecyclerView()
        setupSearch()
        setupSortButtons()
        observeViewModel()

        // Set context from navigation args
        val albumId = if (args.albumId.isNullOrEmpty()) null else args.albumId
        val playlistId = if (args.playlistId.isNullOrEmpty()) null else args.playlistId
        val title = args.title.ifEmpty { "Browse" }
        viewModel.setContext(albumId = albumId, playlistId = playlistId, title = title)
    }

    private fun setupRecyclerView() {
        adapter = BrowseAdapter(
            onItemClick = { item -> handleItemClick(item) },
            onPlayNow = { item ->
                sharedViewModel.playAlbumOrTrackNow(
                    Item(item.id.toString(), item.name, item.isTrack),
                    viewModel.currentPlaylistId
                )
            },
            onPlayNext = { item ->
                // Queue item to play after current
                lifecycleScope.launch {
                    try {
                        val repo = com.drake7707.musicplayerv2.data.MusicRepository(
                            RetrofitClient.getApiService()
                        )
                        repo.playAlbumOrTrackAfterCurrentTrack(
                            Item(item.id.toString(), item.name, item.isTrack),
                            viewModel.currentPlaylistId
                        )
                        Toast.makeText(requireContext(), "Queued: ${item.name}", Toast.LENGTH_SHORT).show()
                    } catch (e: Exception) {
                        Toast.makeText(requireContext(), "Failed to queue: ${e.message}", Toast.LENGTH_SHORT).show()
                    }
                }
            },
            onAddToPlaylist = { item ->
                val action = BrowseFragmentDirections.actionBrowseFragmentToAddToPlaylistFragment(
                    item.id.toString(), item.name, item.isTrack
                )
                findNavController().navigate(action)
            },
            onShowDetails = { item ->
                if (item.isTrack) {
                    val action = BrowseFragmentDirections.actionBrowseFragmentToTrackDetailsFragment(item.id.toString())
                    findNavController().navigate(action)
                }
            }
        )

        binding.recyclerView.layoutManager = LinearLayoutManager(requireContext())
        binding.recyclerView.adapter = adapter

        binding.swipeRefresh.setOnRefreshListener {
            viewModel.refresh()
        }

        // Infinite scroll - load more when near the end
        binding.recyclerView.addOnScrollListener(object : RecyclerView.OnScrollListener() {
            override fun onScrolled(recyclerView: RecyclerView, dx: Int, dy: Int) {
                super.onScrolled(recyclerView, dx, dy)
                val layoutManager = recyclerView.layoutManager as LinearLayoutManager
                val lastVisible = layoutManager.findLastVisibleItemPosition()
                val total = layoutManager.itemCount
                if (lastVisible >= total - 5 && viewModel.hasMoreItems.value == true) {
                    viewModel.loadMore()
                }
            }
        })
    }

    private fun setupSearch() {
        binding.etSearch.setOnEditorActionListener { _, actionId, _ ->
            if (actionId == EditorInfo.IME_ACTION_SEARCH) {
                viewModel.search(binding.etSearch.text.toString())
                true
            } else false
        }
        binding.btnSearch.setOnClickListener {
            viewModel.search(binding.etSearch.text.toString())
        }
        binding.btnClearSearch.setOnClickListener {
            binding.etSearch.setText("")
            viewModel.search("")
        }
    }

    private fun setupSortButtons() {
        binding.btnSortName.setOnClickListener { viewModel.setSortBy("name") }
        binding.btnSortArtist.setOnClickListener { viewModel.setSortBy("artist") }
        binding.btnSortDate.setOnClickListener { viewModel.setSortBy("dateAdded") }
    }

    private fun handleItemClick(item: AlbumOrTrackItem) {
        if (!item.isTrack) {
            // Navigate to album tracks
            val action = BrowseFragmentDirections.actionBrowseFragmentSelf(
                albumId = item.id.toString(),
                playlistId = viewModel.currentPlaylistId ?: "",
                title = item.name
            )
            findNavController().navigate(action)
        } else {
            // Navigate to track details
            val action = BrowseFragmentDirections.actionBrowseFragmentToTrackDetailsFragment(item.id.toString())
            findNavController().navigate(action)
        }
    }

    private fun observeViewModel() {
        viewModel.items.observe(viewLifecycleOwner) { items ->
            adapter.submitList(items)
            binding.tvEmpty.visibility = if (items.isEmpty() && viewModel.isLoading.value != true) View.VISIBLE else View.GONE
        }

        viewModel.isLoading.observe(viewLifecycleOwner) { loading ->
            binding.swipeRefresh.isRefreshing = loading && adapter.itemCount == 0
            binding.progressBarBottom.visibility = if (loading && adapter.itemCount > 0) View.VISIBLE else View.GONE
        }

        viewModel.hasMoreItems.observe(viewLifecycleOwner) { hasMore ->
            binding.btnLoadMore.visibility = if (hasMore) View.VISIBLE else View.GONE
        }

        viewModel.error.observe(viewLifecycleOwner) { error ->
            if (!error.isNullOrEmpty()) {
                Toast.makeText(requireContext(), error, Toast.LENGTH_LONG).show()
                viewModel.clearError()
            }
        }

        viewModel.title.observe(viewLifecycleOwner) { title ->
            activity?.title = title
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
