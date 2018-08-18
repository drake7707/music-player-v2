using Lpfm.LastFmScrobbler;
using MusicPlayerV2.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MusicPlayerV2.Domain
{
    public class LastFMManager
    {

        private Scrobbler scrobbler;

        public LastFMManager(PlayerSettings settings)
        {
            scrobbler = new Scrobbler(settings.LastFMApiKey, settings.LastFMApiSecret, settings.LastFMSessionKey);
        }


        public void UpdateNowPlayingToLastFM(Domain.Objects.Track info)
        {
            Console.WriteLine("Updating Now playing on last FM");
            if (System.Diagnostics.Debugger.IsAttached)
                return;

            Task.Factory.StartNew(() =>
            {
                lock (scrobbler) // make sure no requests are run at the same time
                {
                    try
                    {
                        var response = scrobbler.NowPlaying(GetLastFmTrackFromAudioInfo(info));
                        if (response.ErrorCode > 0)
                        {
                            Console.Error.WriteLine("Unable to update now playing track " + info.Artists.FirstOrDefault() + " - " + info.Title + " to Last FM" + ": " + response.Exception.Message);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.Error.WriteLine("Unable to update now playing track " + info.Artists.FirstOrDefault() + " - " + info.Title + " to Last FM" + ": " + ex.Message);
                    }
                }
            });
        }

        private static Track GetLastFmTrackFromAudioInfo(Domain.Objects.Track info)
        {
            string album = info.Album;

            // urls in albums don't get scrobbled anymore, which is a problem for OC Remix
            if ((album + "").Contains("http://") || (album + "").Contains("https://"))
                album = "";

            return new Lpfm.LastFmScrobbler.Track()
            {
                AlbumName = album,
                ArtistName = info.Artists,
                TrackName = info.Title,
                TrackNumber = info.TrackNr,
                Duration = TimeSpan.FromSeconds(info.Duration),
                WhenStartedPlaying = DateTime.Now
            };
        }

        public void ScrobbleToLastFM(DateTime whenStartedPlaying, Domain.Objects.Track info)
        {
            Console.WriteLine("Scrobble to last FM");
            if (System.Diagnostics.Debugger.IsAttached)
                return;

            Task.Factory.StartNew(() =>
            {
                lock (scrobbler) // make sure no requests are run at the same time
                {
                    try
                    {
                        var track = GetLastFmTrackFromAudioInfo(info);
                        track.WhenStartedPlaying = whenStartedPlaying;
                        var response = scrobbler.Scrobble(track);
                        if (response.ErrorCode > 0)
                        {
                            Console.Error.WriteLine("Unable to scrobble track " + info.Artists.FirstOrDefault() + " - " + info.Title + " to Last FM" + ": " + response.Exception.Message);
                            
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.Error.WriteLine("Unable to scrobble track " + info.Artists.FirstOrDefault() + " - " + info.Title + " to Last FM" + ": " + ex.Message);
                    }
                }
            });
        }

        public void LoveTrackOnLastFM(DateTime whenStartedPlaying, Domain.Objects.Track info, bool love)
        {
            Console.WriteLine("Love/unlove track on last FM");
            if (System.Diagnostics.Debugger.IsAttached)
                return;

            lock (scrobbler) // make sure no requests are run at the same time
            {
               
                var track = GetLastFmTrackFromAudioInfo(info);
                track.WhenStartedPlaying = whenStartedPlaying;
                var response = love ? scrobbler.Love(track) : scrobbler.UnLove(track);
                if (response.ErrorCode > 0)
                {
                    Console.Error.WriteLine("Unable to love track " + info.Artists.FirstOrDefault() + " - " + info.Title + " on Last FM" + ": " + response.Exception.Message);
                    throw response.Exception;
                }
            }
        }
    }
}
