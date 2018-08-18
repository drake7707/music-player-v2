using MusicPlayerV2.Domain.Objects;
using MusicPlayerV2.Helper;
using MusicPlayerV2.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MusicPlayerV2.Domain
{
    public class MusicScanner
    {

        public static void Scan(PlayerSettings settings, bool forceUpdateIfAlreadyExists)
        {
            using (DAL.DALManager mgr = new DAL.DALManager(settings.DatabasePath))
            {

                foreach (var relPath in GetAllFiles(settings.RootDirectory, "").Reverse())
                {
                    string absolutePath = System.IO.Path.Combine(settings.RootDirectory, relPath);

                    var track = mgr.GetTrackByFilename(relPath);
                    bool isNew = false;
                    if (track == null)
                    {
                        isNew = true;
                        track = new Objects.Track()
                        {
                            Filename = relPath,
                            AddedOn = DateTime.Now,
                            LikeStatus = LikeStatus.None,
                            NrPlayed = 0,
                            NrPlayedToEnd = 0,
                            LastPlayed = DateTime.MinValue
                        };
                    }


                    if (isNew || forceUpdateIfAlreadyExists)
                    {
                        UpdateTrackFromMP3Tag(absolutePath, track);


                        var albumName = track.Album + "";
                        if (string.IsNullOrEmpty(System.IO.Path.GetDirectoryName(relPath)))
                        {
                            // mp3s in the root, don't use album for these
                            albumName = "";
                        }
                        else
                        {
                            if (albumName == "")
                                albumName = new System.IO.DirectoryInfo(relPath).Parent.Name;
                        }

                        var album = mgr.GetAlbumByName(albumName);
                        if (album == null)
                        {
                            album = new Album()
                            {
                                Name = albumName,
                                // do not save art for empty album names
                                SmallCoverId = albumName == "" ? 0 : SaveSmallCoverForAlbum(settings.CoverDatabasePath, absolutePath)
                            };
                            mgr.Set<Album>(album);
                        }
                        track.AlbumId = album.Id;

                        Console.WriteLine($"Adding {relPath}");
                        mgr.Set<Track>(track);
                    }

                }

                // determine the artists of each album and update it
                var albums = mgr.GetAll<Album>();
                foreach (var album in albums)
                {
                    if (!string.IsNullOrEmpty(album.Name))
                    {
                        var tracksOfAlbum = mgr.FindTracks("", Domain.Objects.Playlist.ALL_ID, album.Id, 0, int.MaxValue);

                        if (tracksOfAlbum.Count > 0)
                        {
                            var occurringArtists = tracksOfAlbum.GroupBy(t => t.Artists + "").ToDictionary(g => g.Key, g => g.Count());
                            var top3MostOccurring = occurringArtists.OrderByDescending(p => p.Value).Take(3).ToList();

                            // take the most occurring artist
                            if (top3MostOccurring[0].Key != album.Artists)
                            {
                                album.Artists = top3MostOccurring[0].Key;
                                mgr.Set(album);
                            }
                        }
                    }
                }
            }
        }

        private static int SaveSmallCoverForAlbum(string coverDbPath, string path)
        {
            byte[] data = null;
            string mimeType;
            using (var tlfile = TagLib.File.Create(path))
            {
                TagLib.Tag tag123 = tlfile.Tag;
                if (tag123.Pictures != null && tag123.Pictures.Length > 0)
                {
                    data = tag123.Pictures[0].Data.ToArray();
                    mimeType = tag123.Pictures[0].MimeType;
                }
                else
                {
                    // check if cover file exists
                    string dir = System.IO.Path.GetDirectoryName(path);
                    string coverpath = System.IO.Path.Combine(dir, "cover.jpg");
                    string mimetype = "image/jpg";
                    if (!System.IO.File.Exists(coverpath))
                    {
                        coverpath = System.IO.Path.Combine(dir, "cover.png");
                        mimetype = "image/png";
                    }

                    if (System.IO.File.Exists(coverpath))
                    {
                        data = System.IO.File.ReadAllBytes(coverpath);
                        mimeType = mimetype;
                    }
                }
            }

            Cover cover;
            try
            {
                if (data != null && data.Length > 0)
                {
                    var resizedImageBytes = ImageResizer.ResizeImageTo(data, 200, 200, false);
                    cover = new Cover()
                    {
                        Data = resizedImageBytes
                    };

                    using (DAL.DALManager mgr = new DAL.DALManager(coverDbPath))
                        mgr.Set(cover);

                    return cover.Id;
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine("Unable to save cover for " + path + ": " + ex.GetType().FullName + " - " + ex.Message);

            }
            return 0;
        }

        private static void UpdateTrackFromMP3Tag(string absolutePath, Track track)
        {
            using (var tlfile = TagLib.File.Create(absolutePath))
            {

                TagLib.Tag tag123 = tlfile.Tag;
                track.Title = tag123.Title;
                if (string.IsNullOrEmpty(track.Title))
                    track.Title = System.IO.Path.GetFileNameWithoutExtension(absolutePath);

                track.Album = tag123.Album;
                track.Artists = string.Join(",", tag123.Performers);
                track.TrackNr = (int)tag123.Track;
                track.Duration = tlfile.Properties.Duration.TotalSeconds;
                track.Genres = string.Join("/", tag123.Genres);
                track.DiscNr = (int)tag123.Disc;
            }
        }


        private static IEnumerable<string> GetAllFiles(string path, string currentFolder)
        {
            foreach (var d in System.IO.Directory.GetDirectories(path))
            {
                var di = new System.IO.DirectoryInfo(d);
                foreach (var subf in GetAllFiles(d, System.IO.Path.Combine(currentFolder, di.Name)))
                    yield return subf;
            }
            foreach (var f in System.IO.Directory.GetFiles(path))
            {

                if (System.IO.Path.GetExtension(f).ToLower() == ".mp3")
                    yield return System.IO.Path.Combine(currentFolder, System.IO.Path.GetFileName(f));
            }

        }
    }
}
