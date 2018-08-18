// only necessary for typescript to recognize Vue

import { Page } from "./gui/page";
import { MainPage } from "./gui/pages/mainpage";
import { PageManager } from "./gui/pagemanager";
import { DomainManager } from "./domain/manager";
import { NotificationManager } from "./gui/notificationmanager";
import { Vue } from "vue/types/vue";


const TEST: boolean = false;

console.clear();


Vue.config.errorHandler = (err) => {
    console.error("Vue compilation error: " + err.name + ": " + err.message);
}

Vue.component("loading", {
    template: $(".templates .loader").html()
});

Vue.directive("perfectscrollbar", {
    bind: (el: HTMLElement, binding: any, vnode: any) => {
        (<any>$(el)).perfectScrollbar();
        (<any>$(el)).perfectScrollbar('update');
    }
});

/**
 *  Background image binding, fade in element and fadeout -> fade in when image changes
 */
Vue.directive("backgroundimage", {
    bind: (el: HTMLElement, binding: any, vnode: any) => {
        //console.log("bind " + binding.oldValue + " -> " + binding.value);
        if (typeof (binding.value) !== "undefined") {
            $(el).css("visibility", "hidden");
            $('<img/>').attr('src', binding.value).on('load', function () {
                $(el).hide().css({
                    "visibility": "visible",
                    "opacity": 0
                });
                el.style.backgroundImage = "url('" + binding.value + "')";
                $(el).fadeTo(200, 1, function () {

                });
            }).on('error', function () {
                $(el).css("visibility", "visible");
                el.style.backgroundImage = '';
            });
        }
        else
            el.style.backgroundImage = null;
    },
    update: (el: HTMLElement, binding: any, vnode: any, oldVnode: any) => {
        //console.log("update " + binding.oldValue + " -> " + binding.value);

        if (binding.oldValue != binding.value) {
            $('<img/>').attr('src', binding.value).on('load', function () {
                $(this).remove(); // prevent memory leaks as @benweet suggested

                $(el).fadeOut(200, function () {
                    $(el).css("background-image", "url('" + binding.value + "')");
                    $(el).fadeIn(200);
                });
            }).on('error', function () {
                $(el).css("visibility", "visible");
                el.style.backgroundImage = '';
            });

        }
    }
});

/**
 *  Text binding, fade in element and fadeout -> fade in when text changes
 */
Vue.directive("fadetext", {
    bind: (el: HTMLElement, binding: any, vnode: any) => {
         $(el).text(binding.value);
    },
    update: (el: HTMLElement, binding: any, vnode: any, oldVnode: any) => {
        //console.log("update " + binding.oldValue + " -> " + binding.value);

        if (binding.oldValue != binding.value) {

            //console.log("Text changed: " + binding.oldValue + " -> " + binding.value);

            $(el).fadeOut(200, function () {
                $(el).text(binding.value);
                $(el).fadeIn(200);
            });
        }
    }
});

class API {

    static target: MainPage;
    static playPause() {
        API.target.togglePlayback();
    }

    static stop() {
        API.target.stopPlayback();
    }

    static forward() {
        API.target.playNext(false);
    }

    static rewind() {
        API.target.playPrevious();
    }

    static volumeUp() {
        API.target.volumeUp();
    }

    static volumeDown() {
        API.target.volumeDown();
    }

    static getInfo() {
        let currentTrack = API.target.currentTrack;
        if (currentTrack == null)
            return "";
        else
            return currentTrack.artists.join(",") + " - " + currentTrack.title;
    }
    
    static register() {
        (<any>window).API = this;
    }
}



async function initialize() {
    var trackManager = new DomainManager();
    var pageManager = new PageManager();

    var mainPage = new MainPage(pageManager, trackManager);

    API.target = mainPage;

    try {
        await pageManager.show(mainPage);
    } catch (e) {
        NotificationManager.showNotification("Error: " + e, true);
    }
}



initialize();
API.register();