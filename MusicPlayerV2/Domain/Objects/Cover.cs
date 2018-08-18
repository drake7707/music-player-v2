using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MusicPlayerV2.Domain.Objects
{
    public class Cover : BaseEntity
    {
        public byte[] Data { get; set; }
    }
}
