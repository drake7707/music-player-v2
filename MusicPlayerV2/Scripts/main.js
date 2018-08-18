"use strict";
// only necessary for typescript to recognize Vue
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("vue");
var mainpage_1 = require("./gui/pages/mainpage");
var pagemanager_1 = require("./gui/pagemanager");
var manager_1 = require("./domain/manager");
var notificationmanager_1 = require("./gui/notificationmanager");
var TEST = false;
console.clear();
vue_1.default.config.errorHandler = function (err) {
    console.error("Vue compilation error: " + err.name + ": " + err.message);
};
vue_1.default.component("loading", {
    template: $(".templates .loader").html()
});
vue_1.default.directive("perfectscrollbar", {
    bind: function (el, binding, vnode) {
        $(el).perfectScrollbar();
        $(el).perfectScrollbar('update');
    }
});
/**
 *  Background image binding, fade in element and fadeout -> fade in when image changes
 */
vue_1.default.directive("backgroundimage", {
    bind: function (el, binding, vnode) {
        //console.log("bind " + binding.oldValue + " -> " + binding.value);
        if (typeof (binding.value) !== "undefined") {
            $(el).css("visibility", "hidden");
            $('<img/>').attr('src', binding.value).on('load', function () {
                $(el).hide().css("visibility", "visible");
                el.style.backgroundImage = "url('" + binding.value + "')";
                $(el).fadeIn(200, function () {
                });
            }).on('error', function () {
                $(el).css("visibility", "visible");
                el.style.backgroundImage = '';
            });
        }
        else
            el.style.backgroundImage = null;
    },
    update: function (el, binding, vnode, oldVnode) {
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
var API = /** @class */ (function () {
    function API() {
    }
    API.playPause = function () {
        API.target.togglePlayback();
    };
    API.stop = function () {
        API.target.stopPlayback();
    };
    API.forward = function () {
        API.target.playNext(false);
    };
    API.rewind = function () {
        API.target.playPrevious();
    };
    API.volumeUp = function () {
        API.target.volumeUp();
    };
    API.volumeDown = function () {
        API.target.volumeDown();
    };
    API.getInfo = function () {
        var currentTrack = API.target.currentTrack;
        if (currentTrack == null)
            return "";
        else
            return currentTrack.artists.join(",") + " - " + currentTrack.title;
    };
    return API;
}());
function initialize() {
    return __awaiter(this, void 0, void 0, function () {
        var trackManager, pageManager, mainPage, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    trackManager = new manager_1.DomainManager();
                    pageManager = new pagemanager_1.PageManager();
                    mainPage = new mainpage_1.MainPage(pageManager, trackManager);
                    API.target = mainPage;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, pageManager.show(mainPage)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    notificationmanager_1.NotificationManager.showNotification("Error: " + e_1, true);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
initialize();
