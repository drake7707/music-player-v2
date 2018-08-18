
import { Page } from "../page";
import { IPlaylist, IAlbumOrTrackItem, IPlayerState } from "../../domain/objects";
import { PageManager } from "../pagemanager";
import { DomainManager } from "../../domain/manager";
import { NotificationManager } from "../notificationmanager";
import { AddToPlaylistsSelectorPage } from "./addplaylistsselectorpage";
import * as APIMessages from "../../domain/APIMessages";

export class BrowsePage extends Page {
        protected manager: DomainManager;

        private loading: boolean = false;

        private PAGE_SIZE = 100;

        private viewState = {
            tileView: false,
            filter: "",
            title: 'Browse',
            selectedId: "",
            selectedIndex: -1,
            hasDetails: false,

            showSorting: true,
            sortBy: '',

            hasMoreResults: false,
            lastOffset: 0
            //    contextMenuTop: 0
        };

        get title(): string { return this.viewState.title; }
        set title(value: string) { this.viewState.title = value; }

        get filter(): string { return this.viewState.filter; }
        set filter(value: string) { this.viewState.filter = value; }

        private items: IAlbumOrTrackItem[] = [];

        private forPlaylist?: IPlaylist;

        private parentAlbumId?: string;
        constructor(pageManager: PageManager, manager: DomainManager, parentAlbumId?: string, forPlaylist?: IPlaylist) {
            super(pageManager);
            this.manager = manager;
            this.forPlaylist = forPlaylist;
            this.parentAlbumId = parentAlbumId;
            if (typeof (this.parentAlbumId) !== "undefined")
                this.viewState.showSorting = false;
        }

        getTemplate(): string {
            var template = (<HTMLElement><any>$(".templates .page.browse").get(0)).outerHTML;
            return template;
        }

        getMethods(): any {
            return jQuery.extend(super.getMethods(), {
                item_click: (id: string, index: number, event: Event) => {
                    this.viewState.selectedId = (id === this.viewState.selectedId) ? "" : id;
                    this.viewState.selectedIndex = (index === this.viewState.selectedIndex ? - 1 : index);
                    this.viewState.hasDetails = this.viewState.selectedIndex >= 0 && !this.items[this.viewState.selectedIndex].isTrack;

                    // this.viewState.contextMenuTop = (<HTMLElement>event.target).getBoundingClientRect().top +  (<HTMLElement>event.target).getBoundingClientRect().height; 
                },

                tileview_click: () => {
                    this.viewState.tileView = !this.viewState.tileView;
                },


                filter_keyup: async (ev:KeyboardEvent) => {
                    try {
                        if(ev.which == 13) {
                            this.scrollToTop();
                            await this.fill(0);
                        }
                    } catch (e) {
                        NotificationManager.showNotification("Unable to load results: " + e, true);
                    }
                },
             /*   filter_change: async () => {
                    try {
                        await this.fill(0);
                    } catch (e) {
                        NotificationManager.showNotification("Unable to load results: " + e, true);
                    }
                },*/

                showDetails_click: async () => {
                    try {

                        let item = this.items[this.viewState.selectedIndex];
                        let browsePage = new BrowsePage(this.pageManager, this.manager, this.viewState.selectedId, this.forPlaylist);
                        browsePage.viewState.filter = this.viewState.filter;
                        browsePage.title = item.name;
                        await this.pageManager.show(browsePage);

                    } catch (e) {
                        NotificationManager.showNotification("Unable to load details: " + e, true);
                    }
                },

                addToPlaylist_click: async () => {
                    let item = this.items[this.viewState.selectedIndex];

                    try {
                        let playlistSelector: AddToPlaylistsSelectorPage = new AddToPlaylistsSelectorPage(this.pageManager, this.manager, item, async () => {
                            try {
                                await this.manager.addToPlaylist(item, playlistSelector.selectedId);
                                NotificationManager.showNotification(`${item.name} added to playlist ${playlistSelector.selectedPlaylist!.name}`);
                            } catch (e) {
                                NotificationManager.showNotification(`Unable to add ${item.name} to playlist ${playlistSelector.selectedPlaylist!.name}: ` + e, true);
                            }
                        });
                        await this.pageManager.show(playlistSelector);
                    } catch (e) {
                        NotificationManager.showNotification("Unable to fetch playlists: " + e, true);
                    }
                },

                removeFromPlaylist_click: async () => {
                    if (typeof this.forPlaylist === "undefined") return;

                    let item = this.items[this.viewState.selectedIndex];

                    try {
                        await this.manager.removeFromPlaylist(item, this.forPlaylist.id);
                        NotificationManager.showNotification(`${item.name} removed from playlist ${this.forPlaylist.name}`);
                        this.items.splice(this.viewState.selectedIndex, 1);
                        this.deselect();
                    } catch (e) {
                        NotificationManager.showNotification(`Unable to remove ${item.name} from playlist ${this.forPlaylist.name}: ` + e, true);
                    }
                },

                playNow_click: async () => {

                    let item = this.items[this.viewState.selectedIndex];
                    try {
                        let playlistId: string | undefined = (typeof this.forPlaylist === "undefined") ? undefined : this.forPlaylist.id;
                        let player: IPlayerState = await this.manager.playAlbumOrTrackNow(item, playlistId);
                        this.pageManager.emit(this, "PlayerStateChanged", player);
                        this.deselect();
                    } catch (e) {
                        NotificationManager.showNotification("Unable to play the track now: " + e, true);
                    }
                    // probably goto [All] playlist if we are not browsing for a specific playlist,
                    // otherwise switch to the specific playlist
                },

                playAfterCurrentTrack_click: async () => {

                    // noooot exactly how i'll do this, swap the order around in the playlist i guess?
                    let item = this.items[this.viewState.selectedIndex];
                    try {
                        let playlistId: string | undefined = (typeof this.forPlaylist === "undefined") ? undefined : this.forPlaylist.id;
                        await this.manager.playAlbumOrTrackAfterCurrentTrack(item, playlistId);
                        NotificationManager.showNotification("Item successfully (re)queued");
                        this.deselect();
                    } catch (e) {
                        NotificationManager.showNotification("Unable to play the track after the current track: " + e, true);
                    }
                },

                sortBy_click: async (sortField: string) => {
                    try {
                        this.viewState.sortBy = sortField;
                        this.scrollToTop();
                        console.log("Sorting changed to " + this.viewState.sortBy);

                        await this.fill(0);
                    } catch (e) {
                        NotificationManager.showNotification("Unable to load results: " + e, true);
                    }
                },

                loadMore_click: async () => {
                    if (this.viewState.hasMoreResults) {
                        await this.fill(this.viewState.lastOffset + this.PAGE_SIZE);
                    }
                },

                list_scroll: async (event: Event) => {
                    let rect = (<HTMLElement>event.target).getBoundingClientRect();
                    let scrollPerc = ((<HTMLElement>event.target).scrollTop / ((<HTMLElement>event.target).scrollHeight - rect.height));
                    const SCROLL_PERCENTAGE_THRESHOLD = 0.9;

                    if (scrollPerc > SCROLL_PERCENTAGE_THRESHOLD && this.viewState.hasMoreResults && !this.loading) {
                        await this.fill(this.viewState.lastOffset + this.PAGE_SIZE);
                    }
                }

            });
        }

        private scrollToTop() {
            this.gui!.$nextTick(() => {
                (<HTMLElement>this.gui!.$refs["body"]).scrollTop = 0;
            });
        }

        private deselect() {
            this.viewState.selectedId = "";
            this.viewState.selectedIndex = -1;
        }

        async bind(id: string) {
            this.bindModel(id, this.items);
            await this.fill(0);
        }


        private async fill(offset: number) {
            if (offset == 0)
                this.items.splice(0, this.items.length);

            this.loading = true;

            let result: APIMessages.GetAlbumsOrTracksResult;

            let forPlaylistId: string | undefined = (typeof this.forPlaylist === "undefined") ? undefined : this.forPlaylist.id;

            if (typeof this.parentAlbumId === "undefined")
                result = await this.manager.getAlbumsOrTracks(this.viewState.filter, this.viewState.sortBy, forPlaylistId, offset, this.PAGE_SIZE)
            else
                result = await this.manager.getTracks(this.viewState.filter, this.parentAlbumId, forPlaylistId, offset, this.PAGE_SIZE);

            if (offset == 0) // clear it again, because it's possible that multiple calls were awaiting
                this.items.splice(0, this.items.length);

            for (let i: number = 0; i < result.items.length; i++)
                this.items.push(result.items[i]);

            this.viewState.lastOffset = offset;
            this.viewState.hasMoreResults = this.viewState.lastOffset + this.PAGE_SIZE < result.totalCount;

            this.loading = false;
        }
    }