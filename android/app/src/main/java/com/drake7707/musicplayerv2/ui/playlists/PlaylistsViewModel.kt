package com.drake7707.musicplayerv2.ui.playlists

import android.app.Application
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.drake7707.musicplayerv2.data.MusicRepository
import com.drake7707.musicplayerv2.data.api.RetrofitClient
import com.drake7707.musicplayerv2.data.api.models.Playlist
import kotlinx.coroutines.launch

class PlaylistsViewModel(application: Application) : AndroidViewModel(application) {

    companion object {
        private const val TAG = "PlaylistsViewModel"
    }

    private val repository = MusicRepository(RetrofitClient.getApiService())

    private val _playlists = MutableLiveData<List<Playlist>>(emptyList())
    val playlists: LiveData<List<Playlist>> = _playlists

    private val _isLoading = MutableLiveData(false)
    val isLoading: LiveData<Boolean> = _isLoading

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error

    private val _success = MutableLiveData<String?>()
    val success: LiveData<String?> = _success

    fun loadPlaylists() {
        _isLoading.value = true
        viewModelScope.launch {
            try {
                val playlists = repository.getPlaylists()
                _playlists.postValue(playlists)
            } catch (e: Exception) {
                Log.e(TAG, "Error loading playlists", e)
                _error.postValue("Failed to load playlists: ${e.message}")
            } finally {
                _isLoading.postValue(false)
            }
        }
    }

    fun createPlaylist(name: String) {
        if (name.isBlank()) {
            _error.value = "Playlist name cannot be empty"
            return
        }
        viewModelScope.launch {
            try {
                val playlist = Playlist(id = "0", name = name, isCurrent = false, nrOfTracks = 0)
                repository.addPlaylist(playlist)
                _success.postValue("Playlist '$name' created")
                loadPlaylists()
            } catch (e: Exception) {
                Log.e(TAG, "Error creating playlist", e)
                _error.postValue("Failed to create playlist: ${e.message}")
            }
        }
    }

    fun deletePlaylist(playlist: Playlist) {
        viewModelScope.launch {
            try {
                repository.removePlaylist(playlist)
                _success.postValue("Playlist '${playlist.name}' deleted")
                loadPlaylists()
            } catch (e: Exception) {
                Log.e(TAG, "Error deleting playlist", e)
                _error.postValue("Failed to delete playlist: ${e.message}")
            }
        }
    }

    fun clearError() { _error.value = null }
    fun clearSuccess() { _success.value = null }
}
