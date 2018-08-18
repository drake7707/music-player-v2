export interface IPlayerState {
    currentTrack: ITrack;
    shuffle: boolean;
}

export interface ITrack {
    id: string;
    title: string;
    artists: string[];
    album: string;
    track: number;
    artImage: string;
    liked: LikeStatus;
    url: string;
}
export enum LikeStatus {
    None = 0,
    Liked = 1,
    Disliked = 2
}

export interface IPlaylist {
    id: string;
    name: string;
    isCurrent: false;
    nrOfTracks: number;
}

export interface IPlaylistForAddingItem extends IPlaylist {
    alreadyOnPlaylistCount: number;
    forItemSize: number;
}

export interface ITrackDetails {
    id: string;
    title: string;
    artists: string[];
    album: string;
    trackNr: number;
    genres: string[];
    nrPlayed: number;
    nrPlayedToEnd: number;
    lastPlayed: Date | null;
    addedOn: Date | null;
    liked: LikeStatus;

    lastScrobbles: ITrackScrobble[];
}

export interface ITrackScrobble {
    on: Date;
    playedToEnd: boolean;
}

export interface ITrackItem {
    id: string;
    name: string;
    artists: string;
    artImage: string;
}

export interface IAlbumOrTrackItem extends ITrackItem, IItem {

}

export interface IItem {
    id: string;
    name: string;
    isTrack: boolean;
}