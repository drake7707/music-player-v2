"use strict";
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
var dummybackend_1 = require("./dummybackend");
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
