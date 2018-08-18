using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MusicPlayerV2.Domain.Objects
{
    public class Album : BaseEntity
    {
        public string Name { get; set; }

        public int SmallCoverId { get; set; }

        public string Artists { get; set; }
    }
}
