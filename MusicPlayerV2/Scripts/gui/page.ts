import { Vue } from "vue/types/vue";
import { PageManager } from "./pagemanager";

export abstract class Page {

    id:string;
    protected gui: Vue | null = null;
    protected pageManager: PageManager;
    active: boolean = false;

    constructor(pageManager: PageManager) {
        this.pageManager = pageManager;
    }

    abstract getTemplate(): string;

    protected getMethods(): any {
        return {
            back_click: () => {
                this.pageManager.close();
            }
        }
    }

    protected getComputed(): any {
        return {};
    }

    abstract async bind(id: string): Promise<void>;


    close() {
        if (this.gui != null)
            this.gui.$destroy();
        this.gui = null;
    }

    onevent(source: Page, eventName: string, data: any) {

    }

    protected bindModel(elementId: string, model: any) {
        this.gui = new Vue({

            data: {
                model: model,
                page: this
            },
            el: "#" + elementId,
            methods: this.getMethods(),
            computed: this.getComputed()
        });
    }

    protected rebindModel(model: any) {
        this.gui!.$data.model = model;
    }
}
