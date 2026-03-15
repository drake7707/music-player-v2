package com.drake7707.musicplayerv2.data

import com.drake7707.musicplayerv2.data.api.ApiService
import com.drake7707.musicplayerv2.data.api.models.*

class MusicRepository(private val api: ApiService) {

    suspend fun getCurrentPlayerState(): PlayerState? {
        return api.getCurrentPlayerState().player
    }

    suspend fun getCurrentTrackId(): String? {
        return api.getCurrentTrackId().trackId
    }

    suspend fun nextTrack(currentTrackId: String, playedToEnd: Boolean): PlayerState? {
        return api.nextTrack(NextTrackRequest(currentTrackId, playedToEnd)).player
    }

    suspend fun previousTrack(currentTrackId: String): PlayerState? {
        return api.previousTrack(PreviousTrackRequest(currentTrackId)).player
    }

    suspend fun toggleShuffle(shuffle: Boolean): PlayerState? {
        return api.toggleShuffle(ToggleShuffleRequest(shuffle)).player
    }

    suspend fun setLikeStatus(trackId: String, likeStatus: Int): PlayerState? {
        return api.setLikeStatus(SetLikeStatusRequest(trackId, likeStatus)).player
    }

    suspend fun updatePlayerPlayingStatus(trackId: String, isPlaying: Boolean) {
        api.updatePlayerPlayingStatus(UpdatePlayerPlayingStatusRequest(trackId, isPlaying))
    }

    suspend fun playAlbumOrTrackNow(item: Item, playlistId: String? = null): PlayerState? {
        return api.playAlbumOrTrackNow(PlayAlbumOrTrackRequest(item, playlistId)).player
    }

    suspend fun playPlaylistNow(playlistId: String): PlayerState? {
        return api.playPlaylistNow(PlayPlaylistRequest(playlistId)).player
    }

    suspend fun playAlbumOrTrackAfterCurrentTrack(item: Item, playlistId: String? = null) {
        api.playAlbumOrTrackAfterCurrentTrack(PlayAlbumOrTrackRequest(item, playlistId))
    }

    suspend fun getDetails(trackId: String): TrackDetails? {
        return api.getDetails(trackId).details
    }

    suspend fun getPlaylists(asSelector: Boolean = false, forItem: Item? = null): List<Playlist> {
        return api.getPlaylists(
            asSelector = asSelector,
            forItemId = forItem?.id,
            forItemIsTrack = forItem?.isTrack
        ).playlists
    }

    suspend fun addPlaylist(playlist: Playlist) {
        api.addPlaylist(AddPlaylistRequest(playlist))
    }

    suspend fun removePlaylist(playlist: Playlist) {
        api.removePlaylist(RemovePlaylistRequest(playlist))
    }

    suspend fun addToPlaylist(item: Item, playlistId: String) {
        api.addToPlaylist(AddToPlaylistRequest(item, playlistId))
    }

    suspend fun removeFromPlaylist(item: Item, playlistId: String) {
        api.removeFromPlaylist(AddToPlaylistRequest(item, playlistId))
    }

    suspend fun getAlbumsOrTracks(
        filter: String = "",
        sortBy: String = "name",
        forPlaylistId: String? = null,
        offset: Int = 0,
        size: Int = 50
    ): GetAlbumsOrTracksResult {
        return api.getAlbumsOrTracks(filter, sortBy, forPlaylistId, offset, size)
    }

    suspend fun getTracks(
        filter: String = "",
        albumId: String,
        forPlaylistId: String? = null,
        offset: Int = 0,
        size: Int = 50
    ): GetAlbumsOrTracksResult {
        return api.getTracks(filter, albumId, forPlaylistId, offset, size)
    }
}
