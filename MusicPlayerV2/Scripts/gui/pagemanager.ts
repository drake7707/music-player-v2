
import { Page } from "./page";

export class PageManager {
    private pages: Page[] = [];

    private ignoreHashChange = false;

    constructor() {

        let self = this;

        if(PageManager.isMobile())  // handle back button by hash changes
            window.onhashchange = (ev) => self.page_hashChange(ev);
    }


    private static isMobile() {
        return /WPDesktop|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent);
    }

    private page_hashChange(ev: HashChangeEvent) {
        if (this.ignoreHashChange)
            return;

        // make sure the location.hash is the new one already
        window.setTimeout(() => {
            let hash = window.location.hash.replace("#", "");
            if (this.pages.length > 1 && this.pages[this.pages.length - 1].id != hash) {
                this.close();
            }
        }, 1);
    }

    private setHash(hash: string) {
        if(!PageManager.isMobile())  // handle back button by hash changes, but not on desktop browsers
            return;

        this.ignoreHashChange = true;
        window.location.hash = hash;
        window.setTimeout(() => {
            this.ignoreHashChange = false;
        },1);
    }

    async show(page: Page) {

        var template = page.getTemplate();

        let id = 'page-' + this.pages.length;
        $(".pages").append(`<div id="${id}">${template}</div>`);

        page.id = id;

        this.setHash(id);

        for (let page of this.pages)
            page.active = false;
        page.active = true;

        this.pages.push(page);


        try {
            await page.bind(id);
        } catch (e) {
            // close the new page, it can't be shown because bind failed
            this.close();

            throw e;
        }
    }

    close() {
        if (this.pages.length <= 1)
            return;

        let lastPage = this.pages[this.pages.length - 1];
        lastPage.active = false;
        lastPage.close();

        let id = 'page-' + (this.pages.length - 1);
        $("#" + id).empty().detach();
        this.pages.pop();

        lastPage = this.pages[this.pages.length - 1];
        lastPage.active = true;

        this.setHash(lastPage.id);
    }

    emit(source: Page, eventName: string, data: any) {
        for (let p of this.pages) {
            if (p !== source)
                p.onevent(source, eventName, data);
        }
    }
}
