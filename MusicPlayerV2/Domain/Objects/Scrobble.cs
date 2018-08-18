using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MusicPlayerV2.Domain.Objects
{
    public class Scrobble : BaseEntity
    {
        public int TrackId { get; set; }

        public DateTime On { get; set; }

        public bool PlayedToEnd { get; set; }
    }
}
