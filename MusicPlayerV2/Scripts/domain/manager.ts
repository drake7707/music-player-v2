import { IPlayerState, LikeStatus, IItem, IPlaylist, ITrackDetails } from "./objects";
import * as APIMessages from "./apimessages";
import { DummyBackend } from "./dummybackend";


let TEST = false;

export class DomainManager {


    async getCurrentPlayerState(): Promise<IPlayerState> {
        let playerResult = await this.get<APIMessages.GetPlayerStateResult>("/api/player/GetCurrentPlayerState");
        return playerResult.player;
    }

    async getCurrentTrackId() {
        let result = await this.get<APIMessages.GetCurrentTrackIdResult>("/api/player/GetCurrentTrackId");
        return result.trackId;
    }

    async previousTrack(currentTrackId: string): Promise<IPlayerState> {
        let playerResult = await this.post<APIMessages.PreviousTrackResult>("/api/player/PreviousTrack",
            <APIMessages.PreviousTrackRequest>{
                currentTrackId: currentTrackId,
            });
        return playerResult.player;
    }

    async nextTrack(currentTrackId: string, playedToEnd: boolean): Promise<IPlayerState> {
        let playerResult = await this.post<APIMessages.NextTrackResult>("/api/player/NextTrack",
            <APIMessages.NextTrackRequest>{
                currentTrackId: currentTrackId,
                playedToEnd: playedToEnd
            });
        return playerResult.player;
    }

    async toggleShuffle(shuffle: boolean) {
        let playerResult = await this.post<APIMessages.GetPlayerStateResult>("/api/player/ToggleShuffle",
            <APIMessages.ToggleShuffleRequest>{
                shuffle: shuffle
            });
        return playerResult.player;
    }

    async setLikeStatus(trackId: string, status: LikeStatus) {
        let playerResult = await this.post<APIMessages.SetLikeStatusRequestResult>("/api/player/SetLikeStatus",
            <APIMessages.SetLikeStatusRequest>{
                trackId: trackId,
                likeStatus: status
            });
        return playerResult.player;
    }

    async updatePlayerPlayingStatus(trackId: string, isPlaying: boolean) {
        await this.post<APIMessages.Result>("/api/player/UpdatePlayerPlayingStatus",
            <APIMessages.UpdatePlayerPlayingStatusRequest>{
                trackId: trackId,
                isPlaying: isPlaying
            });
    }

    async getPlaylists(asSelector: boolean = false, forItem: IItem | null = null): Promise<IPlaylist[]> {
        let playlistsResult = await this.get<APIMessages.GetPlaylistsResult>("/api/playlist/GetPlaylists",
            <APIMessages.GetPlaylistsRequest>{
                asSelector: asSelector,
                forItemId: forItem == null ? undefined : forItem.id,
                forItemIsTrack: forItem == null ? undefined : forItem.isTrack
            });
        return playlistsResult.playlists;
    }

    async getAlbumsOrTracks(filter: string, sortBy: string, forPlaylistId?: string, offset: number = 0, size: number = Number.MAX_VALUE): Promise<APIMessages.GetTracksResult> {
        let albumsOrTrackResult = await this.get<APIMessages.GetAlbumsOrTracksResult>("/api/playlist/GetAlbumsOrTracks",
            <APIMessages.GetAlbumsOrTracksRequest>{
                filter: filter,
                sortBy: sortBy,
                forPlaylistId: forPlaylistId,
                offset: offset,
                size: size
            });
        return albumsOrTrackResult;
    }

    async getTracks(filter: string, albumId: string, forPlaylistId?: string, offset: number = 0, size: number = Number.MAX_VALUE): Promise<APIMessages.GetTracksResult> {
        let result = await this.get<APIMessages.GetTracksResult>("/api/playlist/GetTracks",
            <APIMessages.GetTracksRequest>{
                filter: filter,
                albumId: albumId,
                forPlaylistId: forPlaylistId,
                offset: offset,
                size: size
            });
        return result;
    }

    async addPlaylist(playlist: IPlaylist) {
        let result = await this.post<APIMessages.Result>("/api/playlist/AddPlaylist",
            <APIMessages.RemovePlaylistRequest>{
                playlist: playlist
            });
    }

    async removePlaylist(playlist: IPlaylist) {
        let result = await this.post<APIMessages.Result>("/api/playlist/RemovePlaylist",
            <APIMessages.RemovePlaylistRequest>{
                playlist: playlist
            });
    }

    async addToPlaylist(item: IItem, playlistId: string) {
        let result = await this.post<APIMessages.Result>("/api/playlist/AddToPlaylist",
            <APIMessages.AddToPlaylistRequest>{
                item: item,
                playlistId: playlistId
            });
    }

    async removeFromPlaylist(item: IItem, playlistId: string | undefined) {
        let result = await this.post<APIMessages.Result>("/api/playlist/RemoveFromPlaylist",
            <APIMessages.AddToPlaylistRequest>{
                item: item,
                playlistId: playlistId
            });
    }

    async playAlbumOrTrackAfterCurrentTrack(item: IItem, playlistId?: string) {
        let result = await this.post<APIMessages.Result>("/api/player/PlayAlbumOrTrackAfterCurrentTrack",
            <APIMessages.PlayAlbumOrTrackRequest>{
                item: item,
                playlistId: playlistId
            });
    }

    async playAlbumOrTrackNow(item: IItem, playlistId?: string): Promise<IPlayerState> {
        let result = await this.post<APIMessages.GetPlayerStateResult>("/api/player/PlayAlbumOrTrackNow",
            <APIMessages.PlayAlbumOrTrackRequest>{
                item: item,
                playlistId: playlistId
            });
        return result.player;
    }

    async playPlaylistAfterCurrentTrack(playlistId: string) {
        let result = await this.post<APIMessages.Result>("/api/player/PlayPlaylistAfterCurrentTrack",
            <APIMessages.PlayPlaylistRequest>{
                playlistId: playlistId
            });
    }

    async playPlaylistNow(playlistId: string): Promise<IPlayerState> {
        let result = await this.post<APIMessages.GetPlayerStateResult>("/api/player/PlayPlaylistNow",
            <APIMessages.PlayPlaylistRequest>{
                playlistId: playlistId
            });
        return result.player;
    }


    async getDetails(trackId: string): Promise<ITrackDetails> {
        let result = await this.get<APIMessages.GetDetailsResult>("/api/player/GetDetails",
            <APIMessages.GetDetailsRequest>{
                trackId: trackId
            });
        return result.details;
    }

    private async get<T extends APIMessages.Result>(path: string, data?: any): Promise<T> {
        // do ajax fetch here, dummy data is done now
        return new Promise<T>((then, reject) => {
            if (TEST) {
                DummyBackend.get(then, reject, path, data);
                return;
            }
            $.ajax(path, {
                cache: false,
                method: "GET",
                data: data,
                success: (data: APIMessages.Result) => {
                    if (data == null || typeof (data) === "undefined")
                        reject("No content");

                    if (data.success)
                        then(<T>data);
                    else
                        reject(data.message);
                },
                error: (e) => {
                    reject(e.statusText + " - " + e.responseText);
                }
            });

        });
    }

    private async post<T extends APIMessages.Result>(path: string, data?: any): Promise<T> {
        // do ajax fetch here, dummy data is done now
        return new Promise<T>((then, reject) => {
            if (TEST) {
                DummyBackend.get(then, reject, path, data);
                return;
            }

            $.ajax(path, {
                cache: false,
                method: "POST",
                data: JSON.stringify(data),
                contentType: "application/json; charset=utf-8",
                success: (data: APIMessages.Result) => {
                    if (data == null || typeof (data) === "undefined")
                        reject("No content");

                    if (data.success)
                        then(<T>data);
                    else
                        reject(data.message);
                },
                error: (e) => {
                    reject(e.statusText + " - " + e.responseText);
                }
            });
        });
    }
}

