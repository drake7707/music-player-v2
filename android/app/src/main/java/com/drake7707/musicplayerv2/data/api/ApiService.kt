package com.drake7707.musicplayerv2.data.api

import com.drake7707.musicplayerv2.data.api.models.*
import retrofit2.http.*

interface ApiService {

    // Player endpoints
    @GET("api/player/GetCurrentPlayerState")
    suspend fun getCurrentPlayerState(): GetPlayerStateResult

    @GET("api/player/GetCurrentTrackId")
    suspend fun getCurrentTrackId(): GetCurrentTrackIdResult

    @POST("api/player/NextTrack")
    suspend fun nextTrack(@Body request: NextTrackRequest): GetPlayerStateResult

    @POST("api/player/PreviousTrack")
    suspend fun previousTrack(@Body request: PreviousTrackRequest): GetPlayerStateResult

    @POST("api/player/ToggleShuffle")
    suspend fun toggleShuffle(@Body request: ToggleShuffleRequest): GetPlayerStateResult

    @POST("api/player/SetLikeStatus")
    suspend fun setLikeStatus(@Body request: SetLikeStatusRequest): GetPlayerStateResult

    @POST("api/player/UpdatePlayerPlayingStatus")
    suspend fun updatePlayerPlayingStatus(@Body request: UpdatePlayerPlayingStatusRequest): Result

    @POST("api/player/PlayAlbumOrTrackNow")
    suspend fun playAlbumOrTrackNow(@Body request: PlayAlbumOrTrackRequest): GetPlayerStateResult

    @POST("api/player/PlayPlaylistNow")
    suspend fun playPlaylistNow(@Body request: PlayPlaylistRequest): GetPlayerStateResult

    @POST("api/player/PlayAlbumOrTrackAfterCurrentTrack")
    suspend fun playAlbumOrTrackAfterCurrentTrack(@Body request: PlayAlbumOrTrackRequest): Result

    @GET("api/player/GetDetails")
    suspend fun getDetails(@Query("trackId") trackId: String): GetDetailsResult

    // Playlist endpoints
    @GET("api/playlist/GetPlaylists")
    suspend fun getPlaylists(
        @Query("asSelector") asSelector: Boolean = false,
        @Query("forItemId") forItemId: String? = null,
        @Query("forItemIsTrack") forItemIsTrack: Boolean? = null
    ): GetPlaylistsResult

    @POST("api/playlist/AddPlaylist")
    suspend fun addPlaylist(@Body request: AddPlaylistRequest): Result

    @POST("api/playlist/RemovePlaylist")
    suspend fun removePlaylist(@Body request: RemovePlaylistRequest): Result

    @POST("api/playlist/AddToPlaylist")
    suspend fun addToPlaylist(@Body request: AddToPlaylistRequest): Result

    @POST("api/playlist/RemoveFromPlaylist")
    suspend fun removeFromPlaylist(@Body request: AddToPlaylistRequest): Result

    @GET("api/playlist/GetAlbumsOrTracks")
    suspend fun getAlbumsOrTracks(
        @Query("filter") filter: String = "",
        @Query("sortBy") sortBy: String = "name",
        @Query("forPlaylistId") forPlaylistId: String? = null,
        @Query("offset") offset: Int = 0,
        @Query("size") size: Int = 50
    ): GetAlbumsOrTracksResult

    @GET("api/playlist/GetTracks")
    suspend fun getTracks(
        @Query("filter") filter: String = "",
        @Query("albumId") albumId: String,
        @Query("forPlaylistId") forPlaylistId: String? = null,
        @Query("offset") offset: Int = 0,
        @Query("size") size: Int = 50
    ): GetAlbumsOrTracksResult
}
