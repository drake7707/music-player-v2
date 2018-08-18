using Dapper;
using Microsoft.Data.Sqlite;
using MusicPlayerV2.Domain.Objects;
using MusicPlayerV2.Shared;
using System;
using System.Collections.Generic;
using System.Linq;

namespace MusicPlayerV2.DAL
{
    public class DALManager : IDisposable
    {
        private readonly string dbFile;

        public DALManager(string dbFile)
        {
            this.dbFile = dbFile;
        }

        private SqliteConnection connection;

        private SqliteConnection GetConnection()
        {
            if (connection == null || connection.State != System.Data.ConnectionState.Open)
            {
                connection?.Dispose();
                connection = new SqliteConnection(string.Format("Data Source={0}", dbFile));
                connection.Open();
            }
            return connection;
        }

        public List<T> GetAll<T>()
          where T : BaseEntity
        {
            var conn = GetConnection();
            return conn.GetList<T>().ToList();
        }

        public T Get<T>(int id)
            where T : BaseEntity
        {
            var conn = GetConnection();
            return conn.Get<T>(id);
        }

        public void Set<T>(T entity)
            where T : BaseEntity
        {
            if (entity.Id == 0)
                Insert(entity);
            else
                Update(entity);
        }

        private void Insert<T>(T entity)
            where T : BaseEntity
        {
            var conn = GetConnection();
            int id = conn.Insert(entity).Value;
            entity.Id = id;
        }

        public void SetAll<T>(IEnumerable<T> entities)
          where T : BaseEntity
        {
            var conn = GetConnection();

            var transaction = conn.BeginTransaction();
            try
            {

                foreach (var entity in entities)
                {
                    if (entity.Id == 0)
                    {
                        int id = conn.Insert(entity, transaction).Value;
                        entity.Id = id;
                    }
                    else
                        conn.Update(entity, transaction);
                }

                transaction.Commit();
            }
            finally
            {

            }
        }




        public int GetTrackCount()
        {
            var conn = GetConnection();
            return Convert.ToInt32(conn.ExecuteScalar("SELECT COUNT(1) FROM Track"));
        }

        public int GetLikedTrackCount()
        {
            var conn = GetConnection();
            return Convert.ToInt32(conn.ExecuteScalar("SELECT COUNT(1) FROM Track t WHERE t.LikeStatus = @LikeStatus", new { LikeStatus = (int)LikeStatus.Liked }));
        }

        public IEnumerable<int> GetPlaylistIdsForAlbum(int id)
        {
            var conn = GetConnection();
            return conn.Query<int>(@"SELECT PlaylistId FROM PlaylistTrack
                                     JOIN Track t ON t.AlbumId = @id
                                     WHERE TrackId == t.Id
                                     UNION ALL
                                     SELECT @likePlaylistId From Track WHERE AlbumId=@id AND LikeStatus=@likeStatus", new { id = id, likeStatus = LikeStatus.Liked,  likePlaylistId = Playlist.LIKED_ID });
        }

        public IEnumerable<int> GetPlaylistIdsForTrack(int id)
        {
            var conn = GetConnection();
            return conn.Query<int>(@"SELECT PlaylistId FROM PlaylistTrack 
                                     WHERE TrackId == @id 
                                    UNION ALL
                                    SELECT @likePlaylistId From Track WHERE Id=@id AND LikeStatus=@likeStatus", new { id = id, likeStatus=LikeStatus.Liked, likePlaylistId = Playlist.LIKED_ID });
        }

        public List<AlbumOrTrackItem> FindTracks(string filter, int forPlaylistId, int albumId, int offset, int count)
        {
            SqliteConnection conn;
            DynamicParameters dbArgs;
            string query;
            FindTracksGetQueryAndArguments(filter, forPlaylistId, albumId, offset, count, false, out conn, out query, out dbArgs);
            return conn.Query<AlbumOrTrackItem>(query, dbArgs).ToList();
        }

        public int FindTracksCount(string filter, int forPlaylistId, int albumId)
        {
            SqliteConnection conn;
            DynamicParameters dbArgs;
            string query;
            FindTracksGetQueryAndArguments(filter, forPlaylistId, albumId, 0, int.MaxValue, true, out conn, out query, out dbArgs);
            return Convert.ToInt32(conn.ExecuteScalar(query, dbArgs));
        }

        private void FindTracksGetQueryAndArguments(string filter, int forPlaylistId, int albumId, int offset, int count, bool forCount, out SqliteConnection conn, out string query, out DynamicParameters dbArgs)
        {
            conn = GetConnection();
            string filterQuery = @"SELECT t.Id, t.Title, t.Artists, t.Album, t.DiscNr, t.TrackNr, t.AlbumId, a.SmallCoverId
                                    FROM Track t
                                    LEFT JOIN Album a ON a.Id = t.AlbumId 
                                   ";

            dbArgs = new DynamicParameters();
            List<string> whereConditions = new List<string>();
            AddWhereConditionForFilterForTrackQuery(filter, dbArgs, whereConditions);


            if (forPlaylistId > 0)
            {
                // make sure the tracks are on the given playlist
                filterQuery += "JOIN PlaylistTrack pt ON pt.PlaylistId = @playlistId AND pt.TrackId = t.Id ";
                dbArgs.Add("playlistId", forPlaylistId);
            }
            else if (forPlaylistId == Domain.Objects.Playlist.ALL_ID) // all
            {

            }
            else if (forPlaylistId == Domain.Objects.Playlist.LIKED_ID) // liked
            {
                whereConditions.Add("t.LikeStatus = @likeStatus");
                dbArgs.Add("likeStatus", (int)LikeStatus.Liked);
            }

            whereConditions.Add("t.AlbumId = @albumId");
            dbArgs.Add("albumId", albumId);

            if (whereConditions.Count > 0)
                filterQuery += "WHERE " + string.Join(" AND ", whereConditions.Select(c => "(" + c + ")"));

            string tracksQuery = @"tracks as (SELECT
                                t.Id as Id,
                                (t.TrackNr || ' - ' || t.Title) as Name,
                                t.Artists,
                                t.SmallCoverId as CoverId,
                                1 as IsTrack
                                FROM filteredTracks t
                                ORDER BY t.DiscNr ASC, t.TrackNr ASC)";
            if (!forCount)
            {
                query = $@"with filteredTracks as (
                                {filterQuery}
                                ),

                                {tracksQuery}
                               
                                select * from tracks
                                LIMIT @offset, @count";
            }
            else
            {
                query = $@"with filteredTracks as (
                                {filterQuery}
                                ),

                                {tracksQuery}
                               
                                select count(*) from tracks";
            }
            if (!forCount)
            {
                dbArgs.Add("offset", offset);
                dbArgs.Add("count", count);
            }
        }

        private static void AddWhereConditionForFilterForTrackQuery(string filter, DynamicParameters dbArgs, List<string> whereConditions)
        {
            if (!string.IsNullOrEmpty(filter))
            {

                if (filter.StartsWith("artist:", StringComparison.InvariantCultureIgnoreCase))
                {
                    whereConditions.Add("t.Artists = @filter || t.Artists LIKE ('%,' || @filter) OR t.Artists LIKE (@filter || ',%') OR t.Artists LIKE ('%,' || @filter || ',%')");
                    dbArgs.Add("filter", filter.Substring("artist:".Length)); // exact match but case insensitive
                }
                else if (filter.StartsWith("album:", StringComparison.InvariantCultureIgnoreCase))
                {
                    whereConditions.Add("t.Album LIKE @filter");
                    dbArgs.Add("filter", filter.Substring("album:".Length)); // exact match but case insensitive
                }
                else
                {
                    whereConditions.Add("t.Title LIKE @filter OR t.Artists LIKE @filter OR t.Album LIKE @filter");
                    dbArgs.Add("filter", "%" + filter + "%");
                }
            }
        }

        public List<AlbumOrTrackItem> FindAlbumsOrTracks(string filter, string sortBy, int forPlaylistId, int offset, int count)
        {
            SqliteConnection conn;
            DynamicParameters dbArgs;
            string query;
            FindAlbumsOrTracksGetQueryAndArguments(filter, sortBy, forPlaylistId, offset, count, false, out conn, out query, out dbArgs);

            return conn.Query<AlbumOrTrackItem>(query, dbArgs).ToList();
        }

        public int FindAlbumsOrTracksCount(string filter, int forPlaylistId)
        {
            SqliteConnection conn;
            DynamicParameters dbArgs;
            string query;
            FindAlbumsOrTracksGetQueryAndArguments(filter, "", forPlaylistId, 0, int.MaxValue, true, out conn, out query, out dbArgs);

            return Convert.ToInt32(conn.ExecuteScalar(query, dbArgs));
        }

        private void FindAlbumsOrTracksGetQueryAndArguments(string filter, string sortBy, int forPlaylistId, int offset, int count, bool forCount, out SqliteConnection conn, out string query, out DynamicParameters dbArgs)
        {
            conn = GetConnection();
            string filterQuery = @"SELECT t.Id, t.Artists, t.Title, a.Name as Album, t.AlbumId, a.SmallCoverId, a.Artists as AlbumArtists, t.AddedOn as AddedOn
                                    FROM Track t
                                    LEFT JOIN Album a ON a.Id = t.AlbumId 
                                   ";

            dbArgs = new DynamicParameters();
            List<string> whereConditions = new List<string>();

            if (forPlaylistId > 0)
            {
                // make sure the tracks are on the given playlist
                filterQuery += "JOIN PlaylistTrack pt ON pt.PlaylistId = @playlistId AND pt.TrackId = t.Id ";
                dbArgs.Add("playlistId", forPlaylistId);
            }
            else if (forPlaylistId == Domain.Objects.Playlist.ALL_ID) // all
            {

            }
            else if (forPlaylistId == Domain.Objects.Playlist.LIKED_ID) // liked
            {
                whereConditions.Add("t.LikeStatus = @likeStatus");
                dbArgs.Add("likeStatus", (int)LikeStatus.Liked);
            }

            AddWhereConditionForFilterForTrackQuery(filter, dbArgs, whereConditions);

            if (whereConditions.Count > 0)
                filterQuery += "WHERE " + string.Join(" AND ", whereConditions.Select(c => "(" + c + ")"));


            string sortColumn = "LOWER(Name)";
            if (sortBy == "artist")
                sortColumn = "LOWER(Artists)";
            else if (sortBy == "name")
                sortColumn = "LOWER(Name)";
            else if (sortBy == "addedon")
                sortColumn = "AddedOn";

            string sortOrder;
            if (sortBy == "addedon")
                sortOrder = "DESC";
            else
                sortOrder = "ASC";

            string albumsQuery = @"albums as (SELECT 
                                t.AlbumId AS Id,
                                t.Album AS Name,
                                t.AlbumArtists AS Artists,
                                t.SmallCoverId as CoverId,
                                max(t.AddedOn) as AddedOn,
                                0 AS IsTrack
                                FROM filteredTracks t
                                GROUP BY t.AlbumId, t.Album
                                HAVING count(*) > 1)";
            string tracksQuery = @"tracks as (SELECT
                                t.Id as Id,
                                t.Title as Name,
                                max(t.Artists) AS Artists,
                                t.SmallCoverId as CoverId,
                                t.AddedOn as AddedOn,
                                1 as IsTrack
                                FROM filteredTracks t
                                GROUP BY t.AlbumId, t.Album
                                HAVING count(*) = 1)";

            if (forCount)
            {
                query = $@"with filteredTracks as (
                                {filterQuery}
                                ),

                                {albumsQuery},
                                {tracksQuery}

                                select count(1) from (select * from albums
                                                    UNION
                                                    select * from tracks) as tmp
                                ORDER BY IsTrack ASC, {sortColumn} {sortOrder}";
            }
            else
            {
                query = $@"with filteredTracks as (
                                {filterQuery}
                                ),

                                {albumsQuery},
                                {tracksQuery}

                                select * from (select * from albums
                                                UNION
                                                select * from tracks) as tmp
                                ORDER BY IsTrack ASC, {sortColumn} {sortOrder}
                                LIMIT @offset, @count";
                dbArgs.Add("offset", offset);
                dbArgs.Add("count", count);
            }

        }

        public void DeleteAllTracksFromPlaylist(int playlistId)
        {
            var conn = GetConnection();
            conn.Execute("DELETE FROM PlaylistTrack WHERE PlaylistId=@PlaylistId", new { PlaylistId = playlistId });
        }

        public List<TrackItem> GetTrackItems(int playlistId)
        {
            var conn = GetConnection();
            if (playlistId > 0)
                return conn.Query<TrackItem>(@"SELECT t.Id as Id, t.Title as Name FROM Track t  
                                                JOIN PlaylistTrack pt ON pt.PlaylistId = @PlaylistId AND pt.TrackId = t.Id 
                                                ORDER BY LOWER(t.Album) ASC, t.DiscNr ASC, t.TrackNr ASC", new { PlaylistId = playlistId }).ToList();
            else if (playlistId == Domain.Objects.Playlist.ALL_ID)
                return conn.Query<TrackItem>(@"SELECT t.Id as Id, t.Title as Name FROM Track t 
                                               ORDER BY LOWER(t.Album) ASC, t.DiscNr ASC, t.TrackNr ASC").ToList();
            else if (playlistId == Domain.Objects.Playlist.LIKED_ID)
                return conn.Query<TrackItem>(@"SELECT t.Id as Id, t.Title as Name FROM Track t 
                                               WHERE t.LikeStatus = @LikeStatus
                                               ORDER BY LOWER(t.Album) ASC, t.DiscNr, t.TrackNr ASC", new { LikeStatus = (int)LikeStatus.Liked }).ToList();

            return new List<TrackItem>();
        }

        public PlaylistTrack GetPlaylistTrack(int playlistId, int trackId)
        {
            var conn = GetConnection();
            return conn.QuerySingleOrDefault("SELECT * from PlaylistTrack WHERE PlaylistId = @PlaylistId AND TrackId = @TrackId", new { PlaylistId = playlistId, TrackId = trackId });
        }

        private void Update<T>(T entity)
            where T : BaseEntity
        {
            var conn = GetConnection();
            conn.Update(entity);

        }

        public void Delete<T>(T entity)
        {
            var conn = GetConnection();
            conn.Delete(entity);
        }

        public void AddToPlaylist(int playlistId, int trackId)
        {
            var conn = GetConnection();
            conn.Execute("INSERT INTO PlaylistTrack (PlaylistId, TrackId) VALUES (@PlaylistId, @TrackId)", new { PlaylistId = playlistId, TrackId = trackId });
        }

        public void RemoveFromPlaylist(int playlistId, int trackId)
        {
            var conn = GetConnection();
            conn.Execute("DELETE PlaylistTrack WHERE PlaylistId=@PlaylistId AND TrackId=@TrackId", new { PlaylistId = playlistId, TrackId = trackId });
        }


        public Track GetTrackByFilename(string filename)
        {
            var conn = GetConnection();
            return conn.QuerySingleOrDefault<Track>("SELECT * FROM Track WHERE Filename=@Filename", new { Filename = filename });
        }

        public Album GetAlbumByName(string name)
        {
            var conn = GetConnection();
            return conn.QuerySingleOrDefault<Album>("SELECT * FROM Album WHERE Name=@Name", new { Name = name });
        }


        public List<Scrobble> GetScrobblesOfTrack(int trackId)
        {
            var conn = GetConnection();
            return conn.Query<Scrobble>("SELECT * FROM Scrobble WHERE TrackId=@TrackId", new { TrackId = trackId }).ToList();
        }

        public void Dispose()
        {
            connection?.Dispose();
        }

    }
}
