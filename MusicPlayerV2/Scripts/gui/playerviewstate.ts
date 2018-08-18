
import { IPlayerState } from "../domain/objects";


export interface IPlayerViewState {
    isPlaying: boolean;

    progress: number;
    currentTime: number;
    totalTime: number;
    currentVolume: number;

    onLoadError: Function | null;
    onLoad: Function | null;
    onEnd: Function | null;

    stop(): void;
    playing(): boolean;
    play(): void;
    pause(): void;

    setVolume(percentage: number): void;
    getVolume(): number;

    getDuration(): number;

    seek(percentage: number): void;

    changeTrack(playerState: IPlayerState): void;

    synchronizeState(): void;
}

export class HowlPlayerViewState implements IPlayerViewState {

    private howl: Howl | null = null;
    isPlaying: boolean = false;

    progress: number = 0;
    currentTime: number = 0;
    totalTime: number = 0;
    currentVolume: number = 0.1;

    onLoadError: Function | null = null;
    onLoad: Function | null = null;
    onEnd: Function | null = null;

    private setHowl(howl: Howl | null) {
        if (this.howl != null) {
            // clean up
            this.howl.off("play");
            this.howl.off("pause");
            this.howl.off("stop");
            this.howl.off("volume");
            this.howl.off("seek");
            this.howl.off("loaderror");
            this.howl.off("load");
            this.howl.off("end");

            this.howl.stop();
            this.howl.unload();
        }
        this.howl = howl;

        if (this.howl != null) {
            this.howl.on("play", () => this.isPlaying = true);
            this.howl.on("pause", () => this.isPlaying = false);
            this.howl.on("stop", () => this.isPlaying = false);
            this.howl.on("volume", () => this.currentVolume = this.howl!.volume());
            this.howl.on("seek", () => this.synchronizeState());
            this.howl.on("loaderror", (id: number, error: any) => {
                if (this.onLoadError != null)
                    this.onLoadError(error);
            });
            this.howl.on("load", () => {
                if (this.onLoad != null)
                    this.onLoad();
            });
            this.howl.on("end", () => {
                if (this.onEnd != null)
                    this.onEnd();
            });
        }
    }

    synchronizeState(): void {
        if (this.howl != null) {
            try {
                this.isPlaying = this.howl.playing();
                this.currentVolume = this.howl.volume();
                if (this.howl.playing()) {
                    this.progress = (<number>this.howl.seek() / this.howl.duration());
                    this.currentTime = <number>this.howl.seek();
                    this.totalTime = this.howl.duration();
                }
            } catch (e) {
                console.warn("Error updating view state: " + e)
            };
        }
    }

    stop() {
        if (this.howl != null)
            this.howl.stop();
    }


    playing(): boolean {
        return this.howl == null ? false : this.howl.playing();
    }

    play() {
        if (this.howl != null)
            this.howl.play();
    }

    pause() {
        if (this.howl != null)
            this.howl.pause();
    }

    setVolume(percentage: number) {
        if (this.howl != null)
            this.howl!.volume(percentage);
    }

    getDuration(): number {
        return this.howl == null ? 0 : this.howl.duration();
    }

    getVolume(): number {
        return this.howl == null ? 0 : this.howl.volume();
    }

    seek(percentage: number) {
        if (this.howl != null)
            this.howl.seek(percentage * this.howl.duration());
    }


    changeTrack(playerState: IPlayerState) {
        if (playerState.currentTrack == null)
            this.setHowl(null);
        else
            this.setHowl(new Howl({
                src: [playerState.currentTrack.url],
                html5: true,
                volume: this.currentVolume,
                preload: true
            }));

        // force track to be loaded so duration is updated
        //this.viewState.howl!.play();
        //this.viewState.howl!.stop();
    }
}


export class JPlayerPlayerViewState implements IPlayerViewState {

    private jplayer: any | null = null;
    isPlaying: boolean = false;

    progress: number = 0;
    currentTime: number = 0;
    totalTime: number = 0;
    currentVolume: number = 0.1;

    onLoadError: Function | null = null;
    onLoad: Function | null = null;
    onEnd: Function | null = null;


    constructor() {

        this.initialize();
    }

    private initialize() {
        var self = this;

        var container = $("<div id='jplayer' style='display:block'></div>");
        $(document.body).append(container);
        this.jplayer = (<any>$("#jplayer"));
        this.jplayer.jPlayer({
            ready: function (event: any) {

            },
            supplied: "mp3",
            wmode: "window",
            useStateClassSkin: true,
            autoBlur: false,
            smoothPlayBar: true,
            keyEnabled: true,
            remainingDuration: false,
            toggleDuration: true,
            errorAlerts: false,
            warningAlerts: false,
            consoleAlerts: false,

            volume: this.currentVolume,

            error: function (event: any) {
                if (self.onLoadError != null)
                    self.onLoadError(event.jPlayer.error);
            },
            ended: function () {
                self.isPlaying = false;

                if (self.onEnd != null)
                    self.onEnd();
            },
            playing: function (ev: any) {
                self.isPlaying = true;

            },
            pause: function (ev: any) {
                self.isPlaying = false;
            }
        });
        this.jplayer.bind((<any>$).jPlayer.event.volumechange, function (event: any) {
            self.currentVolume = event.jPlayer.options.volume;
        });
        this.jplayer.bind((<any>$).jPlayer.event.loadeddata, function (event: any) {
            if (self.onLoad != null)
                self.onLoad();
        });


    }

    synchronizeState(): void {
        try {
            this.totalTime = this.getDuration();
            this.currentTime = this.jplayer.data("jPlayer").status.currentTime;
            this.progress = this.currentTime / this.totalTime;
        }
        catch (e) {

        }
        // if (this.howl != null) {
        //     try {
        //         this.isPlaying = this.howl.playing();
        //         this.currentVolume = this.howl.volume();
        //         if (this.howl.playing()) {
        //             this.progress = (<number>this.howl.seek() / this.howl.duration());
        //             this.currentTime = <number>this.howl.seek();
        //             this.totalTime = this.howl.duration();
        //         }
        //     } catch (e) {
        //         console.warn("Error updating view state: " + e)
        //     };
        // }
    }

    stop() {
        this.jplayer.jPlayer("stop");
        this.isPlaying = false; // immediately change it to false
    }


    playing(): boolean {
        return !this.jplayer.data("jPlayer").status.paused;
    }

    play() {
        this.jplayer.jPlayer("play");
    }

    pause() {
        this.jplayer.jPlayer("pause");
    }

    setVolume(percentage: number) {
        this.jplayer.jPlayer("volume", percentage);
    }

    getDuration(): number {
        return this.jplayer.data("jPlayer").status.duration;
    }

    getVolume(): number {
        return this.currentVolume;
    }

    seek(percentage: number) {
        if(this.isPlaying) {
            this.jplayer.jPlayer("play", percentage * this.getDuration());
            this.currentTime = percentage * this.getDuration(); // force immediate update
        }
    }


    changeTrack(playerState: IPlayerState) {
        if (playerState.currentTrack == null) {
            this.jplayer.jPlayer("setMedia", {
                title: "",
                mp3: ""
            });
        }
        else {
            this.jplayer.jPlayer("setMedia", {
                title: playerState.currentTrack.title,
                mp3: playerState.currentTrack.url
            });
        }

        // force track to be loaded so duration is updated
        //this.viewState.howl!.play();
        //this.viewState.howl!.stop();
    }
}