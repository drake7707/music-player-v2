using MusicPlayerV2.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MusicPlayerV2.API
{



    public class Request
    {

    }

    public class PreviousTrackRequest : Request
    {
        public string CurrentTrackId { get; set; }
    }

    public class NextTrackRequest : Request
    {
        public string CurrentTrackId { get; set; }
        public bool PlayedToEnd { get; set; }
    }

    public class ToggleShuffleRequest : Request
    {
        public bool Shuffle { get; set; }
    }

    public class SetLikeStatusRequest : Request
    {
        public string TrackId { get; set; }
        public LikeStatus LikeStatus { get; set; }
    }

    public class UpdatePlayerPlayingStatusRequest : Request
    {
        public string TrackId { get; set; }
        public bool IsPlaying { get; set; }
    }

    public class PlayAlbumOrTrackRequest : Request
    {
        public Item Item { get; set; }
        public string PlaylistId { get; set; }
    }

    public class PlayPlaylistRequest : Request
    {
        public string PlaylistId { get; set; }
    }

    public class GetDetailsRequest : Request
    {
        public string TrackId { get; set; }
    }

    public class GetAlbumsOrTracksRequest : Request
    {
        public string Filter { get; set; }
        public string SortBy { get; set; }

        public string ForPlaylistId { get; set; }
        public int Offset { get; set; } = 0;
        public int Size { get; set; } = int.MaxValue;
    }


    public class GetTracksRequest : Request
    {
        public string Filter { get; set; }
        public string AlbumId { get; set; }
        public string ForPlaylistId { get; set; }

        public int Offset { get; set; } = 0;
        public int Size { get; set; } = int.MaxValue;
    }

    public class GetPlaylistsRequest : Request
    {
        public bool AsSelector { get; set; }
        public int ForItemId { get; set; }
        public bool ForItemIsTrack { get; set; }
    }

    public class AddPlaylistRequest : Request
    {
        public Playlist Playlist { get; set; }
    }

    public class RemovePlaylistRequest : Request
    {
        public Playlist Playlist { get; set; }
    }

    public class AddToPlaylistRequest : Request
    {
        public Item Item { get; set; }
        public string PlaylistId { get; set; }
    }


    public class RemoveFromPlaylistRequest : Request
    {
        public Item Item { get; set; }
        public string PlaylistId { get; set; }
    }

    public class Result
    {
        public bool Success { get; set; }
        public string Message { get; set; }
    }

    public class GetPlayerStateResult : Result
    {
        public PlayerState Player { get; set; }
    }

    public class GetPlaylistsResult : Result
    {
        public Playlist[] Playlists { get; set; }
    }

    public class GetAlbumsOrTracksResult : Result
    {
        public AlbumOrTrackItem[] Items { get; set; }
        public int TotalCount { get; set; }
    }

    public class GetTracksResult : Result
    {
        public AlbumOrTrackItem[] Items { get; set; }
        public int TotalCount { get; set; }
    }

    public class GetDetailsResult : Result
    {
        public TrackDetails Details { get; set; }
    }


    public class PreviousTrackResult : GetPlayerStateResult
    {

    }

    public class NextTrackResult : GetPlayerStateResult
    {

    }

    public class ToggleShuffleResult : GetPlayerStateResult
    {

    }

    public class SetLikeStatusRequestResult : GetPlayerStateResult
    {

    }

    public class PlayNowResult : GetPlayerStateResult
    {

    }

    public class GetCurrentTrackIdResult : Result
    {
        public string TrackId { get; set; }
    }
}
