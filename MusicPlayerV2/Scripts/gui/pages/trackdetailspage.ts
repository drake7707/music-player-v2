

import { Page } from "../page";
import { PageManager } from "../pagemanager";
import { DomainManager } from "../../domain/manager";
import { NotificationManager } from "../notificationmanager";
import { IPlayerState } from "../../domain/objects";
import { BrowsePage } from "./browsepage";

export class TrackDetailsPage extends Page {
        private manager: DomainManager;

        private trackId: string;

        private loading: boolean = false;

        constructor(pageManager: PageManager, manager: DomainManager, trackId: string) {
            super(pageManager);
            this.manager = manager;
            this.trackId = trackId;
        }

        getTemplate(): string {
            var template = (<HTMLElement><any>$(".templates .page.trackdetails").get(0)).outerHTML;
            return template;
        }

        async bind(elementId: string) {
            this.bindModel(elementId, null);
            await this.fill();
        }

        getMethods() {
            return jQuery.extend(super.getMethods(), {
                album_click: async (album: string) => {
                    try {
                        let browsePage = new BrowsePage(this.pageManager, this.manager);
                        browsePage.filter = "album:" + album;
                        await this.pageManager.show(browsePage);
                    } catch (e) {
                        NotificationManager.showNotification("Unable to browse for selected album:" + e, true);
                    }
                },
                artist_click: (artist: string) => {
                    try {
                        let browsePage = new BrowsePage(this.pageManager, this.manager);
                        browsePage.filter = "artist:" + artist;
                        this.pageManager.show(browsePage);
                    } catch (e) {
                        NotificationManager.showNotification("Unable to browse for selected artist: " + e, true);
                    }
                }
            });
        }

        private async fill() {
            this.loading = true;
            let details = await this.manager.getDetails(this.trackId);
            this.rebindModel(details);
            this.loading = false;
        }

        async onevent(source: Page, eventName: string, data: any) {
            if (eventName == "CurrentTrackChanged") {
                try {
                    this.trackId = (<IPlayerState>data).currentTrack.id;
                    await this.fill();
                } catch (e) {
                    NotificationManager.showNotification("Unable to update details: " + e, true);
                }
            }
        }
    }
