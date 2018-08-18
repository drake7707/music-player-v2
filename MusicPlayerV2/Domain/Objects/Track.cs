using MusicPlayerV2.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MusicPlayerV2.Domain.Objects
{
    public class Track : BaseEntity
    {
        public string Title { get; set; }

        public string Album { get; set; }

        public int AlbumId { get; set; }

        public string Artists { get; set; }

        public int TrackNr { get; set; }
        public int DiscNr { get; set; }

        public string Genres { get; set; }

        public string Filename { get; set; }

        public double Duration { get; set; }

        public int NrPlayed { get; set; }

        public int NrPlayedToEnd { get; set; }

        public DateTime AddedOn { get; set; }

        public DateTime LastPlayed { get; set; }

        public LikeStatus LikeStatus { get; set; }
        
    }
}
