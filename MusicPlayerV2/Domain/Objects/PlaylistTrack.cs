using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MusicPlayerV2.Domain.Objects
{
    public class PlaylistTrack
    {
        public int PlaylistId { get; set; }
        public int TrackId { get; set; }
    }
}
