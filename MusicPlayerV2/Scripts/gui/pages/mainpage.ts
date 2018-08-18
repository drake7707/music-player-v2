import { Page } from "../page";
import { DomainManager } from "../../domain/manager";
import { IPlayerState, ITrack, LikeStatus } from "../../domain/objects";
import { HowlPlayerViewState, IPlayerViewState, JPlayerPlayerViewState } from "../playerviewstate";
import { PageManager } from "../pagemanager";
import { NotificationManager } from "../notificationmanager";
import { MenuPage } from "./menupage";


function updateBackgroundSVG(imgUrl: string) {
    $('<img/>').attr('src', imgUrl).on('load', function () {
        $(this).remove();
        $("#artbackgroundsvg").fadeOut(200, function () {
            $("#artbackgroundsvg").attr("xlink:href", imgUrl);
            $("#artbackgroundsvg").fadeIn(200);
        });

    }).on("error", function () {
        $("#artbackgroundsvg").fadeOut(200, function () {
            $("#artbackgroundsvg").attr("xlink:href", '');
            $("#artbackgroundsvg").fadeIn(200);
        });
    })

}

export class MainPage extends Page {
    private manager: DomainManager;

    private playerState: IPlayerState | null = null;


    get currentTrack(): ITrack | null {
        return this.playerState == null ? null : this.playerState.currentTrack;
    }

    private loading: boolean = false;
    private loadingNext: boolean = false;
    private loadingPrevious: boolean = false;

    // loadingTrack is only set to true when trackLoaded is false, so track was not loaded before and only when the user wants to play
    // because howler lazy loads the track
    private loadingTrack: boolean = false;

    // will be true when the track is ready for playback
    private trackLoaded: boolean = false;

    private toggleShowVolume: boolean = false;

    private viewState: IPlayerViewState = new JPlayerPlayerViewState();
    private tmrUpdateProgressId: number;
    private tmrCheckIfTrackIsStillCurrentId: number;

    constructor(pageManager: PageManager, manager: DomainManager) {
        super(pageManager);
        this.manager = manager;

        this.tmrUpdateProgressId = window.setInterval(() => this.tmrUpdateProgress_Tick(), 1000);
        this.tmrCheckIfTrackIsStillCurrentId = window.setTimeout(() => this.tmrCheckIfTrackIsStillCurrent_Tick(), 10000);

        this.viewState.onLoadError = (error:any) => this.player_LoadError(error);
        this.viewState.onLoad = () => this.player_Load();
        this.viewState.onEnd = () => this.player_End();
    }


    private player_LoadError(error: any) {
        NotificationManager.showNotification("Error loading track: " + JSON.stringify(error), true);
        this.loadingTrack = false;
        this.trackLoaded = false;
    }

    private player_Load() {
        console.log("Track loaded");
        this.loadingTrack = false;
        this.trackLoaded = true;
    }

    private player_End() {
        console.log("Finished");
        this.playNext(true);
    }

    getTemplate(): string {
        var template = (<HTMLElement><any>$(".templates .page.main").get(0)).outerHTML;
        return template;
    }

    protected getMethods() {
        var methods = {
            play_click: async () => {
                await this.togglePlayback();
            },

            stop_click: async () => {
                await this.stopPlayback();
            },

            rewind_click: async () => {
                await this.playPrevious();
            },
            fastForward_click: async () => {
                this.playNext(false);
            },

            volume_click: () => {
                this.toggleShowVolume = !this.toggleShowVolume;
            },

            volumebar_mouseup: (event: MouseEvent) => {
                let percentage = event.offsetX / <number>$(event.currentTarget).width();
                if (percentage < 0) percentage = 0;
                if (percentage > 1) percentage = 1;
                this.viewState.setVolume(percentage);
            },

            progressbar_mouseup: (event: MouseEvent) => {
                let percentage = event.offsetX / <number>$(event.currentTarget).width();
                if (percentage < 0) percentage = 0;
                if (percentage > 1) percentage = 1;
                this.viewState.seek(percentage);
            },

            shuffle_click: async () => {
                if (this.playerState == null) return;

                try {
                    let playerState = await this.manager.toggleShuffle(!this.playerState.shuffle);
                    this.setPlayerState(playerState, true);
                } catch (e) {
                    NotificationManager.showNotification("Unable to set toggle shuffle: " + e, true);
                }
            },

            like_click: async () => {
                if (this.playerState == null || this.playerState.currentTrack == null) return;

                try {
                    if (this.playerState!.currentTrack.liked == LikeStatus.None) {
                        let playerState = await this.manager.setLikeStatus(this.playerState.currentTrack.id, LikeStatus.Liked);
                        this.setPlayerState(playerState, true);
                    }
                    else {
                        await this.manager.setLikeStatus(this.playerState.currentTrack.id, LikeStatus.None);
                        this.playerState!.currentTrack.liked = LikeStatus.None;
                    }
                } catch (e) {
                    NotificationManager.showNotification("Unable to set like status: " + e, true);
                }
            },

            menu_click: async () => {
                if (this.playerState == null) return;

                try {
                    var menuPage = new MenuPage(this.pageManager, this.manager, this.playerState);
                    await this.pageManager.show(menuPage);
                } catch (e) {
                    NotificationManager.showNotification("Unable to show menu: " + e, true);
                }
            }

        };
        return jQuery.extend(super.getMethods(), methods);
    }


    private volumeTimerId: number = -1;

    volumeUp() {

        this.toggleShowVolume = true;

        let percentage = this.viewState.getVolume();
        percentage += (percentage < 0.05 ? 0.01 : 0.05);

        if (percentage < 0) percentage = 0;
        if (percentage > 1) percentage = 1;
        this.viewState.setVolume(percentage);

        if (this.volumeTimerId != -1) window.clearTimeout(this.volumeTimerId);
        this.volumeTimerId = window.setTimeout(() => {
            this.toggleShowVolume = false;
        }, 1000);
    }

    volumeDown() {

        this.toggleShowVolume = true;

        let percentage = this.viewState.getVolume();
        percentage -= (percentage <= 0.05 ? 0.01 : 0.05);

        if (percentage < 0) percentage = 0;
        if (percentage > 1) percentage = 1;
        this.viewState.setVolume(percentage);

        if (this.volumeTimerId != -1) window.clearTimeout(this.volumeTimerId);
        this.volumeTimerId = window.setTimeout(() => {
            this.toggleShowVolume = false;
        }, 1000);
    }

    async playPrevious() {
        if (this.playerState == null) return;

        let wasPlaying = this.viewState.playing();

        this.loadingPrevious = true;
        try {
            let player = await this.manager.previousTrack(this.playerState.currentTrack.id);
            this.setPlayerState(player, true);
        }
        catch (e) {
            NotificationManager.showNotification("Error setting previous track: " + e, true);
        }
        this.loadingPrevious = false;
    }

    async togglePlayback() {
        if (this.playerState == null) return;

        if (this.viewState.playing()) {
            this.viewState.pause();
            try {
                await this.manager.updatePlayerPlayingStatus(this.playerState.currentTrack.id, false);
            }
            catch (e) {
                NotificationManager.showNotification("Unable to set player playing status: " + e, true);
            }
        }
        else {
            if (!this.trackLoaded) // show track loading only when the track wasn't loaded before, as otherwise the load event isn't triggered
                this.loadingTrack = true;

            this.viewState.play();
            try {
                await this.manager.updatePlayerPlayingStatus(this.playerState.currentTrack.id, true);
            }
            catch (e) {
                NotificationManager.showNotification("Unable to set player playing status: " + e, true);
            }
        }
    }

    async stopPlayback() {
        if (this.playerState == null) return;

        let wasPlaying = this.viewState.playing();

        this.viewState.stop();
        this.viewState.seek(0);
        this.viewState.currentTime = 0; // synchronizestate only changes this if howl is playing to prevent errors
        this.viewState.progress = 0;

        if (wasPlaying) {
            try {
                await this.manager.updatePlayerPlayingStatus(this.playerState.currentTrack.id, false);
            }
            catch (e) {
                NotificationManager.showNotification("Unable to set player playing status: " + e, true);
            }
        }
    }

    async playNext(playedToEnd: boolean) {
        if (this.playerState == null) return;

        this.loadingNext = true;
        try {

            let wasPlaying = this.viewState.playing() || playedToEnd;

            let player = await this.manager.nextTrack(this.playerState.currentTrack.id, playedToEnd);
            this.setPlayerState(player, false);
            // continuePlaying will play the next track if the howl was playing, which it wasn't if playedToEnd == true

            // so check manually
            if (wasPlaying && !this.viewState.playing()) // if it was playing continue with the next song
                this.togglePlayback();
            else {
                this.viewState.seek(0);
                this.viewState.currentTime = 0; // synchronizestate only changes this if howl is playing to prevent errors
                this.viewState.progress = 0;
            }

        } catch (e) {
            NotificationManager.showNotification("Error setting next track: " + e, true);
        }
        this.loadingNext = false;
    }

    protected getComputed() {
        return jQuery.extend(super.getComputed(), {
            formattedCurrentTime: () => {
                return MainPage.formatTime(this.viewState.currentTime);
            },

            formattedTotalTime: () => {
                return MainPage.formatTime(this.viewState.totalTime);
            }
        });
    }

    private static formatTime(time: number): string {
        if (typeof (time) === "undefined" || isNaN(time))
            return "--:--";

        let seconds = Math.round(time) % 60;
        let minutes = Math.floor(Math.round(time) / 60);

        return ((minutes + "").length == 1 ? "0" : "") + minutes + ":" +
            ((seconds + "").length == 1 ? "0" : "") + seconds;
    }

    async bind(elementId: string) {
        this.bindModel(elementId, this.playerState);
        console.log("Loading..");
        this.loading = true;

        let player = await this.manager.getCurrentPlayerState();
        this.setPlayerState(player, false);

        console.log("Loading done");
        this.loading = false;
    }

    /**
     * Sets the new player state and initializes a new howl to play it
     */
    private setPlayerState(playerState: IPlayerState, continuePlaying: boolean) {

        let isTrackChanged: boolean = this.isTrackChanged(playerState.currentTrack == null ? null : playerState.currentTrack.id);
        let wasPlaying = this.viewState.isPlaying;

        this.playerState = playerState;
        if (isTrackChanged) {

            if (this.playerState.currentTrack == null)
                updateBackgroundSVG("");
            else
                updateBackgroundSVG(this.playerState.currentTrack.artImage);


            this.viewState.changeTrack(this.playerState);

            if (continuePlaying) {
                if (wasPlaying && !this.viewState.playing()) // if it was playing continue with the next song
                    this.togglePlayback();
                else {
                    this.viewState.seek(0);
                    this.viewState.currentTime = 0; // synchronizestate only changes this if howl is playing to prevent errors
                    this.viewState.progress = 0;
                }
            }

            this.pageManager.emit(this, "CurrentTrackChanged", this.playerState);

        }
        this.rebindModel(this.playerState);
    }

    private isTrackChanged(id: string | null) {
        let isTrackChanged: boolean = this.playerState == null ||
            (this.playerState.currentTrack == null && id != null) ||
            (this.playerState.currentTrack != null && id == null) ||
            (this.playerState.currentTrack != null && id != null &&
                this.playerState.currentTrack.id != id);
        return isTrackChanged;
    }

    private tmrUpdateProgress_Tick(): void {
        this.viewState.synchronizeState();
    }

    private async tmrCheckIfTrackIsStillCurrent_Tick() {
        try {
            // don't check during loading, it might be changing anyway
            if (this.loadingNext || this.loadingPrevious || this.loading)
                return;

            let trackId = await this.manager.getCurrentTrackId();

            if (this.isTrackChanged(trackId)) {
                console.log("Track was changed on server, updating state");
                let player = await this.manager.getCurrentPlayerState();
                this.setPlayerState(player, true);
            }
        } catch (e) {
            console.error("Unable to check current track state: " + e);
        }
        finally {
            this.tmrCheckIfTrackIsStillCurrentId = window.setTimeout(() => this.tmrCheckIfTrackIsStillCurrent_Tick(), 10000);
        }
    }

    onevent(source: Page, eventName: string, data: any) {
        if (eventName == "PlayerStateChanged") {
            this.setPlayerState(data, true);
        }
    }

    close() {
        this.viewState.stop();

        window.clearInterval(this.tmrUpdateProgressId);
        window.clearTimeout(this.tmrCheckIfTrackIsStillCurrentId);
        super.close();
    }
}
