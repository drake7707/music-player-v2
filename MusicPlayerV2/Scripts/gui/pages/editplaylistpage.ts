

import { Page } from "../page";
import { PageManager } from "../pagemanager";
import { IPlaylist } from "../../domain/objects";
import { DomainManager } from "../../domain/manager";
import { NotificationManager } from "../notificationmanager";

export class EditPlaylistPage extends Page {
        private manager: DomainManager;

        private playlist: IPlaylist;

        private isNew: boolean = false;

        private onclose: (() => void) | null;

        constructor(pageManager: PageManager, manager: DomainManager, playlist: IPlaylist | null = null, onclose: (() => void) | null = null) {
            super(pageManager);
            this.manager = manager;
            this.onclose = onclose;
            if (playlist == null) {
                this.playlist = {
                    id: "",
                    name: "",
                    isCurrent: false,
                    nrOfTracks: 0
                };
                this.isNew = true;
            }
            else {
                this.playlist = playlist;
                this.isNew = false;
            }

        }

        getTemplate(): string {
            var template = (<HTMLElement><any>$(".templates .page.edit-playlist").get(0)).outerHTML;
            return template;
        }

        private validate(): string[] {
            if (this.playlist.name == "")
                return ["Name is required"];

            return [];
        }

        getMethods() {
            return jQuery.extend(super.getMethods(), {
                save_click: async () => {
                    try {
                        let validation = this.validate();
                        if (validation.length > 0) {
                            NotificationManager.showNotification("Not all fields are valid: <br:>" + validation.join("<br/>"), false);
                        }
                        else {
                            await this.manager.addPlaylist(this.playlist);
                            this.pageManager.close();
                        }
                    } catch (e) {
                        NotificationManager.showNotification("Unable to save: " + e, true);
                    }
                }
            });
        }

        async bind(id: string) {
            this.bindModel(id, this.playlist);
        }

        close() {
            if (this.onclose != null)
                this.onclose();

            super.close();
        }
    }
