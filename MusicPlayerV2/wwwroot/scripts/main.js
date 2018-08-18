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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define("gui/pagemanager", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var PageManager = /** @class */ (function () {
        function PageManager() {
            this.pages = [];
            this.ignoreHashChange = false;
            var self = this;
            if (PageManager.isMobile()) // handle back button by hash changes
                window.onhashchange = function (ev) { return self.page_hashChange(ev); };
        }
        PageManager.isMobile = function () {
            return /WPDesktop|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent);
        };
        PageManager.prototype.page_hashChange = function (ev) {
            var _this = this;
            if (this.ignoreHashChange)
                return;
            // make sure the location.hash is the new one already
            window.setTimeout(function () {
                var hash = window.location.hash.replace("#", "");
                if (_this.pages.length > 1 && _this.pages[_this.pages.length - 1].id != hash) {
                    _this.close();
                }
            }, 1);
        };
        PageManager.prototype.setHash = function (hash) {
            var _this = this;
            if (!PageManager.isMobile()) // handle back button by hash changes, but not on desktop browsers
                return;
            this.ignoreHashChange = true;
            window.location.hash = hash;
            window.setTimeout(function () {
                _this.ignoreHashChange = false;
            }, 1);
        };
        PageManager.prototype.show = function (page) {
            return __awaiter(this, void 0, void 0, function () {
                var template, id, _i, _a, page_1, e_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            template = page.getTemplate();
                            id = 'page-' + this.pages.length;
                            $(".pages").append("<div id=\"" + id + "\">" + template + "</div>");
                            page.id = id;
                            this.setHash(id);
                            for (_i = 0, _a = this.pages; _i < _a.length; _i++) {
                                page_1 = _a[_i];
                                page_1.active = false;
                            }
                            page.active = true;
                            this.pages.push(page);
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, page.bind(id)];
                        case 2:
                            _b.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            e_1 = _b.sent();
                            // close the new page, it can't be shown because bind failed
                            this.close();
                            throw e_1;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        PageManager.prototype.close = function () {
            if (this.pages.length <= 1)
                return;
            var lastPage = this.pages[this.pages.length - 1];
            lastPage.active = false;
            lastPage.close();
            var id = 'page-' + (this.pages.length - 1);
            $("#" + id).empty().detach();
            this.pages.pop();
            lastPage = this.pages[this.pages.length - 1];
            lastPage.active = true;
            this.setHash(lastPage.id);
        };
        PageManager.prototype.emit = function (source, eventName, data) {
            for (var _i = 0, _a = this.pages; _i < _a.length; _i++) {
                var p = _a[_i];
                if (p !== source)
                    p.onevent(source, eventName, data);
            }
        };
        return PageManager;
    }());
    exports.PageManager = PageManager;
});
define("gui/page", ["require", "exports", "vue/types/vue"], function (require, exports, vue_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Page = /** @class */ (function () {
        function Page(pageManager) {
            this.gui = null;
            this.active = false;
            this.pageManager = pageManager;
        }
        Page.prototype.getMethods = function () {
            var _this = this;
            return {
                back_click: function () {
                    _this.pageManager.close();
                }
            };
        };
        Page.prototype.getComputed = function () {
            return {};
        };
        Page.prototype.close = function () {
            if (this.gui != null)
                this.gui.$destroy();
            this.gui = null;
        };
        Page.prototype.onevent = function (source, eventName, data) {
        };
        Page.prototype.bindModel = function (elementId, model) {
            this.gui = new vue_1.Vue({
                data: {
                    model: model,
                    page: this
                },
                el: "#" + elementId,
                methods: this.getMethods(),
                computed: this.getComputed()
            });
        };
        Page.prototype.rebindModel = function (model) {
            this.gui.$data.model = model;
        };
        return Page;
    }());
    exports.Page = Page;
});
define("domain/objects", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var LikeStatus;
    (function (LikeStatus) {
        LikeStatus[LikeStatus["None"] = 0] = "None";
        LikeStatus[LikeStatus["Liked"] = 1] = "Liked";
        LikeStatus[LikeStatus["Disliked"] = 2] = "Disliked";
    })(LikeStatus = exports.LikeStatus || (exports.LikeStatus = {}));
});
define("domain/apimessages", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("domain/dummybackend", ["require", "exports", "domain/objects"], function (require, exports, objects_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DummyBackend = /** @class */ (function () {
        function DummyBackend() {
        }
        DummyBackend.get = function (then, reject, path, data) {
            window.setTimeout(function () {
                if (path == "/api/player/GetCurrentPlayerState") {
                    then({
                        player: {
                            shuffle: false,
                            currentTrack: DummyBackend.tracks[DummyBackend.currentTrack]
                        }
                    });
                }
                else if (path == "/api/player/NextTrack") {
                    DummyBackend.currentTrack = (DummyBackend.currentTrack + 1) % DummyBackend.tracks.length;
                    then({
                        player: {
                            shuffle: false,
                            currentTrack: DummyBackend.tracks[DummyBackend.currentTrack]
                        }
                    });
                }
                else if (path == "/api/playlist/GetPlaylists") {
                    then({
                        playlists: [
                            { id: 0, name: "[All]", isCurrent: true, nrOfTracks: 5 },
                            { id: 1, name: "Chill", isCurrent: false, nrOfTracks: 123 },
                            { id: 2, name: "Energetic", isCurrent: false, nrOfTracks: 0 },
                        ]
                    });
                }
                else if (path == "/api/playlist/GetAlbumsOrTracks") {
                    var items = [];
                    for (var i = data.offset; i < data.offset + data.size; i++) {
                        if (typeof (data) === "undefined" || data.filter === "" || ("Final Fantasy " + i).indexOf(data.filter) >= 0) {
                            items.push({
                                id: i + "",
                                name: "Final Fantasy " + i,
                                artists: "Nobuo Uematsu",
                                isTrack: false,
                                artImage: "https://i.imgur.com/13MdjPD.png"
                            });
                        }
                    }
                    then({
                        items: items,
                        totalCount: 2000
                    });
                }
                else if (path == "/api/playlist/GetTracks") {
                    var items = [];
                    for (var i = 0; i < 10; i++) {
                        if (typeof (data) === "undefined" || data.filter === "" || ("Track " + i).indexOf(data.filter) >= 0) {
                            items.push({
                                id: i + "",
                                name: "Track " + i,
                                artists: "Nobuo Uematsu",
                                isTrack: true,
                                artImage: "https://i.imgur.com/13MdjPD.png"
                            });
                        }
                    }
                    then({
                        items: items
                    });
                }
                else if (path == "/api/player/GetDetails") {
                    then({
                        details: {
                            id: "1234",
                            title: "Track name",
                            artists: ["Artist 1", "Artist 2"],
                            album: "Awesome album",
                            track: 1,
                            genres: ["Game", "OST", "Electronic"],
                            nrPlayed: 2,
                            nrPlayedToEnd: 1,
                            lastPlayed: new Date(),
                            addedOn: new Date(),
                            liked: objects_1.LikeStatus.Liked,
                            lastScrobbles: [
                                { on: new Date(), playedToEnd: true },
                                { on: new Date(), playedToEnd: true },
                                { on: new Date(), playedToEnd: true }
                            ]
                        }
                    });
                }
                else {
                    reject("Path '" + path + "' not found");
                }
            }, 500);
        };
        DummyBackend.currentTrack = 0;
        DummyBackend.tracks = [
            {
                title: 'This is a test title for testing',
                artists: [''],
                album: "Dragonball Z3",
                trackNr: 1,
                artImage: "llhttps://i.imgur.com/13MdjPD.png",
                liked: objects_1.LikeStatus.None,
                url: "http://dwight.skyon.be/arrange.mp3"
            },
            {
                title: 'Another track',
                artists: ['I have no idea'],
                album: "Journey",
                trackNr: 1,
                artImage: "https://i.imgur.com/eSS7WVW.png",
                liked: objects_1.LikeStatus.None,
                url: "http://dwight.skyon.be/arrange.mp3"
            }
        ];
        return DummyBackend;
    }());
    exports.DummyBackend = DummyBackend;
});
define("domain/manager", ["require", "exports", "domain/dummybackend"], function (require, exports, dummybackend_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TEST = false;
    var DomainManager = /** @class */ (function () {
        function DomainManager() {
        }
        DomainManager.prototype.getCurrentPlayerState = function () {
            return __awaiter(this, void 0, void 0, function () {
                var playerResult;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.get("/api/player/GetCurrentPlayerState")];
                        case 1:
                            playerResult = _a.sent();
                            return [2 /*return*/, playerResult.player];
                    }
                });
            });
        };
        DomainManager.prototype.getCurrentTrackId = function () {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.get("/api/player/GetCurrentTrackId")];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/, result.trackId];
                    }
                });
            });
        };
        DomainManager.prototype.previousTrack = function (currentTrackId) {
            return __awaiter(this, void 0, void 0, function () {
                var playerResult;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.post("/api/player/PreviousTrack", {
                                currentTrackId: currentTrackId,
                            })];
                        case 1:
                            playerResult = _a.sent();
                            return [2 /*return*/, playerResult.player];
                    }
                });
            });
        };
        DomainManager.prototype.nextTrack = function (currentTrackId, playedToEnd) {
            return __awaiter(this, void 0, void 0, function () {
                var playerResult;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.post("/api/player/NextTrack", {
                                currentTrackId: currentTrackId,
                                playedToEnd: playedToEnd
                            })];
                        case 1:
                            playerResult = _a.sent();
                            return [2 /*return*/, playerResult.player];
                    }
                });
            });
        };
        DomainManager.prototype.toggleShuffle = function (shuffle) {
            return __awaiter(this, void 0, void 0, function () {
                var playerResult;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.post("/api/player/ToggleShuffle", {
                                shuffle: shuffle
                            })];
                        case 1:
                            playerResult = _a.sent();
                            return [2 /*return*/, playerResult.player];
                    }
                });
            });
        };
        DomainManager.prototype.setLikeStatus = function (trackId, status) {
            return __awaiter(this, void 0, void 0, function () {
                var playerResult;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.post("/api/player/SetLikeStatus", {
                                trackId: trackId,
                                likeStatus: status
                            })];
                        case 1:
                            playerResult = _a.sent();
                            return [2 /*return*/, playerResult.player];
                    }
                });
            });
        };
        DomainManager.prototype.updatePlayerPlayingStatus = function (trackId, isPlaying) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.post("/api/player/UpdatePlayerPlayingStatus", {
                                trackId: trackId,
                                isPlaying: isPlaying
                            })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        DomainManager.prototype.getPlaylists = function (asSelector, forItem) {
            if (asSelector === void 0) { asSelector = false; }
            if (forItem === void 0) { forItem = null; }
            return __awaiter(this, void 0, void 0, function () {
                var playlistsResult;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.get("/api/playlist/GetPlaylists", {
                                asSelector: asSelector,
                                forItemId: forItem == null ? undefined : forItem.id,
                                forItemIsTrack: forItem == null ? undefined : forItem.isTrack
                            })];
                        case 1:
                            playlistsResult = _a.sent();
                            return [2 /*return*/, playlistsResult.playlists];
                    }
                });
            });
        };
        DomainManager.prototype.getAlbumsOrTracks = function (filter, sortBy, forPlaylistId, offset, size) {
            if (offset === void 0) { offset = 0; }
            if (size === void 0) { size = Number.MAX_VALUE; }
            return __awaiter(this, void 0, void 0, function () {
                var albumsOrTrackResult;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.get("/api/playlist/GetAlbumsOrTracks", {
                                filter: filter,
                                sortBy: sortBy,
                                forPlaylistId: forPlaylistId,
                                offset: offset,
                                size: size
                            })];
                        case 1:
                            albumsOrTrackResult = _a.sent();
                            return [2 /*return*/, albumsOrTrackResult];
                    }
                });
            });
        };
        DomainManager.prototype.getTracks = function (filter, albumId, forPlaylistId, offset, size) {
            if (offset === void 0) { offset = 0; }
            if (size === void 0) { size = Number.MAX_VALUE; }
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.get("/api/playlist/GetTracks", {
                                filter: filter,
                                albumId: albumId,
                                forPlaylistId: forPlaylistId,
                                offset: offset,
                                size: size
                            })];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/, result];
                    }
                });
            });
        };
        DomainManager.prototype.addPlaylist = function (playlist) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.post("/api/playlist/AddPlaylist", {
                                playlist: playlist
                            })];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        DomainManager.prototype.removePlaylist = function (playlist) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.post("/api/playlist/RemovePlaylist", {
                                playlist: playlist
                            })];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        DomainManager.prototype.addToPlaylist = function (item, playlistId) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.post("/api/playlist/AddToPlaylist", {
                                item: item,
                                playlistId: playlistId
                            })];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        DomainManager.prototype.removeFromPlaylist = function (item, playlistId) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.post("/api/playlist/RemoveFromPlaylist", {
                                item: item,
                                playlistId: playlistId
                            })];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        DomainManager.prototype.playAlbumOrTrackAfterCurrentTrack = function (item, playlistId) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.post("/api/player/PlayAlbumOrTrackAfterCurrentTrack", {
                                item: item,
                                playlistId: playlistId
                            })];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        DomainManager.prototype.playAlbumOrTrackNow = function (item, playlistId) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.post("/api/player/PlayAlbumOrTrackNow", {
                                item: item,
                                playlistId: playlistId
                            })];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/, result.player];
                    }
                });
            });
        };
        DomainManager.prototype.playPlaylistAfterCurrentTrack = function (playlistId) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.post("/api/player/PlayPlaylistAfterCurrentTrack", {
                                playlistId: playlistId
                            })];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        DomainManager.prototype.playPlaylistNow = function (playlistId) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.post("/api/player/PlayPlaylistNow", {
                                playlistId: playlistId
                            })];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/, result.player];
                    }
                });
            });
        };
        DomainManager.prototype.getDetails = function (trackId) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.get("/api/player/GetDetails", {
                                trackId: trackId
                            })];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/, result.details];
                    }
                });
            });
        };
        DomainManager.prototype.get = function (path, data) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    // do ajax fetch here, dummy data is done now
                    return [2 /*return*/, new Promise(function (then, reject) {
                            if (TEST) {
                                dummybackend_1.DummyBackend.get(then, reject, path, data);
                                return;
                            }
                            $.ajax(path, {
                                cache: false,
                                method: "GET",
                                data: data,
                                success: function (data) {
                                    if (data == null || typeof (data) === "undefined")
                                        reject("No content");
                                    if (data.success)
                                        then(data);
                                    else
                                        reject(data.message);
                                },
                                error: function (e) {
                                    reject(e.statusText + " - " + e.responseText);
                                }
                            });
                        })];
                });
            });
        };
        DomainManager.prototype.post = function (path, data) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    // do ajax fetch here, dummy data is done now
                    return [2 /*return*/, new Promise(function (then, reject) {
                            if (TEST) {
                                dummybackend_1.DummyBackend.get(then, reject, path, data);
                                return;
                            }
                            $.ajax(path, {
                                cache: false,
                                method: "POST",
                                data: JSON.stringify(data),
                                contentType: "application/json; charset=utf-8",
                                success: function (data) {
                                    if (data == null || typeof (data) === "undefined")
                                        reject("No content");
                                    if (data.success)
                                        then(data);
                                    else
                                        reject(data.message);
                                },
                                error: function (e) {
                                    reject(e.statusText + " - " + e.responseText);
                                }
                            });
                        })];
                });
            });
        };
        return DomainManager;
    }());
    exports.DomainManager = DomainManager;
});
define("gui/playerviewstate", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var HowlPlayerViewState = /** @class */ (function () {
        function HowlPlayerViewState() {
            this.howl = null;
            this.isPlaying = false;
            this.progress = 0;
            this.currentTime = 0;
            this.totalTime = 0;
            this.currentVolume = 0.1;
            this.onLoadError = null;
            this.onLoad = null;
            this.onEnd = null;
        }
        HowlPlayerViewState.prototype.setHowl = function (howl) {
            var _this = this;
            if (this.howl != null) {
                // clean up
                this.howl.off("play");
                this.howl.off("pause");
                this.howl.off("stop");
                this.howl.off("volume");
                this.howl.off("seek");
                this.howl.off("loaderror");
                this.howl.off("load");
                this.howl.off("end");
                this.howl.stop();
                this.howl.unload();
            }
            this.howl = howl;
            if (this.howl != null) {
                this.howl.on("play", function () { return _this.isPlaying = true; });
                this.howl.on("pause", function () { return _this.isPlaying = false; });
                this.howl.on("stop", function () { return _this.isPlaying = false; });
                this.howl.on("volume", function () { return _this.currentVolume = _this.howl.volume(); });
                this.howl.on("seek", function () { return _this.synchronizeState(); });
                this.howl.on("loaderror", function (id, error) {
                    if (_this.onLoadError != null)
                        _this.onLoadError(error);
                });
                this.howl.on("load", function () {
                    if (_this.onLoad != null)
                        _this.onLoad();
                });
                this.howl.on("end", function () {
                    if (_this.onEnd != null)
                        _this.onEnd();
                });
            }
        };
        HowlPlayerViewState.prototype.synchronizeState = function () {
            if (this.howl != null) {
                try {
                    this.isPlaying = this.howl.playing();
                    this.currentVolume = this.howl.volume();
                    if (this.howl.playing()) {
                        this.progress = (this.howl.seek() / this.howl.duration());
                        this.currentTime = this.howl.seek();
                        this.totalTime = this.howl.duration();
                    }
                }
                catch (e) {
                    console.warn("Error updating view state: " + e);
                }
                ;
            }
        };
        HowlPlayerViewState.prototype.stop = function () {
            if (this.howl != null)
                this.howl.stop();
        };
        HowlPlayerViewState.prototype.playing = function () {
            return this.howl == null ? false : this.howl.playing();
        };
        HowlPlayerViewState.prototype.play = function () {
            if (this.howl != null)
                this.howl.play();
        };
        HowlPlayerViewState.prototype.pause = function () {
            if (this.howl != null)
                this.howl.pause();
        };
        HowlPlayerViewState.prototype.setVolume = function (percentage) {
            if (this.howl != null)
                this.howl.volume(percentage);
        };
        HowlPlayerViewState.prototype.getDuration = function () {
            return this.howl == null ? 0 : this.howl.duration();
        };
        HowlPlayerViewState.prototype.getVolume = function () {
            return this.howl == null ? 0 : this.howl.volume();
        };
        HowlPlayerViewState.prototype.seek = function (percentage) {
            if (this.howl != null)
                this.howl.seek(percentage * this.howl.duration());
        };
        HowlPlayerViewState.prototype.changeTrack = function (playerState) {
            if (playerState.currentTrack == null)
                this.setHowl(null);
            else
                this.setHowl(new Howl({
                    src: [playerState.currentTrack.url],
                    html5: true,
                    volume: this.currentVolume,
                    preload: true
                }));
            // force track to be loaded so duration is updated
            //this.viewState.howl!.play();
            //this.viewState.howl!.stop();
        };
        return HowlPlayerViewState;
    }());
    exports.HowlPlayerViewState = HowlPlayerViewState;
    var JPlayerPlayerViewState = /** @class */ (function () {
        function JPlayerPlayerViewState() {
            this.jplayer = null;
            this.isPlaying = false;
            this.progress = 0;
            this.currentTime = 0;
            this.totalTime = 0;
            this.currentVolume = 0.1;
            this.onLoadError = null;
            this.onLoad = null;
            this.onEnd = null;
            this.initialize();
        }
        JPlayerPlayerViewState.prototype.initialize = function () {
            var self = this;
            var container = $("<div id='jplayer' style='display:block'></div>");
            $(document.body).append(container);
            this.jplayer = $("#jplayer");
            this.jplayer.jPlayer({
                ready: function (event) {
                },
                supplied: "mp3",
                wmode: "window",
                useStateClassSkin: true,
                autoBlur: false,
                smoothPlayBar: true,
                keyEnabled: true,
                remainingDuration: false,
                toggleDuration: true,
                errorAlerts: false,
                warningAlerts: false,
                consoleAlerts: false,
                volume: this.currentVolume,
                error: function (event) {
                    if (self.onLoadError != null)
                        self.onLoadError(event.jPlayer.error);
                },
                ended: function () {
                    self.isPlaying = false;
                    if (self.onEnd != null)
                        self.onEnd();
                },
                playing: function (ev) {
                    self.isPlaying = true;
                },
                pause: function (ev) {
                    self.isPlaying = false;
                }
            });
            this.jplayer.bind($.jPlayer.event.volumechange, function (event) {
                self.currentVolume = event.jPlayer.options.volume;
            });
            this.jplayer.bind($.jPlayer.event.loadeddata, function (event) {
                if (self.onLoad != null)
                    self.onLoad();
            });
        };
        JPlayerPlayerViewState.prototype.synchronizeState = function () {
            try {
                this.totalTime = this.getDuration();
                this.currentTime = this.jplayer.data("jPlayer").status.currentTime;
                this.progress = this.currentTime / this.totalTime;
            }
            catch (e) {
            }
            // if (this.howl != null) {
            //     try {
            //         this.isPlaying = this.howl.playing();
            //         this.currentVolume = this.howl.volume();
            //         if (this.howl.playing()) {
            //             this.progress = (<number>this.howl.seek() / this.howl.duration());
            //             this.currentTime = <number>this.howl.seek();
            //             this.totalTime = this.howl.duration();
            //         }
            //     } catch (e) {
            //         console.warn("Error updating view state: " + e)
            //     };
            // }
        };
        JPlayerPlayerViewState.prototype.stop = function () {
            this.jplayer.jPlayer("stop");
            this.isPlaying = false; // immediately change it to false
        };
        JPlayerPlayerViewState.prototype.playing = function () {
            return !this.jplayer.data("jPlayer").status.paused;
        };
        JPlayerPlayerViewState.prototype.play = function () {
            this.jplayer.jPlayer("play");
        };
        JPlayerPlayerViewState.prototype.pause = function () {
            this.jplayer.jPlayer("pause");
        };
        JPlayerPlayerViewState.prototype.setVolume = function (percentage) {
            this.jplayer.jPlayer("volume", percentage);
        };
        JPlayerPlayerViewState.prototype.getDuration = function () {
            return this.jplayer.data("jPlayer").status.duration;
        };
        JPlayerPlayerViewState.prototype.getVolume = function () {
            return this.currentVolume;
        };
        JPlayerPlayerViewState.prototype.seek = function (percentage) {
            if (this.isPlaying) {
                this.jplayer.jPlayer("play", percentage * this.getDuration());
                this.currentTime = percentage * this.getDuration(); // force immediate update
            }
        };
        JPlayerPlayerViewState.prototype.changeTrack = function (playerState) {
            if (playerState.currentTrack == null) {
                this.jplayer.jPlayer("setMedia", {
                    title: "",
                    mp3: ""
                });
            }
            else {
                this.jplayer.jPlayer("setMedia", {
                    title: playerState.currentTrack.title,
                    mp3: playerState.currentTrack.url
                });
            }
            // force track to be loaded so duration is updated
            //this.viewState.howl!.play();
            //this.viewState.howl!.stop();
        };
        return JPlayerPlayerViewState;
    }());
    exports.JPlayerPlayerViewState = JPlayerPlayerViewState;
});
define("gui/notificationmanager", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var NotificationManager = /** @class */ (function () {
        function NotificationManager() {
        }
        NotificationManager.showNotification = function (msg, isError, timeout) {
            if (isError === void 0) { isError = false; }
            if (timeout === void 0) { timeout = 3000; }
            var notification = $("<div class='notification " + (isError ? "error" : "info") + "'>" + msg + "</div>");
            $(".notifications").append(notification);
            var hideFunc = function () {
                notification.detach();
                /*notification.fadeTo(500, 0, () => {
                    
                });*/
            };
            $(notification).click(function () {
                hideFunc();
            });
            window.setTimeout(function () {
                hideFunc();
            }, timeout);
        };
        return NotificationManager;
    }());
    exports.NotificationManager = NotificationManager;
});
define("gui/pages/editplaylistpage", ["require", "exports", "gui/page", "gui/notificationmanager"], function (require, exports, page_2, notificationmanager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var EditPlaylistPage = /** @class */ (function (_super) {
        __extends(EditPlaylistPage, _super);
        function EditPlaylistPage(pageManager, manager, playlist, onclose) {
            if (playlist === void 0) { playlist = null; }
            if (onclose === void 0) { onclose = null; }
            var _this = _super.call(this, pageManager) || this;
            _this.isNew = false;
            _this.manager = manager;
            _this.onclose = onclose;
            if (playlist == null) {
                _this.playlist = {
                    id: "",
                    name: "",
                    isCurrent: false,
                    nrOfTracks: 0
                };
                _this.isNew = true;
            }
            else {
                _this.playlist = playlist;
                _this.isNew = false;
            }
            return _this;
        }
        EditPlaylistPage.prototype.getTemplate = function () {
            var template = $(".templates .page.edit-playlist").get(0).outerHTML;
            return template;
        };
        EditPlaylistPage.prototype.validate = function () {
            if (this.playlist.name == "")
                return ["Name is required"];
            return [];
        };
        EditPlaylistPage.prototype.getMethods = function () {
            var _this = this;
            return jQuery.extend(_super.prototype.getMethods.call(this), {
                save_click: function () { return __awaiter(_this, void 0, void 0, function () {
                    var validation, e_2;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 4, , 5]);
                                validation = this.validate();
                                if (!(validation.length > 0)) return [3 /*break*/, 1];
                                notificationmanager_1.NotificationManager.showNotification("Not all fields are valid: <br:>" + validation.join("<br/>"), false);
                                return [3 /*break*/, 3];
                            case 1: return [4 /*yield*/, this.manager.addPlaylist(this.playlist)];
                            case 2:
                                _a.sent();
                                this.pageManager.close();
                                _a.label = 3;
                            case 3: return [3 /*break*/, 5];
                            case 4:
                                e_2 = _a.sent();
                                notificationmanager_1.NotificationManager.showNotification("Unable to save: " + e_2, true);
                                return [3 /*break*/, 5];
                            case 5: return [2 /*return*/];
                        }
                    });
                }); }
            });
        };
        EditPlaylistPage.prototype.bind = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    this.bindModel(id, this.playlist);
                    return [2 /*return*/];
                });
            });
        };
        EditPlaylistPage.prototype.close = function () {
            if (this.onclose != null)
                this.onclose();
            _super.prototype.close.call(this);
        };
        return EditPlaylistPage;
    }(page_2.Page));
    exports.EditPlaylistPage = EditPlaylistPage;
});
define("gui/pages/playlistspage", ["require", "exports", "gui/page", "gui/notificationmanager", "gui/pages/editplaylistpage", "gui/pages/browsepage"], function (require, exports, page_3, notificationmanager_2, editplaylistpage_1, browsepage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var PlaylistsPage = /** @class */ (function (_super) {
        __extends(PlaylistsPage, _super);
        function PlaylistsPage(pageManager, manager) {
            var _this = _super.call(this, pageManager) || this;
            _this.loading = false;
            _this.playlists = [];
            _this.selectedId = "";
            _this.title = "Playlists";
            _this.canShowActions = true;
            _this.manager = manager;
            return _this;
        }
        Object.defineProperty(PlaylistsPage.prototype, "selectedPlaylist", {
            get: function () {
                var _this = this;
                var playlists = this.playlists.filter(function (p) { return p.id == _this.selectedId; });
                if (playlists.length == 0)
                    return null;
                else
                    return playlists[0];
            },
            enumerable: true,
            configurable: true
        });
        PlaylistsPage.prototype.getTemplate = function () {
            var template = $(".templates .page.playlists").get(0).outerHTML;
            return template;
        };
        PlaylistsPage.prototype.getMethods = function () {
            var _this = this;
            return jQuery.extend(_super.prototype.getMethods.call(this), {
                item_click: function (id) {
                    _this.selectedId = (id === _this.selectedId) ? "" : id;
                },
                newPlaylist_click: function () { return __awaiter(_this, void 0, void 0, function () {
                    var _this = this;
                    var editPage, e_3;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                editPage = new editplaylistpage_1.EditPlaylistPage(this.pageManager, this.manager, null, function () {
                                    _this.fill();
                                });
                                return [4 /*yield*/, this.pageManager.show(editPage)];
                            case 1:
                                _a.sent();
                                return [3 /*break*/, 3];
                            case 2:
                                e_3 = _a.sent();
                                notificationmanager_2.NotificationManager.showNotification("Unable to create new playlist, error: " + e_3, true);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); },
                showDetails_click: function () { return __awaiter(_this, void 0, void 0, function () {
                    var _this = this;
                    var playlist, browsePage, e_4;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                playlist = this.playlists.filter(function (p) { return p.id == _this.selectedId; })[0];
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                browsePage = new browsepage_1.BrowsePage(this.pageManager, this.manager, undefined, playlist);
                                browsePage.title = playlist.name;
                                return [4 /*yield*/, this.pageManager.show(browsePage)];
                            case 2:
                                _a.sent();
                                this.selectedId = "";
                                return [3 /*break*/, 4];
                            case 3:
                                e_4 = _a.sent();
                                notificationmanager_2.NotificationManager.showNotification("Unable to show details, error: " + e_4, true);
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); },
                playNow_click: function () { return __awaiter(_this, void 0, void 0, function () {
                    var player, e_5;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 3, , 4]);
                                return [4 /*yield*/, this.manager.playPlaylistNow(this.selectedId)];
                            case 1:
                                player = _a.sent();
                                this.pageManager.emit(this, "PlayerStateChanged", player);
                                this.selectedId = "";
                                return [4 /*yield*/, this.fill()];
                            case 2:
                                _a.sent();
                                return [3 /*break*/, 4];
                            case 3:
                                e_5 = _a.sent();
                                notificationmanager_2.NotificationManager.showNotification("Unable to play the playlist now: " + e_5, true);
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); },
                playAfterCurrentTrack_click: function () { return __awaiter(_this, void 0, void 0, function () {
                    var e_6;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, this.manager.playPlaylistAfterCurrentTrack(this.selectedId)];
                            case 1:
                                _a.sent();
                                notificationmanager_2.NotificationManager.showNotification("Playlist successfully queued");
                                this.selectedId = "";
                                return [3 /*break*/, 3];
                            case 2:
                                e_6 = _a.sent();
                                notificationmanager_2.NotificationManager.showNotification("Unable to play the playlist after current track: " + e_6, true);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); },
                delete_click: function () { return __awaiter(_this, void 0, void 0, function () {
                    var _this = this;
                    var e_7;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (this.selectedId == "")
                                    return [2 /*return*/];
                                if (!confirm("Are you sure?")) return [3 /*break*/, 5];
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 4, , 5]);
                                return [4 /*yield*/, this.manager.removePlaylist(this.playlists.filter(function (p) { return p.id == _this.selectedId; })[0])];
                            case 2:
                                _a.sent();
                                this.selectedId = "";
                                return [4 /*yield*/, this.fill()];
                            case 3:
                                _a.sent();
                                return [3 /*break*/, 5];
                            case 4:
                                e_7 = _a.sent();
                                notificationmanager_2.NotificationManager.showNotification("Unable to delete playlist, error: " + e_7, true);
                                return [3 /*break*/, 5];
                            case 5: return [2 /*return*/];
                        }
                    });
                }); }
            });
        };
        PlaylistsPage.prototype.bind = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.bindModel(id, this.playlists);
                            return [4 /*yield*/, this.fill()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        PlaylistsPage.prototype.fill = function () {
            return __awaiter(this, void 0, void 0, function () {
                var playlists, i;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.loading = true;
                            this.playlists.splice(0, this.playlists.length);
                            return [4 /*yield*/, this.fetchPlaylists()];
                        case 1:
                            playlists = _a.sent();
                            for (i = 0; i < playlists.length; i++)
                                this.playlists.push(playlists[i]);
                            this.loading = false;
                            return [2 /*return*/];
                    }
                });
            });
        };
        PlaylistsPage.prototype.fetchPlaylists = function () {
            return __awaiter(this, void 0, void 0, function () {
                var playlists;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.manager.getPlaylists()];
                        case 1:
                            playlists = _a.sent();
                            return [2 /*return*/, playlists];
                    }
                });
            });
        };
        return PlaylistsPage;
    }(page_3.Page));
    exports.PlaylistsPage = PlaylistsPage;
});
define("gui/pages/addplaylistsselectorpage", ["require", "exports", "gui/pages/playlistspage"], function (require, exports, playlistspage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var AddToPlaylistsSelectorPage = /** @class */ (function (_super) {
        __extends(AddToPlaylistsSelectorPage, _super);
        function AddToPlaylistsSelectorPage(pageManager, manager, forItem, onselected) {
            var _this = _super.call(this, pageManager, manager) || this;
            _this.title = "Add to playlist";
            _this.canShowActions = false;
            _this.onselected = onselected;
            _this.forItem = forItem;
            return _this;
        }
        AddToPlaylistsSelectorPage.prototype.getMethods = function () {
            var _this = this;
            return jQuery.extend(_super.prototype.getMethods.call(this), {
                item_click: function (id) {
                    _this.selectedId = (id === _this.selectedId) ? "" : id;
                    if (_this.selectedId !== "") { // selection is made
                        if (_this.onselected != null)
                            _this.onselected();
                        _this.pageManager.close();
                    }
                }
            });
        };
        AddToPlaylistsSelectorPage.prototype.fetchPlaylists = function () {
            return __awaiter(this, void 0, void 0, function () {
                var playlists;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.manager.getPlaylists(true, this.forItem)];
                        case 1:
                            playlists = _a.sent();
                            return [2 /*return*/, playlists];
                    }
                });
            });
        };
        return AddToPlaylistsSelectorPage;
    }(playlistspage_1.PlaylistsPage));
    exports.AddToPlaylistsSelectorPage = AddToPlaylistsSelectorPage;
});
define("gui/pages/browsepage", ["require", "exports", "gui/page", "gui/notificationmanager", "gui/pages/addplaylistsselectorpage"], function (require, exports, page_4, notificationmanager_3, addplaylistsselectorpage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BrowsePage = /** @class */ (function (_super) {
        __extends(BrowsePage, _super);
        function BrowsePage(pageManager, manager, parentAlbumId, forPlaylist) {
            var _this = _super.call(this, pageManager) || this;
            _this.loading = false;
            _this.PAGE_SIZE = 100;
            _this.viewState = {
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
            _this.items = [];
            _this.manager = manager;
            _this.forPlaylist = forPlaylist;
            _this.parentAlbumId = parentAlbumId;
            if (typeof (_this.parentAlbumId) !== "undefined")
                _this.viewState.showSorting = false;
            return _this;
        }
        Object.defineProperty(BrowsePage.prototype, "title", {
            get: function () { return this.viewState.title; },
            set: function (value) { this.viewState.title = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BrowsePage.prototype, "filter", {
            get: function () { return this.viewState.filter; },
            set: function (value) { this.viewState.filter = value; },
            enumerable: true,
            configurable: true
        });
        BrowsePage.prototype.getTemplate = function () {
            var template = $(".templates .page.browse").get(0).outerHTML;
            return template;
        };
        BrowsePage.prototype.getMethods = function () {
            var _this = this;
            return jQuery.extend(_super.prototype.getMethods.call(this), {
                item_click: function (id, index, event) {
                    _this.viewState.selectedId = (id === _this.viewState.selectedId) ? "" : id;
                    _this.viewState.selectedIndex = (index === _this.viewState.selectedIndex ? -1 : index);
                    _this.viewState.hasDetails = _this.viewState.selectedIndex >= 0 && !_this.items[_this.viewState.selectedIndex].isTrack;
                    // this.viewState.contextMenuTop = (<HTMLElement>event.target).getBoundingClientRect().top +  (<HTMLElement>event.target).getBoundingClientRect().height; 
                },
                tileview_click: function () {
                    _this.viewState.tileView = !_this.viewState.tileView;
                },
                filter_keyup: function (ev) { return __awaiter(_this, void 0, void 0, function () {
                    var e_8;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 3, , 4]);
                                if (!(ev.which == 13)) return [3 /*break*/, 2];
                                this.scrollToTop();
                                return [4 /*yield*/, this.fill(0)];
                            case 1:
                                _a.sent();
                                _a.label = 2;
                            case 2: return [3 /*break*/, 4];
                            case 3:
                                e_8 = _a.sent();
                                notificationmanager_3.NotificationManager.showNotification("Unable to load results: " + e_8, true);
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); },
                /*   filter_change: async () => {
                       try {
                           await this.fill(0);
                       } catch (e) {
                           NotificationManager.showNotification("Unable to load results: " + e, true);
                       }
                   },*/
                showDetails_click: function () { return __awaiter(_this, void 0, void 0, function () {
                    var item, browsePage, e_9;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                item = this.items[this.viewState.selectedIndex];
                                browsePage = new BrowsePage(this.pageManager, this.manager, this.viewState.selectedId, this.forPlaylist);
                                browsePage.viewState.filter = this.viewState.filter;
                                browsePage.title = item.name;
                                return [4 /*yield*/, this.pageManager.show(browsePage)];
                            case 1:
                                _a.sent();
                                return [3 /*break*/, 3];
                            case 2:
                                e_9 = _a.sent();
                                notificationmanager_3.NotificationManager.showNotification("Unable to load details: " + e_9, true);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); },
                addToPlaylist_click: function () { return __awaiter(_this, void 0, void 0, function () {
                    var _this = this;
                    var item, playlistSelector_1, e_10;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                item = this.items[this.viewState.selectedIndex];
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                playlistSelector_1 = new addplaylistsselectorpage_1.AddToPlaylistsSelectorPage(this.pageManager, this.manager, item, function () { return __awaiter(_this, void 0, void 0, function () {
                                    var e_11;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                _a.trys.push([0, 2, , 3]);
                                                return [4 /*yield*/, this.manager.addToPlaylist(item, playlistSelector_1.selectedId)];
                                            case 1:
                                                _a.sent();
                                                notificationmanager_3.NotificationManager.showNotification(item.name + " added to playlist " + playlistSelector_1.selectedPlaylist.name);
                                                return [3 /*break*/, 3];
                                            case 2:
                                                e_11 = _a.sent();
                                                notificationmanager_3.NotificationManager.showNotification("Unable to add " + item.name + " to playlist " + playlistSelector_1.selectedPlaylist.name + ": " + e_11, true);
                                                return [3 /*break*/, 3];
                                            case 3: return [2 /*return*/];
                                        }
                                    });
                                }); });
                                return [4 /*yield*/, this.pageManager.show(playlistSelector_1)];
                            case 2:
                                _a.sent();
                                return [3 /*break*/, 4];
                            case 3:
                                e_10 = _a.sent();
                                notificationmanager_3.NotificationManager.showNotification("Unable to fetch playlists: " + e_10, true);
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); },
                removeFromPlaylist_click: function () { return __awaiter(_this, void 0, void 0, function () {
                    var item, e_12;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (typeof this.forPlaylist === "undefined")
                                    return [2 /*return*/];
                                item = this.items[this.viewState.selectedIndex];
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, this.manager.removeFromPlaylist(item, this.forPlaylist.id)];
                            case 2:
                                _a.sent();
                                notificationmanager_3.NotificationManager.showNotification(item.name + " removed from playlist " + this.forPlaylist.name);
                                this.items.splice(this.viewState.selectedIndex, 1);
                                this.deselect();
                                return [3 /*break*/, 4];
                            case 3:
                                e_12 = _a.sent();
                                notificationmanager_3.NotificationManager.showNotification("Unable to remove " + item.name + " from playlist " + this.forPlaylist.name + ": " + e_12, true);
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); },
                playNow_click: function () { return __awaiter(_this, void 0, void 0, function () {
                    var item, playlistId, player, e_13;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                item = this.items[this.viewState.selectedIndex];
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                playlistId = (typeof this.forPlaylist === "undefined") ? undefined : this.forPlaylist.id;
                                return [4 /*yield*/, this.manager.playAlbumOrTrackNow(item, playlistId)];
                            case 2:
                                player = _a.sent();
                                this.pageManager.emit(this, "PlayerStateChanged", player);
                                this.deselect();
                                return [3 /*break*/, 4];
                            case 3:
                                e_13 = _a.sent();
                                notificationmanager_3.NotificationManager.showNotification("Unable to play the track now: " + e_13, true);
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); },
                playAfterCurrentTrack_click: function () { return __awaiter(_this, void 0, void 0, function () {
                    var item, playlistId, e_14;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                item = this.items[this.viewState.selectedIndex];
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                playlistId = (typeof this.forPlaylist === "undefined") ? undefined : this.forPlaylist.id;
                                return [4 /*yield*/, this.manager.playAlbumOrTrackAfterCurrentTrack(item, playlistId)];
                            case 2:
                                _a.sent();
                                notificationmanager_3.NotificationManager.showNotification("Item successfully (re)queued");
                                this.deselect();
                                return [3 /*break*/, 4];
                            case 3:
                                e_14 = _a.sent();
                                notificationmanager_3.NotificationManager.showNotification("Unable to play the track after the current track: " + e_14, true);
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); },
                sortBy_click: function (sortField) { return __awaiter(_this, void 0, void 0, function () {
                    var e_15;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                this.viewState.sortBy = sortField;
                                this.scrollToTop();
                                console.log("Sorting changed to " + this.viewState.sortBy);
                                return [4 /*yield*/, this.fill(0)];
                            case 1:
                                _a.sent();
                                return [3 /*break*/, 3];
                            case 2:
                                e_15 = _a.sent();
                                notificationmanager_3.NotificationManager.showNotification("Unable to load results: " + e_15, true);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); },
                loadMore_click: function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!this.viewState.hasMoreResults) return [3 /*break*/, 2];
                                return [4 /*yield*/, this.fill(this.viewState.lastOffset + this.PAGE_SIZE)];
                            case 1:
                                _a.sent();
                                _a.label = 2;
                            case 2: return [2 /*return*/];
                        }
                    });
                }); },
                list_scroll: function (event) { return __awaiter(_this, void 0, void 0, function () {
                    var rect, scrollPerc, SCROLL_PERCENTAGE_THRESHOLD;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                rect = event.target.getBoundingClientRect();
                                scrollPerc = (event.target.scrollTop / (event.target.scrollHeight - rect.height));
                                SCROLL_PERCENTAGE_THRESHOLD = 0.9;
                                if (!(scrollPerc > SCROLL_PERCENTAGE_THRESHOLD && this.viewState.hasMoreResults && !this.loading)) return [3 /*break*/, 2];
                                return [4 /*yield*/, this.fill(this.viewState.lastOffset + this.PAGE_SIZE)];
                            case 1:
                                _a.sent();
                                _a.label = 2;
                            case 2: return [2 /*return*/];
                        }
                    });
                }); }
            });
        };
        BrowsePage.prototype.scrollToTop = function () {
            var _this = this;
            this.gui.$nextTick(function () {
                _this.gui.$refs["body"].scrollTop = 0;
            });
        };
        BrowsePage.prototype.deselect = function () {
            this.viewState.selectedId = "";
            this.viewState.selectedIndex = -1;
        };
        BrowsePage.prototype.bind = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.bindModel(id, this.items);
                            return [4 /*yield*/, this.fill(0)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        BrowsePage.prototype.fill = function (offset) {
            return __awaiter(this, void 0, void 0, function () {
                var result, forPlaylistId, i;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (offset == 0)
                                this.items.splice(0, this.items.length);
                            this.loading = true;
                            forPlaylistId = (typeof this.forPlaylist === "undefined") ? undefined : this.forPlaylist.id;
                            if (!(typeof this.parentAlbumId === "undefined")) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.manager.getAlbumsOrTracks(this.viewState.filter, this.viewState.sortBy, forPlaylistId, offset, this.PAGE_SIZE)];
                        case 1:
                            result = _a.sent();
                            return [3 /*break*/, 4];
                        case 2: return [4 /*yield*/, this.manager.getTracks(this.viewState.filter, this.parentAlbumId, forPlaylistId, offset, this.PAGE_SIZE)];
                        case 3:
                            result = _a.sent();
                            _a.label = 4;
                        case 4:
                            if (offset == 0) // clear it again, because it's possible that multiple calls were awaiting
                                this.items.splice(0, this.items.length);
                            for (i = 0; i < result.items.length; i++)
                                this.items.push(result.items[i]);
                            this.viewState.lastOffset = offset;
                            this.viewState.hasMoreResults = this.viewState.lastOffset + this.PAGE_SIZE < result.totalCount;
                            this.loading = false;
                            return [2 /*return*/];
                    }
                });
            });
        };
        return BrowsePage;
    }(page_4.Page));
    exports.BrowsePage = BrowsePage;
});
define("gui/pages/trackdetailspage", ["require", "exports", "gui/page", "gui/notificationmanager", "gui/pages/browsepage"], function (require, exports, page_5, notificationmanager_4, browsepage_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TrackDetailsPage = /** @class */ (function (_super) {
        __extends(TrackDetailsPage, _super);
        function TrackDetailsPage(pageManager, manager, trackId) {
            var _this = _super.call(this, pageManager) || this;
            _this.loading = false;
            _this.manager = manager;
            _this.trackId = trackId;
            return _this;
        }
        TrackDetailsPage.prototype.getTemplate = function () {
            var template = $(".templates .page.trackdetails").get(0).outerHTML;
            return template;
        };
        TrackDetailsPage.prototype.bind = function (elementId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.bindModel(elementId, null);
                            return [4 /*yield*/, this.fill()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        TrackDetailsPage.prototype.getMethods = function () {
            var _this = this;
            return jQuery.extend(_super.prototype.getMethods.call(this), {
                album_click: function (album) { return __awaiter(_this, void 0, void 0, function () {
                    var browsePage, e_16;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                browsePage = new browsepage_2.BrowsePage(this.pageManager, this.manager);
                                browsePage.filter = "album:" + album;
                                return [4 /*yield*/, this.pageManager.show(browsePage)];
                            case 1:
                                _a.sent();
                                return [3 /*break*/, 3];
                            case 2:
                                e_16 = _a.sent();
                                notificationmanager_4.NotificationManager.showNotification("Unable to browse for selected album:" + e_16, true);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); },
                artist_click: function (artist) {
                    try {
                        var browsePage = new browsepage_2.BrowsePage(_this.pageManager, _this.manager);
                        browsePage.filter = "artist:" + artist;
                        _this.pageManager.show(browsePage);
                    }
                    catch (e) {
                        notificationmanager_4.NotificationManager.showNotification("Unable to browse for selected artist: " + e, true);
                    }
                }
            });
        };
        TrackDetailsPage.prototype.fill = function () {
            return __awaiter(this, void 0, void 0, function () {
                var details;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.loading = true;
                            return [4 /*yield*/, this.manager.getDetails(this.trackId)];
                        case 1:
                            details = _a.sent();
                            this.rebindModel(details);
                            this.loading = false;
                            return [2 /*return*/];
                    }
                });
            });
        };
        TrackDetailsPage.prototype.onevent = function (source, eventName, data) {
            return __awaiter(this, void 0, void 0, function () {
                var e_17;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(eventName == "CurrentTrackChanged")) return [3 /*break*/, 4];
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            this.trackId = data.currentTrack.id;
                            return [4 /*yield*/, this.fill()];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            e_17 = _a.sent();
                            notificationmanager_4.NotificationManager.showNotification("Unable to update details: " + e_17, true);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        return TrackDetailsPage;
    }(page_5.Page));
    exports.TrackDetailsPage = TrackDetailsPage;
});
define("gui/pages/menupage", ["require", "exports", "gui/page", "gui/notificationmanager", "gui/pages/trackdetailspage", "gui/pages/playlistspage", "gui/pages/addplaylistsselectorpage", "gui/pages/browsepage"], function (require, exports, page_6, notificationmanager_5, trackdetailspage_1, playlistspage_2, addplaylistsselectorpage_2, browsepage_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MenuPage = /** @class */ (function (_super) {
        __extends(MenuPage, _super);
        function MenuPage(pageManager, manager, currentState) {
            var _this = _super.call(this, pageManager) || this;
            _this.manager = manager;
            _this.currentState = currentState;
            return _this;
        }
        MenuPage.prototype.getTemplate = function () {
            var template = $(".templates .page.menu").get(0).outerHTML;
            return template;
        };
        MenuPage.prototype.getMethods = function () {
            var _this = this;
            return jQuery.extend(_super.prototype.getMethods.call(this), {
                details_click: function () { return __awaiter(_this, void 0, void 0, function () {
                    var detailsPage, e_18;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                detailsPage = new trackdetailspage_1.TrackDetailsPage(this.pageManager, this.manager, this.currentState.currentTrack.id);
                                return [4 /*yield*/, this.pageManager.show(detailsPage)];
                            case 1:
                                _a.sent();
                                return [3 /*break*/, 3];
                            case 2:
                                e_18 = _a.sent();
                                notificationmanager_5.NotificationManager.showNotification("Unable to fetch details: " + e_18, true);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); },
                playlists_click: function () { return __awaiter(_this, void 0, void 0, function () {
                    var playlistsPage, e_19;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                playlistsPage = new playlistspage_2.PlaylistsPage(this.pageManager, this.manager);
                                return [4 /*yield*/, this.pageManager.show(playlistsPage)];
                            case 1:
                                _a.sent();
                                return [3 /*break*/, 3];
                            case 2:
                                e_19 = _a.sent();
                                notificationmanager_5.NotificationManager.showNotification("Unable to retrieve playlists: " + e_19, true);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); },
                browse_click: function () { return __awaiter(_this, void 0, void 0, function () {
                    var browsePage, e_20;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                browsePage = new browsepage_3.BrowsePage(this.pageManager, this.manager);
                                return [4 /*yield*/, this.pageManager.show(browsePage)];
                            case 1:
                                _a.sent();
                                return [3 /*break*/, 3];
                            case 2:
                                e_20 = _a.sent();
                                notificationmanager_5.NotificationManager.showNotification("Unable to retrieve content: " + e_20, true);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); },
                addToPlaylist_click: function () { return __awaiter(_this, void 0, void 0, function () {
                    var _this = this;
                    var item, playlistSelector_2, e_21;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (this.currentState == null || this.currentState.currentTrack == null)
                                    return [2 /*return*/];
                                item = {
                                    id: this.currentState.currentTrack.id,
                                    name: this.currentState.currentTrack.title,
                                    isTrack: true
                                };
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                playlistSelector_2 = new addplaylistsselectorpage_2.AddToPlaylistsSelectorPage(this.pageManager, this.manager, item, function () { return __awaiter(_this, void 0, void 0, function () {
                                    var e_22;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                _a.trys.push([0, 2, , 3]);
                                                return [4 /*yield*/, this.manager.addToPlaylist(item, playlistSelector_2.selectedId)];
                                            case 1:
                                                _a.sent();
                                                notificationmanager_5.NotificationManager.showNotification(item.name + " added to playlist " + playlistSelector_2.selectedPlaylist.name);
                                                return [3 /*break*/, 3];
                                            case 2:
                                                e_22 = _a.sent();
                                                notificationmanager_5.NotificationManager.showNotification("Unable to add " + item.name + " to playlist " + playlistSelector_2.selectedPlaylist.name + ": " + e_22, true);
                                                return [3 /*break*/, 3];
                                            case 3: return [2 /*return*/];
                                        }
                                    });
                                }); });
                                return [4 /*yield*/, this.pageManager.show(playlistSelector_2)];
                            case 2:
                                _a.sent();
                                return [3 /*break*/, 4];
                            case 3:
                                e_21 = _a.sent();
                                notificationmanager_5.NotificationManager.showNotification("Unable to fetch playlists: " + e_21, true);
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); }
            });
        };
        MenuPage.prototype.bind = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var model;
                return __generator(this, function (_a) {
                    model = null;
                    this.bindModel(id, model);
                    return [2 /*return*/];
                });
            });
        };
        return MenuPage;
    }(page_6.Page));
    exports.MenuPage = MenuPage;
});
define("gui/pages/mainpage", ["require", "exports", "gui/page", "domain/objects", "gui/playerviewstate", "gui/notificationmanager", "gui/pages/menupage"], function (require, exports, page_7, objects_2, playerviewstate_1, notificationmanager_6, menupage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function updateBackgroundSVG(imgUrl) {
        $('<img/>').attr('src', imgUrl).on('load', function () {
            $(this).remove();
            $("#artbackgroundsvg").fadeOut(200, function () {
                $("#artbackgroundsvg").attr("xlink:href", imgUrl);
                $("#artbackgroundsvg").fadeIn(200);
            });
        }).on("error", function () {
            $("#artbackgroundsvg").fadeOut(200, function () {
                $("#artbackgroundsvg").attr("xlink:href", '');
                $("#artbackgroundsvg").fadeIn(200);
            });
        });
    }
    var MainPage = /** @class */ (function (_super) {
        __extends(MainPage, _super);
        function MainPage(pageManager, manager) {
            var _this = _super.call(this, pageManager) || this;
            _this.playerState = null;
            _this.loading = false;
            _this.loadingNext = false;
            _this.loadingPrevious = false;
            // loadingTrack is only set to true when trackLoaded is false, so track was not loaded before and only when the user wants to play
            // because howler lazy loads the track
            _this.loadingTrack = false;
            // will be true when the track is ready for playback
            _this.trackLoaded = false;
            _this.toggleShowVolume = false;
            _this.viewState = new playerviewstate_1.JPlayerPlayerViewState();
            _this.volumeTimerId = -1;
            _this.manager = manager;
            _this.tmrUpdateProgressId = window.setInterval(function () { return _this.tmrUpdateProgress_Tick(); }, 1000);
            _this.tmrCheckIfTrackIsStillCurrentId = window.setTimeout(function () { return _this.tmrCheckIfTrackIsStillCurrent_Tick(); }, 10000);
            _this.viewState.onLoadError = function (error) { return _this.player_LoadError(error); };
            _this.viewState.onLoad = function () { return _this.player_Load(); };
            _this.viewState.onEnd = function () { return _this.player_End(); };
            return _this;
        }
        Object.defineProperty(MainPage.prototype, "currentTrack", {
            get: function () {
                return this.playerState == null ? null : this.playerState.currentTrack;
            },
            enumerable: true,
            configurable: true
        });
        MainPage.prototype.player_LoadError = function (error) {
            notificationmanager_6.NotificationManager.showNotification("Error loading track: " + JSON.stringify(error), true);
            this.loadingTrack = false;
            this.trackLoaded = false;
        };
        MainPage.prototype.player_Load = function () {
            console.log("Track loaded");
            this.loadingTrack = false;
            this.trackLoaded = true;
        };
        MainPage.prototype.player_End = function () {
            console.log("Finished");
            this.playNext(true);
        };
        MainPage.prototype.getTemplate = function () {
            var template = $(".templates .page.main").get(0).outerHTML;
            return template;
        };
        MainPage.prototype.getMethods = function () {
            var _this = this;
            var methods = {
                play_click: function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, this.togglePlayback()];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); },
                stop_click: function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, this.stopPlayback()];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); },
                rewind_click: function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, this.playPrevious()];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); },
                fastForward_click: function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        this.playNext(false);
                        return [2 /*return*/];
                    });
                }); },
                volume_click: function () {
                    _this.toggleShowVolume = !_this.toggleShowVolume;
                },
                volumebar_mouseup: function (event) {
                    var percentage = event.offsetX / $(event.currentTarget).width();
                    if (percentage < 0)
                        percentage = 0;
                    if (percentage > 1)
                        percentage = 1;
                    _this.viewState.setVolume(percentage);
                },
                progressbar_mouseup: function (event) {
                    var percentage = event.offsetX / $(event.currentTarget).width();
                    if (percentage < 0)
                        percentage = 0;
                    if (percentage > 1)
                        percentage = 1;
                    _this.viewState.seek(percentage);
                },
                shuffle_click: function () { return __awaiter(_this, void 0, void 0, function () {
                    var playerState, e_23;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (this.playerState == null)
                                    return [2 /*return*/];
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, this.manager.toggleShuffle(!this.playerState.shuffle)];
                            case 2:
                                playerState = _a.sent();
                                this.setPlayerState(playerState, true);
                                return [3 /*break*/, 4];
                            case 3:
                                e_23 = _a.sent();
                                notificationmanager_6.NotificationManager.showNotification("Unable to set toggle shuffle: " + e_23, true);
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); },
                like_click: function () { return __awaiter(_this, void 0, void 0, function () {
                    var playerState, e_24;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (this.playerState == null || this.playerState.currentTrack == null)
                                    return [2 /*return*/];
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 6, , 7]);
                                if (!(this.playerState.currentTrack.liked == objects_2.LikeStatus.None)) return [3 /*break*/, 3];
                                return [4 /*yield*/, this.manager.setLikeStatus(this.playerState.currentTrack.id, objects_2.LikeStatus.Liked)];
                            case 2:
                                playerState = _a.sent();
                                this.setPlayerState(playerState, true);
                                return [3 /*break*/, 5];
                            case 3: return [4 /*yield*/, this.manager.setLikeStatus(this.playerState.currentTrack.id, objects_2.LikeStatus.None)];
                            case 4:
                                _a.sent();
                                this.playerState.currentTrack.liked = objects_2.LikeStatus.None;
                                _a.label = 5;
                            case 5: return [3 /*break*/, 7];
                            case 6:
                                e_24 = _a.sent();
                                notificationmanager_6.NotificationManager.showNotification("Unable to set like status: " + e_24, true);
                                return [3 /*break*/, 7];
                            case 7: return [2 /*return*/];
                        }
                    });
                }); },
                menu_click: function () { return __awaiter(_this, void 0, void 0, function () {
                    var menuPage, e_25;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (this.playerState == null)
                                    return [2 /*return*/];
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                menuPage = new menupage_1.MenuPage(this.pageManager, this.manager, this.playerState);
                                return [4 /*yield*/, this.pageManager.show(menuPage)];
                            case 2:
                                _a.sent();
                                return [3 /*break*/, 4];
                            case 3:
                                e_25 = _a.sent();
                                notificationmanager_6.NotificationManager.showNotification("Unable to show menu: " + e_25, true);
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); }
            };
            return jQuery.extend(_super.prototype.getMethods.call(this), methods);
        };
        MainPage.prototype.volumeUp = function () {
            var _this = this;
            this.toggleShowVolume = true;
            var percentage = this.viewState.getVolume();
            percentage += (percentage < 0.05 ? 0.01 : 0.05);
            if (percentage < 0)
                percentage = 0;
            if (percentage > 1)
                percentage = 1;
            this.viewState.setVolume(percentage);
            if (this.volumeTimerId != -1)
                window.clearTimeout(this.volumeTimerId);
            this.volumeTimerId = window.setTimeout(function () {
                _this.toggleShowVolume = false;
            }, 1000);
        };
        MainPage.prototype.volumeDown = function () {
            var _this = this;
            this.toggleShowVolume = true;
            var percentage = this.viewState.getVolume();
            percentage -= (percentage <= 0.05 ? 0.01 : 0.05);
            if (percentage < 0)
                percentage = 0;
            if (percentage > 1)
                percentage = 1;
            this.viewState.setVolume(percentage);
            if (this.volumeTimerId != -1)
                window.clearTimeout(this.volumeTimerId);
            this.volumeTimerId = window.setTimeout(function () {
                _this.toggleShowVolume = false;
            }, 1000);
        };
        MainPage.prototype.playPrevious = function () {
            return __awaiter(this, void 0, void 0, function () {
                var wasPlaying, player, e_26;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this.playerState == null)
                                return [2 /*return*/];
                            wasPlaying = this.viewState.playing();
                            this.loadingPrevious = true;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.manager.previousTrack(this.playerState.currentTrack.id)];
                        case 2:
                            player = _a.sent();
                            this.setPlayerState(player, true);
                            return [3 /*break*/, 4];
                        case 3:
                            e_26 = _a.sent();
                            notificationmanager_6.NotificationManager.showNotification("Error setting previous track: " + e_26, true);
                            return [3 /*break*/, 4];
                        case 4:
                            this.loadingPrevious = false;
                            return [2 /*return*/];
                    }
                });
            });
        };
        MainPage.prototype.togglePlayback = function () {
            return __awaiter(this, void 0, void 0, function () {
                var e_27, e_28;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this.playerState == null)
                                return [2 /*return*/];
                            if (!this.viewState.playing()) return [3 /*break*/, 5];
                            this.viewState.pause();
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.manager.updatePlayerPlayingStatus(this.playerState.currentTrack.id, false)];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            e_27 = _a.sent();
                            notificationmanager_6.NotificationManager.showNotification("Unable to set player playing status: " + e_27, true);
                            return [3 /*break*/, 4];
                        case 4: return [3 /*break*/, 9];
                        case 5:
                            if (!this.trackLoaded) // show track loading only when the track wasn't loaded before, as otherwise the load event isn't triggered
                                this.loadingTrack = true;
                            this.viewState.play();
                            _a.label = 6;
                        case 6:
                            _a.trys.push([6, 8, , 9]);
                            return [4 /*yield*/, this.manager.updatePlayerPlayingStatus(this.playerState.currentTrack.id, true)];
                        case 7:
                            _a.sent();
                            return [3 /*break*/, 9];
                        case 8:
                            e_28 = _a.sent();
                            notificationmanager_6.NotificationManager.showNotification("Unable to set player playing status: " + e_28, true);
                            return [3 /*break*/, 9];
                        case 9: return [2 /*return*/];
                    }
                });
            });
        };
        MainPage.prototype.stopPlayback = function () {
            return __awaiter(this, void 0, void 0, function () {
                var wasPlaying, e_29;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this.playerState == null)
                                return [2 /*return*/];
                            wasPlaying = this.viewState.playing();
                            this.viewState.stop();
                            this.viewState.seek(0);
                            this.viewState.currentTime = 0; // synchronizestate only changes this if howl is playing to prevent errors
                            this.viewState.progress = 0;
                            if (!wasPlaying) return [3 /*break*/, 4];
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.manager.updatePlayerPlayingStatus(this.playerState.currentTrack.id, false)];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            e_29 = _a.sent();
                            notificationmanager_6.NotificationManager.showNotification("Unable to set player playing status: " + e_29, true);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        MainPage.prototype.playNext = function (playedToEnd) {
            return __awaiter(this, void 0, void 0, function () {
                var wasPlaying, player, e_30;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this.playerState == null)
                                return [2 /*return*/];
                            this.loadingNext = true;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            wasPlaying = this.viewState.playing() || playedToEnd;
                            return [4 /*yield*/, this.manager.nextTrack(this.playerState.currentTrack.id, playedToEnd)];
                        case 2:
                            player = _a.sent();
                            this.setPlayerState(player, false);
                            // continuePlaying will play the next track if the howl was playing, which it wasn't if playedToEnd == true
                            // so check manually
                            if (wasPlaying && !this.viewState.playing()) // if it was playing continue with the next song
                                this.togglePlayback();
                            else {
                                this.viewState.seek(0);
                                this.viewState.currentTime = 0; // synchronizestate only changes this if howl is playing to prevent errors
                                this.viewState.progress = 0;
                            }
                            return [3 /*break*/, 4];
                        case 3:
                            e_30 = _a.sent();
                            notificationmanager_6.NotificationManager.showNotification("Error setting next track: " + e_30, true);
                            return [3 /*break*/, 4];
                        case 4:
                            this.loadingNext = false;
                            return [2 /*return*/];
                    }
                });
            });
        };
        MainPage.prototype.getComputed = function () {
            var _this = this;
            return jQuery.extend(_super.prototype.getComputed.call(this), {
                formattedCurrentTime: function () {
                    return MainPage.formatTime(_this.viewState.currentTime);
                },
                formattedTotalTime: function () {
                    return MainPage.formatTime(_this.viewState.totalTime);
                }
            });
        };
        MainPage.formatTime = function (time) {
            if (typeof (time) === "undefined" || isNaN(time))
                return "--:--";
            var seconds = Math.round(time) % 60;
            var minutes = Math.floor(Math.round(time) / 60);
            return ((minutes + "").length == 1 ? "0" : "") + minutes + ":" +
                ((seconds + "").length == 1 ? "0" : "") + seconds;
        };
        MainPage.prototype.bind = function (elementId) {
            return __awaiter(this, void 0, void 0, function () {
                var player;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.bindModel(elementId, this.playerState);
                            console.log("Loading..");
                            this.loading = true;
                            return [4 /*yield*/, this.manager.getCurrentPlayerState()];
                        case 1:
                            player = _a.sent();
                            this.setPlayerState(player, false);
                            console.log("Loading done");
                            this.loading = false;
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Sets the new player state and initializes a new howl to play it
         */
        MainPage.prototype.setPlayerState = function (playerState, continuePlaying) {
            var isTrackChanged = this.isTrackChanged(playerState.currentTrack == null ? null : playerState.currentTrack.id);
            var wasPlaying = this.viewState.isPlaying;
            this.playerState = playerState;
            if (isTrackChanged) {
                if (this.playerState.currentTrack == null)
                    updateBackgroundSVG("");
                else
                    updateBackgroundSVG(this.playerState.currentTrack.artImage);
                this.viewState.changeTrack(this.playerState);
                if (continuePlaying) {
                    if (wasPlaying && !this.viewState.playing()) // if it was playing continue with the next song
                        this.togglePlayback();
                    else {
                        this.viewState.seek(0);
                        this.viewState.currentTime = 0; // synchronizestate only changes this if howl is playing to prevent errors
                        this.viewState.progress = 0;
                    }
                }
                this.pageManager.emit(this, "CurrentTrackChanged", this.playerState);
            }
            this.rebindModel(this.playerState);
        };
        MainPage.prototype.isTrackChanged = function (id) {
            var isTrackChanged = this.playerState == null ||
                (this.playerState.currentTrack == null && id != null) ||
                (this.playerState.currentTrack != null && id == null) ||
                (this.playerState.currentTrack != null && id != null &&
                    this.playerState.currentTrack.id != id);
            return isTrackChanged;
        };
        MainPage.prototype.tmrUpdateProgress_Tick = function () {
            this.viewState.synchronizeState();
        };
        MainPage.prototype.tmrCheckIfTrackIsStillCurrent_Tick = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                var trackId, player, e_31;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 4, 5, 6]);
                            // don't check during loading, it might be changing anyway
                            if (this.loadingNext || this.loadingPrevious || this.loading)
                                return [2 /*return*/];
                            return [4 /*yield*/, this.manager.getCurrentTrackId()];
                        case 1:
                            trackId = _a.sent();
                            if (!this.isTrackChanged(trackId)) return [3 /*break*/, 3];
                            console.log("Track was changed on server, updating state");
                            return [4 /*yield*/, this.manager.getCurrentPlayerState()];
                        case 2:
                            player = _a.sent();
                            this.setPlayerState(player, true);
                            _a.label = 3;
                        case 3: return [3 /*break*/, 6];
                        case 4:
                            e_31 = _a.sent();
                            console.error("Unable to check current track state: " + e_31);
                            return [3 /*break*/, 6];
                        case 5:
                            this.tmrCheckIfTrackIsStillCurrentId = window.setTimeout(function () { return _this.tmrCheckIfTrackIsStillCurrent_Tick(); }, 10000);
                            return [7 /*endfinally*/];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        MainPage.prototype.onevent = function (source, eventName, data) {
            if (eventName == "PlayerStateChanged") {
                this.setPlayerState(data, true);
            }
        };
        MainPage.prototype.close = function () {
            this.viewState.stop();
            window.clearInterval(this.tmrUpdateProgressId);
            window.clearTimeout(this.tmrCheckIfTrackIsStillCurrentId);
            _super.prototype.close.call(this);
        };
        return MainPage;
    }(page_7.Page));
    exports.MainPage = MainPage;
});
// only necessary for typescript to recognize Vue
define("main", ["require", "exports", "gui/pages/mainpage", "gui/pagemanager", "domain/manager", "gui/notificationmanager", "vue/types/vue"], function (require, exports, mainpage_1, pagemanager_1, manager_1, notificationmanager_7, vue_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TEST = false;
    console.clear();
    vue_2.Vue.config.errorHandler = function (err) {
        console.error("Vue compilation error: " + err.name + ": " + err.message);
    };
    vue_2.Vue.component("loading", {
        template: $(".templates .loader").html()
    });
    vue_2.Vue.directive("perfectscrollbar", {
        bind: function (el, binding, vnode) {
            $(el).perfectScrollbar();
            $(el).perfectScrollbar('update');
        }
    });
    /**
     *  Background image binding, fade in element and fadeout -> fade in when image changes
     */
    vue_2.Vue.directive("backgroundimage", {
        bind: function (el, binding, vnode) {
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
    /**
     *  Text binding, fade in element and fadeout -> fade in when text changes
     */
    vue_2.Vue.directive("fadetext", {
        bind: function (el, binding, vnode) {
            $(el).text(binding.value);
        },
        update: function (el, binding, vnode, oldVnode) {
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
        API.register = function () {
            window.API = this;
        };
        return API;
    }());
    function initialize() {
        return __awaiter(this, void 0, void 0, function () {
            var trackManager, pageManager, mainPage, e_32;
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
                        e_32 = _a.sent();
                        notificationmanager_7.NotificationManager.showNotification("Error: " + e_32, true);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    initialize();
    API.register();
});
