"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var objects_1 = require("./objects");
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
