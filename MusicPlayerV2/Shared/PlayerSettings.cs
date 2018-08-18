using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MusicPlayerV2.Shared
{
    public class PlayerSettings
    {
        public string RootDirectory { get; set; }

        public string DatabasePath { get; set; }
        public string CoverDatabasePath { get; set; }

        public string LastFMApiKey { get; set; }
        public string LastFMApiSecret { get; set; }
        public string LastFMSessionKey { get; set; }
    }
}
