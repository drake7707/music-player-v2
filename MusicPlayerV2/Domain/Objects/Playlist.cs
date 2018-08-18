using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MusicPlayerV2.Domain.Objects
{
    public class Playlist : BaseEntity
    {
        public string Name { get; set; }

        public int NrOfTracks { get; set; }


        public const int LIKED_ID = -1;
        public const int ALL_ID = 0;
    }

}
