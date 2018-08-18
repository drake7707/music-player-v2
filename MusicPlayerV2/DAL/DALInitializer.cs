using Microsoft.Data.Sqlite;
using MusicPlayerV2.Domain.Objects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MusicPlayerV2.DAL
{
    public class DALInitializer
    {

        public static void InitializeMainDatabase(string dbPath)
        {
            using (var conn = GetConnection(dbPath))
            {
                conn.CreateTable<Track>();
                conn.CreateIndex<Track>(t => t.AlbumId);
                conn.CreateIndex<Track>(t => t.Filename);

                conn.CreateTable<Album>();
                conn.CreateTable<Playlist>();

                conn.CreateTable<Scrobble>();
                conn.CreateIndex<Scrobble>(s => s.TrackId);

                conn.CreateTable<PlaylistTrack>();
                conn.CreateIndex<PlaylistTrack>(t => t.PlaylistId);
                conn.CreateIndex<PlaylistTrack>(t => t.TrackId);
            }
        }

        public static void InitializeCoverDatabase(string coverDbPath)
        {
            using (var conn = GetConnection(coverDbPath))
            {
                conn.CreateTable<Cover>();
            }
        }

        private static SqliteConnection GetConnection(string dbFile)
        {
            var connection = new SqliteConnection(string.Format("Data Source={0}", dbFile));
            connection.Open();
            return connection;
        }
    }
}
