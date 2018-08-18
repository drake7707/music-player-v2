import { IPlayerState, IPlaylist, IAlbumOrTrackItem, ITrackDetails, LikeStatus, IItem } from "./objects";

export interface Result {
        success: boolean;
        message: string;
    }

    export interface GetPlayerStateResult extends Result {
        player: IPlayerState;
    }

    export interface GetPlaylistsResult extends Result {
        playlists: IPlaylist[];
    }

    export interface GetAlbumsOrTracksResult extends Result {
        items: IAlbumOrTrackItem[];
        totalCount: number;
    }

    export interface GetTracksResult extends GetAlbumsOrTracksResult {
    }

    export interface GetDetailsResult extends Result {
        details: ITrackDetails;
    }


    export interface PreviousTrackResult extends GetPlayerStateResult {

    }

    export interface NextTrackResult extends GetPlayerStateResult {

    }

    export interface ToggleShuffleResult extends GetPlayerStateResult {

    }

    export interface SetLikeStatusRequestResult extends GetPlayerStateResult {

    }

    export interface PlayNowResult extends GetPlayerStateResult {

    }

    export interface GetCurrentTrackIdResult extends Result {
        trackId: string;
    }


    export interface Request {

    }

    export interface PreviousTrackRequest extends Request {
        currentTrackId: string;
    }

    export interface NextTrackRequest extends Request {
        currentTrackId: string;
        playedToEnd: boolean;
    }

    export interface ToggleShuffleRequest extends Request {
        shuffle: boolean;
    }

    export interface SetLikeStatusRequest extends Request {
        trackId: string;
        likeStatus: LikeStatus;
    }

    export interface UpdatePlayerPlayingStatusRequest extends Request {
        trackId: string;
        isPlaying: boolean;
    }

    export interface PlayAlbumOrTrackRequest extends Request {
        item: IItem;
        playlistId: string;
    }

    export interface PlayPlaylistRequest extends Request {
        playlistId: string;
    }

    export interface GetDetailsRequest extends Request {
        trackId: string
    }

    export interface GetAlbumsOrTracksRequest extends Request {
        filter: string;
        sortBy: string;
        forPlaylistId: string;
        offset: number;
        size: number;
    }

    export interface GetTracksRequest extends Request {
        filter: string;
        albumId: string;
        forPlaylistId: string;
        offset: number;
        size: number;
    }

    export interface GetPlaylistsRequest extends Request {
        asSelector: boolean;
        forItemId: string;
        forItemIsTrack: boolean;
    }

    export interface AddPlaylistRequest extends Request {
        playlist: IPlaylist;
    }

    export interface RemovePlaylistRequest extends Request {
        playlist: IPlaylist;
    }

    export interface AddToPlaylistRequest extends Request {
        item: IItem;
        playlistId: string;
    }

    export interface RemoveFromPlaylistRequest extends Request {
        item: IItem;
        playlistId: string;
    }

