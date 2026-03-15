package com.drake7707.musicplayerv2.data.api.models

import com.google.gson.annotations.SerializedName

data class Track(
    @SerializedName("id") val id: String,
    @SerializedName("title") val title: String,
    @SerializedName("artists") val artists: List<String>,
    @SerializedName("album") val album: String,
    @SerializedName("track") val trackNr: Int,
    @SerializedName("artImage") val artImage: String?,
    @SerializedName("liked") val liked: Int, // 0=None, 1=Liked, 2=Disliked
    @SerializedName("url") val url: String
)

data class PlayerState(
    @SerializedName("currentTrack") val currentTrack: Track?,
    @SerializedName("shuffle") val shuffle: Boolean
)

data class Playlist(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("isCurrent") val isCurrent: Boolean,
    @SerializedName("nrOfTracks") val nrOfTracks: Int,
    @SerializedName("alreadyOnPlaylistCount") val alreadyOnPlaylistCount: Int = 0,
    @SerializedName("forItemSize") val forItemSize: Int = 0
)

data class AlbumOrTrackItem(
    @SerializedName("id") val id: Int,
    @SerializedName("name") val name: String,
    @SerializedName("artists") val artists: String?,
    @SerializedName("coverId") val coverId: Int,
    @SerializedName("artImage") val artImage: String?,
    @SerializedName("isTrack") val isTrack: Boolean
)

data class TrackDetails(
    @SerializedName("id") val id: String,
    @SerializedName("title") val title: String,
    @SerializedName("artists") val artists: List<String>,
    @SerializedName("album") val album: String,
    @SerializedName("trackNr") val trackNr: Int,
    @SerializedName("genres") val genres: List<String>,
    @SerializedName("nrPlayed") val nrPlayed: Int,
    @SerializedName("nrPlayedToEnd") val nrPlayedToEnd: Int,
    @SerializedName("lastPlayed") val lastPlayed: String?,
    @SerializedName("addedOn") val addedOn: String?,
    @SerializedName("liked") val liked: Int,
    @SerializedName("lastScrobbles") val lastScrobbles: List<TrackScrobble>
)

data class TrackScrobble(
    @SerializedName("on") val on: String,
    @SerializedName("playedToEnd") val playedToEnd: Boolean
)

data class Item(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("isTrack") val isTrack: Boolean
)

// API Response wrappers
data class GetPlayerStateResult(
    @SerializedName("player") val player: PlayerState?
)

data class GetCurrentTrackIdResult(
    @SerializedName("trackId") val trackId: String?
)

data class GetPlaylistsResult(
    @SerializedName("playlists") val playlists: List<Playlist>
)

data class GetAlbumsOrTracksResult(
    @SerializedName("items") val items: List<AlbumOrTrackItem>,
    @SerializedName("totalCount") val totalCount: Int
)

data class GetDetailsResult(
    @SerializedName("details") val details: TrackDetails?
)

data class Result(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String?
)

// Request bodies
data class NextTrackRequest(
    @SerializedName("currentTrackId") val currentTrackId: String,
    @SerializedName("playedToEnd") val playedToEnd: Boolean
)

data class PreviousTrackRequest(
    @SerializedName("currentTrackId") val currentTrackId: String
)

data class ToggleShuffleRequest(
    @SerializedName("shuffle") val shuffle: Boolean
)

data class SetLikeStatusRequest(
    @SerializedName("trackId") val trackId: String,
    @SerializedName("likeStatus") val likeStatus: Int
)

data class UpdatePlayerPlayingStatusRequest(
    @SerializedName("trackId") val trackId: String,
    @SerializedName("isPlaying") val isPlaying: Boolean
)

data class PlayAlbumOrTrackRequest(
    @SerializedName("item") val item: Item,
    @SerializedName("playlistId") val playlistId: String? = null
)

data class PlayPlaylistRequest(
    @SerializedName("playlistId") val playlistId: String
)

data class AddToPlaylistRequest(
    @SerializedName("item") val item: Item,
    @SerializedName("playlistId") val playlistId: String
)

data class AddPlaylistRequest(
    @SerializedName("playlist") val playlist: Playlist
)

data class RemovePlaylistRequest(
    @SerializedName("playlist") val playlist: Playlist
)
