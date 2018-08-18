
import { LikeStatus, IAlbumOrTrackItem } from "./objects";

export class DummyBackend {
    private static currentTrack: number = 0;

    private static tracks = [
        {
            title: 'This is a test title for testing',
            artists: [''],
            album: "Dragonball Z3",
            trackNr: 1,
            artImage: "llhttps://i.imgur.com/13MdjPD.png",
            liked: LikeStatus.None,
            url: "http://dwight.skyon.be/arrange.mp3"
        },
        {
            title: 'Another track',
            artists: ['I have no idea'],
            album: "Journey",
            trackNr: 1,
            artImage: "https://i.imgur.com/eSS7WVW.png",
            liked: LikeStatus.None,
            url: "http://dwight.skyon.be/arrange.mp3"
        }
    ];

    static get<T>(then: (obj: T) => void, reject: (reason: any) => void, path: string, data?: any) {

        window.setTimeout(() => {
            if (path == "/api/player/GetCurrentPlayerState") {
                then(<T><any>{
                    player: {
                        shuffle: false,
                        currentTrack: DummyBackend.tracks[DummyBackend.currentTrack]
                    }
                });
            }
            else if (path == "/api/player/NextTrack") {
                DummyBackend.currentTrack = (DummyBackend.currentTrack + 1) % DummyBackend.tracks.length;
                then(<T><any>{
                    player: {
                        shuffle: false,
                        currentTrack: DummyBackend.tracks[DummyBackend.currentTrack]
                    }
                });
            }
            else if (path == "/api/playlist/GetPlaylists") {
                then(<T><any>{
                    playlists: [
                        { id: 0, name: "[All]", isCurrent: true, nrOfTracks: 5 },
                        { id: 1, name: "Chill", isCurrent: false, nrOfTracks: 123 },
                        { id: 2, name: "Energetic", isCurrent: false, nrOfTracks: 0 },
                    ]
                });
            }
            else if (path == "/api/playlist/GetAlbumsOrTracks") {
                let items: IAlbumOrTrackItem[] = [];
                for (let i: number = data.offset; i < data.offset + data.size; i++) {

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
                then(<T><any>{
                    items: items,
                    totalCount: 2000
                });
            }
            else if (path == "/api/playlist/GetTracks") {
                let items: IAlbumOrTrackItem[] = [];
                for (let i: number = 0; i < 10; i++) {
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
                then(<T><any>{
                    items: items
                });
            }
            else if (path == "/api/player/GetDetails") {
                then(<T><any>{
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
                        liked: LikeStatus.Liked,

                        lastScrobbles: [
                            { on: new Date(), playedToEnd: true },
                            { on: new Date(), playedToEnd: true },
                            { on: new Date(), playedToEnd: true }
                        ]
                    }
                })
            }
            else {
                reject("Path '" + path + "' not found");
            }
        }, 500);
    }
}
