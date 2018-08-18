import { Page } from "../page";
import { DomainManager } from "../../domain/manager";
import { IPlaylist, IPlayerState } from "../../domain/objects";
import { PageManager } from "../pagemanager";
import { NotificationManager } from "../notificationmanager";
import { EditPlaylistPage } from "./editplaylistpage";
import { BrowsePage } from "./browsepage";

export class PlaylistsPage extends Page {
    protected manager: DomainManager;


    private loading: boolean = false;

    private playlists: IPlaylist[] = [];

    selectedId: string = "";
    public title: string = "Playlists";
    protected canShowActions: boolean = true;

    constructor(pageManager: PageManager, manager: DomainManager) {
        super(pageManager);
        this.manager = manager;
    }


    get selectedPlaylist(): IPlaylist | null {
        let playlists = this.playlists.filter(p => p.id == this.selectedId);
        if (playlists.length == 0)
            return null;
        else
            return playlists[0];
    }


    getTemplate(): string {
        var template = (<HTMLElement><any>$(".templates .page.playlists").get(0)).outerHTML;
        return template;
    }

    getMethods() {
        return jQuery.extend(super.getMethods(), {
            item_click: (id: string) => {
                this.selectedId = (id === this.selectedId) ? "" : id;
            },

            newPlaylist_click: async () => {
                try {
                    let editPage = new EditPlaylistPage(this.pageManager, this.manager, null, () => {
                        this.fill();
                    });
                    await this.pageManager.show(editPage);
                } catch (e) {
                    NotificationManager.showNotification("Unable to create new playlist, error: " + e, true);
                }
            },

            showDetails_click: async () => {
                let playlist = this.playlists.filter(p => p.id == this.selectedId)[0];

                try {

                    let browsePage = new BrowsePage(this.pageManager, this.manager, undefined, playlist);
                    browsePage.title = playlist.name;
                    await this.pageManager.show(browsePage);
                    this.selectedId = "";
                } catch (e) {
                    NotificationManager.showNotification("Unable to show details, error: " + e, true);
                }
            },

            playNow_click: async () => {
                try {
                    let player: IPlayerState = await this.manager.playPlaylistNow(this.selectedId);
                    this.pageManager.emit(this, "PlayerStateChanged", player);
                    this.selectedId = "";

                    await this.fill();
                } catch (e) {
                    NotificationManager.showNotification("Unable to play the playlist now: " + e, true);
                }
            },

            playAfterCurrentTrack_click: async () => {
                try {
                    await this.manager.playPlaylistAfterCurrentTrack(this.selectedId);
                    NotificationManager.showNotification("Playlist successfully queued");
                    this.selectedId = "";
                } catch (e) {
                    NotificationManager.showNotification("Unable to play the playlist after current track: " + e, true);
                }
            },
            delete_click: async () => {
                if (this.selectedId == "")
                    return;

                if (confirm("Are you sure?")) {
                    try {
                        await this.manager.removePlaylist(this.playlists.filter(p => p.id == this.selectedId)[0]);

                        this.selectedId = "";
                        await this.fill();
                    } catch (e) {
                        NotificationManager.showNotification("Unable to delete playlist, error: " + e, true);
                    }
                }
            }
        });
    }

    async bind(id: string) {

        this.bindModel(id, this.playlists);
        await this.fill();
    }

    private async fill() {
        this.loading = true;
        this.playlists.splice(0, this.playlists.length);

        let playlists = await this.fetchPlaylists();
        for (let i: number = 0; i < playlists.length; i++)
            this.playlists.push(playlists[i]);

        this.loading = false;
    }

    protected async fetchPlaylists() {
        let playlists = await this.manager.getPlaylists();
        return playlists;
    }

}
