using MusicPlayerV2.Domain.Objects;
using MusicPlayerV2.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MusicPlayerV2.Domain
{
    public class Player
    {

        private static Player instance;
        public static Player Instance
        {
            get
            {
                if (instance == null)
                    instance = new Player();
                return instance;
            }
        }


        public Playlist CurrentPlaylist { get; set; }

        public class Playlist
        {
            public int Id { get; set; }

            public List<TrackItem> Tracks { get; set; }

            public List<int> Positions { get; set; }

            public int CurrentPosition { get; set; }

            public bool CurrentTrackStartedPlaying { get; set; }
            public DateTime CurrentTrackStartedPlayingOn { get; set; }

            public TrackItem CurrentTrack
            {
                get
                {
                    if (Tracks.Count == 0)
                        return null;

                    if (IsShuffled)
                        return Tracks[Positions[CurrentPosition]];
                    else
                        return Tracks[CurrentPosition];
                }
            }

            public bool IsShuffled { get; internal set; }
        }



        public void LoadPlaylist(Playlist list)
        {
            int currentId = CurrentPlaylist == null || CurrentPlaylist.CurrentTrack == null ? -1 : CurrentPlaylist.CurrentTrack.Id;
            this.CurrentPlaylist = list;

            if (currentId != -1)
                SetCurrentPositionFromId(currentId);
            else
            {
                // new item selected in playlist
                CurrentPlaylist.CurrentPosition = 0;
                CurrentPlaylist.CurrentTrackStartedPlaying = false;
                CurrentPlaylist.CurrentTrackStartedPlayingOn = DateTime.MinValue;
            }
        }

        private void SetCurrentPositionFromId(int trackId)
        {
            if (trackId != -1)
            {
                if (CurrentPlaylist.IsShuffled)
                {
                    for (int i = 0; i < CurrentPlaylist.Positions.Count; i++)
                    {
                        if (CurrentPlaylist.Tracks[CurrentPlaylist.Positions[i]].Id == trackId)
                        {
                            CurrentPlaylist.CurrentPosition = i;
                            break;
                        }
                    }
                }
                else
                {
                    CurrentPlaylist.CurrentPosition = CurrentPlaylist.Tracks.FindIndex(t => t.Id == trackId);
                }
                if (CurrentPlaylist.CurrentPosition == -1) // if not found then go to the beginning
                    CurrentPlaylist.CurrentPosition = 0;
            }
        }

        public void Next()
        {
            if (CurrentPlaylist.Tracks.Count == 0 || CurrentPlaylist.Tracks.Count == 1) return;

            if (CurrentPlaylist.CurrentPosition + 1 >= CurrentPlaylist.Tracks.Count)
                CurrentPlaylist.CurrentPosition = 0;
            else
                CurrentPlaylist.CurrentPosition++;
        }

        public void Previous()
        {
            if (CurrentPlaylist.Tracks.Count == 0 || CurrentPlaylist.Tracks.Count == 1) return;

            if (CurrentPlaylist.CurrentPosition - 1 < 0)
                CurrentPlaylist.CurrentPosition = CurrentPlaylist.Tracks.Count - 1;
            else
                CurrentPlaylist.CurrentPosition--;
        }

        public void Shuffle()
        {
            if (CurrentPlaylist.Tracks.Count == 0)
                return;

            int currentId = CurrentPlaylist.CurrentTrack.Id;

            CurrentPlaylist.Positions = Enumerable.Range(0, CurrentPlaylist.Tracks.Count).ToList();

            Random rnd = new Random();
            int n = CurrentPlaylist.Tracks.Count;
            while (n > 1)
            {
                n--;
                int k = rnd.Next(n + 1);
                var value = CurrentPlaylist.Positions[k];
                CurrentPlaylist.Positions[k] = CurrentPlaylist.Positions[n];
                CurrentPlaylist.Positions[n] = value;
            }

            CurrentPlaylist.IsShuffled = true;

            SetCurrentPositionFromId(currentId);

        }

        public void UnShuffle()
        {
            if (CurrentPlaylist.Tracks.Count == 0)
                return;

            int currentId = CurrentPlaylist.CurrentTrack.Id;

            CurrentPlaylist.Positions.Clear();
            CurrentPlaylist.IsShuffled = false;
            SetCurrentPositionFromId(currentId);
        }

        public void PlayTracks(HashSet<int> trackIds)
        {
            // so yeah this is a bit annoying if there are multiple tracks


            if (CurrentPlaylist.IsShuffled)
            {
                // oh goddamnit why
                // do the same thing but keep track of id and their position
                // look for the first applicable track id
                var firstTrack = CurrentPlaylist.Positions.Where(p => trackIds.Contains(CurrentPlaylist.Tracks[p].Id)).Select(p => CurrentPlaylist.Tracks[p]).FirstOrDefault();
                if (firstTrack == null)
                    return;
                int firstTrackId = firstTrack.Id;

                CurrentPlaylist.CurrentPosition = CurrentPlaylist.Positions.FindIndex(p => CurrentPlaylist.Tracks[p].Id == firstTrackId);
                if (trackIds.Count > 1)
                {
                    // now remove all other ids from the playlist and insert them after the current position
                    var positionsToInsert = CurrentPlaylist.Positions.Where(p => CurrentPlaylist.Tracks[p].Id != firstTrackId && trackIds.Contains(CurrentPlaylist.Tracks[p].Id)).ToList();
                    CurrentPlaylist.Positions.RemoveAll(p => CurrentPlaylist.Tracks[p].Id != firstTrackId && trackIds.Contains(CurrentPlaylist.Tracks[p].Id));
                    if (CurrentPlaylist.Tracks[CurrentPlaylist.Positions.Last()].Id == firstTrackId)
                    {
                        //  ok just append
                        CurrentPlaylist.Positions.AddRange(positionsToInsert);
                    }
                    else
                    {
                        // need to insert them
                        CurrentPlaylist.Positions = Enumerable.Empty<int>()
                            .Concat(CurrentPlaylist.Positions.Take(CurrentPlaylist.CurrentPosition + 1))
                            .Concat(positionsToInsert)
                            .Concat(CurrentPlaylist.Positions.Skip(CurrentPlaylist.CurrentPosition + 1))
                            .ToList();
                    }
                }
                CurrentPlaylist.CurrentPosition = CurrentPlaylist.Positions.FindIndex(p => CurrentPlaylist.Tracks[p].Id == firstTrackId);
            }
            else
            {
                // luckily it's not shuffled
                // find the first trackId and set the position to that one
                // look for the first applicable track id
                var firstTrack = CurrentPlaylist.Tracks.FirstOrDefault(t => trackIds.Contains(t.Id));
                if (firstTrack == null)
                    return;
                int firstTrackId = firstTrack.Id;


                CurrentPlaylist.CurrentPosition = CurrentPlaylist.Tracks.FindIndex(t => t.Id == firstTrackId);
                if (trackIds.Count > 1)
                {
                    // now remove all other ids from the playlist and insert them after the current position
                    var tracksToInsert = CurrentPlaylist.Tracks.Where(t => t.Id != firstTrackId && trackIds.Contains(t.Id)).ToList();
                    CurrentPlaylist.Tracks.RemoveAll(t => t.Id != firstTrackId && trackIds.Contains(t.Id));
                    if (CurrentPlaylist.Tracks.Last().Id == firstTrackId)
                    {
                        //  ok just append
                        CurrentPlaylist.Tracks.AddRange(tracksToInsert);
                    }
                    else
                    {
                        // need to insert them
                        CurrentPlaylist.Tracks = Enumerable.Empty<TrackItem>()
                            .Concat(CurrentPlaylist.Tracks.Take(CurrentPlaylist.CurrentPosition + 1))
                            .Concat(tracksToInsert)
                            .Concat(CurrentPlaylist.Tracks.Skip(CurrentPlaylist.CurrentPosition + 1))
                            .ToList();
                    }
                }
                // make sure that if removed elements were before the position we adjust it to the first id
                CurrentPlaylist.CurrentPosition = CurrentPlaylist.Tracks.FindIndex(t => t.Id == firstTrackId);
            }
        }
    }
}
