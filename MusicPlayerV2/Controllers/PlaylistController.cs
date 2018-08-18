using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MusicPlayerV2.API;
using MusicPlayerV2.Shared;
using Microsoft.Extensions.Options;
using MusicPlayerV2.Domain;

namespace MusicPlayerV2.Controllers
{


    [Route("api/playlist")]
    public class PlaylistController : BaseController
    {
        private readonly IOptions<PlayerSettings> settings;
        private readonly LastFMManager lastFmManager;

        public PlaylistController(IOptions<PlayerSettings> settings, LastFMManager lastFMManager)
        {
            this.settings = settings;
            this.lastFmManager = lastFMManager;
        }

        [HttpGet("GetPlaylists")]
        public GetPlaylistsResult GetPlaylists(GetPlaylistsRequest request)
        {
            try
            {
                List<Domain.Objects.Playlist> playlists;
                int forItemSize;
                List<int> playlistIds;

                using (DAL.DALManager mgr = new DAL.DALManager(settings.Value.DatabasePath))
                {
                    playlists = mgr.GetAll<Domain.Objects.Playlist>();


                    playlists.Insert(0, new Domain.Objects.Playlist() { Id = Domain.Objects.Playlist.LIKED_ID, Name = "[Liked]", NrOfTracks = mgr.GetLikedTrackCount() });

                    if (!request.AsSelector)  // only show [all] when it's not listed for adding a track to the playlist
                        playlists.Insert(0, new Domain.Objects.Playlist() { Id = Domain.Objects.Playlist.ALL_ID, Name = "[All]", NrOfTracks = mgr.GetTrackCount() });

                    if (request.ForItemIsTrack)
                    {
                        playlistIds = new List<int>(mgr.GetPlaylistIdsForTrack(request.ForItemId));
                        forItemSize = 1;
                    }
                    else
                    {
                        playlistIds = new List<int>(mgr.GetPlaylistIdsForAlbum(request.ForItemId));
                        forItemSize = mgr.FindTracks("", Domain.Objects.Playlist.ALL_ID, request.ForItemId, 0, int.MaxValue).Count;
                    }
                }

                if (request.AsSelector)
                {
                    return new GetPlaylistsResult()
                    {
                        Success = true,
                        Playlists = playlists.Select(p =>
                        {
                            var itm = new PlaylistForAddingItem()
                            {
                                Id = p.Id + "",
                                IsCurrent = Player.Instance.CurrentPlaylist.Id == p.Id,
                                Name = p.Name,
                                NrOfTracks = p.NrOfTracks,

                                AlreadyOnPlaylistCount = playlistIds.Count(id => p.Id == id),
                                ForItemSize = forItemSize

                            };
                            
                            return itm;
                        }).ToArray()
                    };
                }
                else
                {
                    return new GetPlaylistsResult()
                    {
                        Success = true,
                        Playlists = playlists.Select(p => new Playlist()
                        {
                            Id = p.Id + "",
                            IsCurrent = Player.Instance.CurrentPlaylist.Id == p.Id,
                            Name = p.Name,
                            NrOfTracks = p.NrOfTracks
                        }).ToArray()
                    };
                }
            }
            catch (Exception ex)
            {
                return GetErrorResultFromException<GetPlaylistsResult>(ex);
            }
        }

        [HttpGet("GetAlbumsOrTracks")]
        public GetAlbumsOrTracksResult GetAlbumsOrTracks(GetAlbumsOrTracksRequest request)
        {
            try
            {
                int forPlaylistId;
                if (string.IsNullOrEmpty(request.ForPlaylistId))
                {
                    // no playlist filtering
                    forPlaylistId = Domain.Objects.Playlist.ALL_ID;
                }
                else
                    forPlaylistId = int.Parse(request.ForPlaylistId);

                List<AlbumOrTrackItem> albumOrTracks;
                int totalCount;
                using (DAL.DALManager mgr = new DAL.DALManager(settings.Value.DatabasePath))
                {
                    albumOrTracks = mgr.FindAlbumsOrTracks(request.Filter, request.SortBy, forPlaylistId, request.Offset, request.Size);
                    totalCount = mgr.FindAlbumsOrTracksCount(request.Filter, forPlaylistId);
                }

                // set the cover urls
                foreach (var item in albumOrTracks)
                    item.ArtImage = item.CoverId > 0 ? Url.Action("GetCover", new { id = item.CoverId }) : "";

                return new GetAlbumsOrTracksResult()
                {
                    Success = true,
                    Items = albumOrTracks.ToArray(),
                    TotalCount = totalCount
                };

            }
            catch (Exception ex)
            {
                return GetErrorResultFromException<GetAlbumsOrTracksResult>(ex);
            }
        }

        [HttpGet("GetTracks")]
        public GetTracksResult GetTracks(GetTracksRequest request)
        {
            try
            {
                int forPlaylistId;
                if (string.IsNullOrEmpty(request.ForPlaylistId))
                {
                    // no playlist filtering
                    forPlaylistId = Domain.Objects.Playlist.ALL_ID;
                }
                else
                    forPlaylistId = int.Parse(request.ForPlaylistId);

                List<AlbumOrTrackItem> albumOrTracks;
                int totalCount;
                using (DAL.DALManager mgr = new DAL.DALManager(settings.Value.DatabasePath))
                {
                    albumOrTracks = mgr.FindTracks(request.Filter, forPlaylistId, int.Parse(request.AlbumId), request.Offset, request.Size);
                    totalCount = mgr.FindTracksCount(request.Filter, forPlaylistId, int.Parse(request.AlbumId));
                }

                // set the cover urls
                foreach (var item in albumOrTracks)
                    item.ArtImage = item.CoverId > 0 ? Url.Action("GetCover", new { id = item.CoverId }) : "";

                return new GetTracksResult()
                {
                    Success = true,
                    Items = albumOrTracks.ToArray(),
                    TotalCount = totalCount
                };

            }
            catch (Exception ex)
            {
                return GetErrorResultFromException<GetTracksResult>(ex);
            }
        }

        [HttpPost("AddPlaylist")]
        public Result AddPlaylist([FromBody]AddPlaylistRequest request)
        {
            try
            {
                if (request.Playlist.Id == (Domain.Objects.Playlist.ALL_ID + "") || request.Playlist.Id == (Domain.Objects.Playlist.LIKED_ID + ""))
                    return new Result() { Success = false, Message = "Can't change the [All] or [Liked] playlist" };

                using (DAL.DALManager mgr = new DAL.DALManager(settings.Value.DatabasePath))
                {
                    var playlist = request.Playlist.Id == "" ? null : mgr.Get<Domain.Objects.Playlist>(int.Parse(request.Playlist.Id));

                    if (playlist == null)
                        playlist = new Domain.Objects.Playlist();

                    playlist.Name = request.Playlist.Name;

                    mgr.Set(playlist);

                    return new Result() { Success = true };
                }

            }
            catch (Exception ex)
            {
                return GetErrorResultFromException<Result>(ex);
            }
        }

        [HttpPost("RemovePlaylist")]
        public Result RemovePlaylist([FromBody]RemovePlaylistRequest request)
        {
            try
            {
                if (request.Playlist.Id == (Domain.Objects.Playlist.ALL_ID + "") || request.Playlist.Id == (Domain.Objects.Playlist.LIKED_ID + ""))
                    return new Result() { Success = false, Message = "Can't delete the [All] or [Liked] playlist" };

                using (DAL.DALManager mgr = new DAL.DALManager(settings.Value.DatabasePath))
                {
                    var playlist = mgr.Get<Domain.Objects.Playlist>(int.Parse(request.Playlist.Id));

                    if (playlist == null)
                        return new Result() { Success = false, Message = "Playlist not found" };

                    mgr.Delete<Domain.Objects.Playlist>(playlist);
                    mgr.DeleteAllTracksFromPlaylist(playlist.Id);

                    return new Result() { Success = true };
                }

            }
            catch (Exception ex)
            {
                return GetErrorResultFromException<Result>(ex);
            }
        }

        [HttpPost("AddToPlaylist")]
        public Result AddToPlaylist([FromBody]AddToPlaylistRequest request)
        {
            try
            {
                if (request.PlaylistId == (Domain.Objects.Playlist.ALL_ID + ""))
                    return new Result() { Success = false, Message = "Can't add tracks to the [All] or [Liked] playlist" };
                else if (request.PlaylistId == (Domain.Objects.Playlist.LIKED_ID + ""))
                {
                    return AddToLikedPlaylist(request);
                }

                using (DAL.DALManager mgr = new DAL.DALManager(settings.Value.DatabasePath))
                {
                    var playlist = mgr.Get<Domain.Objects.Playlist>(int.Parse(request.PlaylistId));

                    if (playlist == null)
                        return new Result() { Success = false, Message = "Playlist not found" };

                    int nrOfItemsAdded = 0;
                    if (request.Item.IsTrack)
                    {
                        var track = mgr.Get<Domain.Objects.Track>(request.Item.Id);
                        if (track == null)
                            return new Result() { Success = false, Message = "Track not found" };

                        var playlistTrack = mgr.GetPlaylistTrack(playlist.Id, track.Id);
                        if (playlistTrack != null)
                            return new Result() { Success = false, Message = "Track is already in the playlist" };

                        mgr.AddToPlaylist(playlist.Id, track.Id);
                        nrOfItemsAdded++;
                    }
                    else
                    {
                        var album = mgr.Get<Domain.Objects.Album>(request.Item.Id);
                        if (album == null)
                            return new Result() { Success = false, Message = "Album not found" };

                        var tracks = mgr.FindTracks(null, Domain.Objects.Playlist.ALL_ID, album.Id, 0, int.MaxValue);
                        foreach (var track in tracks)
                        {
                            var playlistTrack = mgr.GetPlaylistTrack(playlist.Id, track.Id);
                            if (playlistTrack == null)
                            {
                                mgr.AddToPlaylist(playlist.Id, track.Id);
                                nrOfItemsAdded++;
                            }
                        }
                    }
                    playlist.NrOfTracks += nrOfItemsAdded;
                    mgr.Set<Domain.Objects.Playlist>(playlist);

                    return new Result() { Success = true };
                }
            }
            catch (Exception ex)
            {
                return GetErrorResultFromException<Result>(ex);
            }
        }

        private Result AddToLikedPlaylist(AddToPlaylistRequest request)
        {
            using (DAL.DALManager mgr = new DAL.DALManager(settings.Value.DatabasePath))
            {
                if (request.Item.IsTrack)
                {
                    var track = mgr.Get<Domain.Objects.Track>(request.Item.Id);
                    if (track == null)
                        return new Result() { Success = false, Message = "Track not found" };
                    track.LikeStatus = LikeStatus.Liked;
                    mgr.Set(track);
                    lastFmManager.LoveTrackOnLastFM(DateTime.MinValue, track, true);
                    return new Result() { Success = true };
                }
                else
                {
                    var album = mgr.Get<Domain.Objects.Album>(request.Item.Id);
                    if (album == null)
                        return new Result() { Success = false, Message = "Album not found" };

                    var tracks = mgr.FindTracks(null, Domain.Objects.Playlist.ALL_ID, album.Id, 0, int.MaxValue);
                    foreach (var trackItem in tracks)
                    {
                        var track = mgr.Get<Domain.Objects.Track>(trackItem.Id);
                        if (track == null)
                            return new Result() { Success = false, Message = "Track not found" };

                        track.LikeStatus = LikeStatus.Liked;
                        mgr.Set(track);
                        lastFmManager.LoveTrackOnLastFM(DateTime.MinValue, track, true);
                    }
                    return new Result() { Success = true };
                }
            }
        }

        [HttpPost("RemoveFromPlaylist")]
        public Result RemoveFromPlaylist([FromBody]RemoveFromPlaylistRequest request)
        {
            try
            {
                if (request.PlaylistId == (Domain.Objects.Playlist.ALL_ID + ""))
                    return new Result() { Success = false, Message = "Can't remove tracks from the [All] or [Liked] playlist" };
                else if (request.PlaylistId == (Domain.Objects.Playlist.LIKED_ID + ""))
                {
                    return RemoveFromLikedPlaylist(request);
                }

                using (DAL.DALManager mgr = new DAL.DALManager(settings.Value.DatabasePath))
                {
                    var playlist = mgr.Get<Domain.Objects.Playlist>(int.Parse(request.PlaylistId));

                    if (playlist == null)
                        return new Result() { Success = false, Message = "Playlist not found" };

                    int nrOfItemsRemoved = 0;
                    if (request.Item.IsTrack)
                    {
                        var track = mgr.Get<Domain.Objects.Track>(request.Item.Id);
                        if (track == null)
                            return new Result() { Success = false, Message = "Track not found" };

                        var playlistTrack = mgr.GetPlaylistTrack(playlist.Id, track.Id);
                        if (playlistTrack == null)
                            return new Result() { Success = false, Message = "Track is was not in the playlist" };

                        mgr.RemoveFromPlaylist(playlist.Id, track.Id);
                        nrOfItemsRemoved++;
                    }
                    else
                    {
                        var album = mgr.Get<Domain.Objects.Album>(request.Item.Id);
                        if (album == null)
                            return new Result() { Success = false, Message = "Album not found" };

                        var tracks = mgr.FindTracks(null, Domain.Objects.Playlist.ALL_ID, album.Id, 0, int.MaxValue);
                        foreach (var track in tracks)
                        {
                            var playlistTrack = mgr.GetPlaylistTrack(playlist.Id, track.Id);
                            if (playlistTrack != null)
                            {
                                mgr.RemoveFromPlaylist(playlist.Id, track.Id);
                                nrOfItemsRemoved++;
                            }
                        }
                    }
                    playlist.NrOfTracks -= nrOfItemsRemoved;
                    mgr.Set<Domain.Objects.Playlist>(playlist);

                    return new Result() { Success = true };
                }
            }
            catch (Exception ex)
            {
                return GetErrorResultFromException<Result>(ex);
            }
        }

        private Result RemoveFromLikedPlaylist(RemoveFromPlaylistRequest request)
        {
            using (DAL.DALManager mgr = new DAL.DALManager(settings.Value.DatabasePath))
            {
                if (request.Item.IsTrack)
                {
                    var track = mgr.Get<Domain.Objects.Track>(request.Item.Id);
                    if (track == null)
                        return new Result() { Success = false, Message = "Track not found" };
                    track.LikeStatus = LikeStatus.None;
                    mgr.Set(track);
                    lastFmManager.LoveTrackOnLastFM(DateTime.MinValue, track, false);
                    return new Result() { Success = true };
                }
                else
                {
                    var album = mgr.Get<Domain.Objects.Album>(request.Item.Id);
                    if (album == null)
                        return new Result() { Success = false, Message = "Album not found" };

                    var tracks = mgr.FindTracks(null, Domain.Objects.Playlist.LIKED_ID, album.Id, 0, int.MaxValue);
                    foreach (var trackItem in tracks)
                    {
                        var track = mgr.Get<Domain.Objects.Track>(trackItem.Id);
                        if (track == null)
                            return new Result() { Success = false, Message = "Track not found" };

                        track.LikeStatus = LikeStatus.None;
                        mgr.Set(track);
                        lastFmManager.LoveTrackOnLastFM(DateTime.MinValue, track, true);
                    }
                    return new Result() { Success = true };
                }
            }
        }


        [HttpGet("GetCover")]
        public IActionResult GetCover(int id)
        {
            Domain.Objects.Cover cover;
            using (DAL.DALManager mgr = new DAL.DALManager(settings.Value.CoverDatabasePath))
                cover = mgr.Get<Domain.Objects.Cover>(id);

            if (cover == null)
                return NotFound();

            if (cover.Data == null)
                return NoContent(); // TODO?

            return new FileContentResult(cover.Data, "image/png");
        }
    }
}
