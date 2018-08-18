 
import { PlaylistsPage } from "./playlistspage";
import { PageManager } from "../pagemanager";
import { IItem } from "../../domain/objects";
import { DomainManager } from "../../domain/manager";

export class AddToPlaylistsSelectorPage extends PlaylistsPage {
        
                private onselected: (() => void);
                private forItem: IItem;
                public title: string = "Add to playlist";
                constructor(pageManager: PageManager, manager: DomainManager, forItem: IItem, onselected: (() => void)) {
                    super(pageManager, manager);
                    this.canShowActions = false;
                    this.onselected = onselected;
                    this.forItem = forItem;
                }
        
                getMethods() {
                    return jQuery.extend(super.getMethods(), {
                        item_click: (id: string) => {
                            this.selectedId = (id === this.selectedId) ? "" : id;
        
                            if (this.selectedId !== "") { // selection is made
                                if (this.onselected != null)
                                    this.onselected();
        
                                this.pageManager.close();
                            }
                        }
                    });
                }
        
                async fetchPlaylists() {
                    let playlists = await this.manager.getPlaylists(true, this.forItem);
                    return playlists;
                }
            }
        