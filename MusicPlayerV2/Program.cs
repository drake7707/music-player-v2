using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MusicPlayerV2.Shared;
using MusicPlayerV2.Domain.Objects;

namespace MusicPlayerV2
{
    public class Program
    {
        public static void Main(string[] args)
        {
            //MigrateOldMusicCache();
            BuildWebHost(args).Run();
        }

        public static IWebHost BuildWebHost(string[] args)
        {
            return WebHost.CreateDefaultBuilder(args)
                .UseApplicationInsights()
                .UseKestrel()
                .UseUrls("http://*:5000/")
                .UseStartup<Startup>()
                .Build();
        }

        private static string oldDatabasePath = @"D:\oldmusiccache.db";
        private static string newDatabasePath = @"D:\musiccache.db";

        private static void MigrateOldMusicCache()
        {

            // configure to use sqlite
            Dapper.SimpleCRUD.SetDialect(Dapper.SimpleCRUD.Dialect.SQLite);

            using (DAL.DALManager mgr = new DAL.DALManager(newDatabasePath))
            {
                
                using (Microsoft.Data.Sqlite.SqliteConnection conn = new Microsoft.Data.Sqlite.SqliteConnection(string.Format("Data Source={0}", oldDatabasePath)))
                {
                    conn.Open();
                    var cmd = new Microsoft.Data.Sqlite.SqliteCommand("SELECT * FROM MusicCache", conn);
                    var reader = cmd.ExecuteReader();

                    while (reader.Read())
                    {
                        string filename = reader["Filename"] + "";
                        string md5 = reader["MD5"] + "";
                        int played = Convert.ToInt32(reader["Played"]);
                        int playedToEnd = Convert.ToInt32(reader["PlayedToEnd"]);
                        DateTime lastPlayed = reader["LastPlayed"] == DBNull.Value ? DateTime.MinValue : Convert.ToDateTime(reader["LastPlayed"]);
                        LikeStatus likeStatus = (LikeStatus)Convert.ToInt32(reader["LikeStatus"]);

                        if (filename.StartsWith("/media/hdd/Dwight/Music/"))
                            filename = filename.Substring("/media/hdd/Dwight/Music/".Length);

                        var track = mgr.GetTrackByFilename(filename);
                        if (track != null)
                        {
                            track.NrPlayed = played;
                            track.NrPlayedToEnd = playedToEnd;
                            track.LastPlayed = lastPlayed;
                            track.LikeStatus = likeStatus;

                            mgr.Set(track);

                            var oldScrobbles = GetScrobblesFromOldTrack(md5, track.Id);
                            mgr.SetAll(oldScrobbles);

                        }
                        else
                        {
                            Console.Error.WriteLine("Track with relative path " + filename + " not found");
                        }
                    }
                }
            }
        }

        private static List<Domain.Objects.Scrobble> GetScrobblesFromOldTrack(string md5, int trackId)
        {
            List<Domain.Objects.Scrobble> scrobbles = new List<Domain.Objects.Scrobble>();
            using (Microsoft.Data.Sqlite.SqliteConnection conn = new Microsoft.Data.Sqlite.SqliteConnection(string.Format("Data Source={0}", oldDatabasePath)))
            {
                conn.Open();
                using (var cmd = new Microsoft.Data.Sqlite.SqliteCommand("SELECT * FROM Scrobble WHERE MD5=@MD5", conn))
                {
                    cmd.Parameters.AddWithValue("MD5", md5);
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            DateTime playedOn = Convert.ToDateTime(reader["PlayedOn"]);
                            scrobbles.Add(new Domain.Objects.Scrobble()
                            {
                                On = playedOn,
                                TrackId = trackId,
                                PlayedToEnd = true // old scrobbles were only made when played to end
                            });
                        }
                    }
                }
            }
            return scrobbles;
        }

    }
}
