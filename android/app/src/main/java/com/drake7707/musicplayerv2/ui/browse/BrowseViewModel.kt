package com.drake7707.musicplayerv2.ui.browse

import android.app.Application
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.drake7707.musicplayerv2.data.MusicRepository
import com.drake7707.musicplayerv2.data.api.RetrofitClient
import com.drake7707.musicplayerv2.data.api.models.AlbumOrTrackItem
import kotlinx.coroutines.launch

class BrowseViewModel(application: Application) : AndroidViewModel(application) {

    companion object {
        private const val TAG = "BrowseViewModel"
        const val PAGE_SIZE = 50
    }

    private val repository = MusicRepository(RetrofitClient.getApiService())

    private val _items = MutableLiveData<List<AlbumOrTrackItem>>(emptyList())
    val items: LiveData<List<AlbumOrTrackItem>> = _items

    private val _isLoading = MutableLiveData(false)
    val isLoading: LiveData<Boolean> = _isLoading

    private val _hasMoreItems = MutableLiveData(false)
    val hasMoreItems: LiveData<Boolean> = _hasMoreItems

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error

    private val _title = MutableLiveData("Browse")
    val title: LiveData<String> = _title

    private val _activeSortBy = MutableLiveData("name")
    val activeSortBy: LiveData<String> = _activeSortBy

    var currentFilter = ""
        private set
    var currentSortBy = "name"
        private set
    var currentPlaylistId: String? = null
        private set
    var currentAlbumId: String? = null
        private set

    private var totalCount = 0
    private var currentOffset = 0

    fun setContext(albumId: String? = null, playlistId: String? = null, title: String = "Browse") {
        currentAlbumId = albumId
        currentPlaylistId = playlistId
        _title.value = title
        loadItems(reset = true)
    }

    fun search(filter: String) {
        currentFilter = filter
        loadItems(reset = true)
    }

    fun setSortBy(sortBy: String) {
        currentSortBy = sortBy
        _activeSortBy.value = sortBy
        loadItems(reset = true)
    }

    fun loadMore() {
        if (!(_hasMoreItems.value ?: false)) return
        loadItems(reset = false)
    }

    fun refresh() {
        loadItems(reset = true)
    }

    private fun loadItems(reset: Boolean) {
        if (_isLoading.value == true && !reset) return

        if (reset) {
            currentOffset = 0
            totalCount = 0
        }

        _isLoading.value = true
        viewModelScope.launch {
            try {
                val result = if (currentAlbumId != null) {
                    // Browsing tracks within an album
                    repository.getTracks(
                        filter = currentFilter,
                        albumId = currentAlbumId!!,
                        forPlaylistId = currentPlaylistId,
                        offset = currentOffset,
                        size = PAGE_SIZE
                    )
                } else {
                    // Browsing albums/tracks
                    repository.getAlbumsOrTracks(
                        filter = currentFilter,
                        sortBy = currentSortBy,
                        forPlaylistId = currentPlaylistId,
                        offset = currentOffset,
                        size = PAGE_SIZE
                    )
                }

                totalCount = result.totalCount
                val newItems = result.items

                if (reset) {
                    _items.postValue(newItems)
                } else {
                    val combined = (_items.value ?: emptyList()) + newItems
                    _items.postValue(combined)
                }

                currentOffset += newItems.size
                _hasMoreItems.postValue(currentOffset < totalCount)
            } catch (e: Exception) {
                Log.e(TAG, "Error loading items", e)
                _error.postValue("Failed to load: ${e.message}")
            } finally {
                _isLoading.postValue(false)
            }
        }
    }

    fun clearError() {
        _error.value = null
    }
}
