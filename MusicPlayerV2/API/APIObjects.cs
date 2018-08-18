using MusicPlayerV2.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MusicPlayerV2.API
{
    public class Track
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string[] Artists { get; set; }
        public string Album { get; set; }
        public int TrackNr { get; set; }
        public string ArtImage { get; set; }
        public LikeStatus Liked { get; set; }

        public string Url { get; set; }
    }

    public class PlayerState
    {
        public Track CurrentTrack { get; set; }
        public bool Shuffle { get; set; }
    }


    public class Playlist
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public bool IsCurrent { get; set; }
        public int NrOfTracks { get; set; }
    }

    public class PlaylistForAddingItem : Playlist
    {
        public int AlreadyOnPlaylistCount { get; set; }
        public int ForItemSize { get; set; }
    }

    public class TrackDetails
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string[] Artists { get; set; }
        public string Album { get; set; }
        public int TrackNr { get; set; }

        public string[] Genres { get; set; }
        public int NrPlayed { get; set; }
        public int NrPlayedToEnd { get; set; }
        public DateTime? LastPlayed { get; set; }
        public DateTime? AddedOn { get; set; }

        public LikeStatus Liked { get; set; }

        public TrackScrobble[] LastScrobbles { get; set; }
    }


    public class TrackScrobble
    {
        public DateTime On { get; set; }
        public bool PlayedToEnd { get; set; }
    }
}
