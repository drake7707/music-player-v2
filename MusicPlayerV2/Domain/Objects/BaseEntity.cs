using Dapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MusicPlayerV2.Domain.Objects
{
    public class BaseEntity
    {
        [Key]
        public int Id { get; set; }
    }
}
