
import { Page } from "../page";
import { IPlayerState, IItem } from "../../domain/objects";
import { PageManager } from "../pagemanager";
import { NotificationManager } from "../notificationmanager";
import { DomainManager } from "../../domain/manager";
import { TrackDetailsPage } from "./trackdetailspage";
import { PlaylistsPage } from "./playlistspage";
import { AddToPlaylistsSelectorPage } from "./addplaylistsselectorpage";
import { BrowsePage } from "./browsepage";

export class MenuPage extends Page {
        private manager: DomainManager;
        private currentState: IPlayerState;

        constructor(pageManager: PageManager, manager: DomainManager, currentState: IPlayerState) {
            super(pageManager);
            this.manager = manager;
            this.currentState = currentState;
        }

        getTemplate(): string {
            var template = (<HTMLElement><any>$(".templates .page.menu").get(0)).outerHTML;
            return template;
        }

        getMethods() {
            return jQuery.extend(super.getMethods(), {
                details_click: async () => {
                    try {
                        let detailsPage = new TrackDetailsPage(this.pageManager, this.manager, this.currentState.currentTrack.id);
                        await this.pageManager.show(detailsPage);
                    } catch (e) {
                        NotificationManager.showNotification("Unable to fetch details: " + e, true);
                    }
                },
                playlists_click: async () => {
                    try {
                        let playlistsPage = new PlaylistsPage(this.pageManager, this.manager);
                        await this.pageManager.show(playlistsPage);
                    } catch (e) {
                        NotificationManager.showNotification("Unable to retrieve playlists: " + e, true);
                    }
                },
                browse_click: async () => {
                    try {
                        let browsePage = new BrowsePage(this.pageManager, this.manager);
                        await this.pageManager.show(browsePage);
                    } catch (e) {
                        NotificationManager.showNotification("Unable to retrieve content: " + e, true);
                    }
                },
                addToPlaylist_click: async () => {
                    if (this.currentState == null || this.currentState.currentTrack == null) return;

                    let item: IItem = {
                        id: this.currentState.currentTrack.id,
                        name: this.currentState.currentTrack.title,
                        isTrack: true
                    };

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
                }
            });
        }

        async bind(id: string) {
            var model = null;
            this.bindModel(id, model);
        }
    }
