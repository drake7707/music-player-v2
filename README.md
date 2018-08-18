# Music player v2
Music player front &amp; backend

This is the music player web application I've written to host on my raspberry pi so I could listen to my music from anywhere, either on my phone in the background or through a small windows tray application with a webbrowser control that registers global hotkeys for controlling media playback. It has the basic media playback functionaliy and also supports making playlists, liking tracks and integrates with LastFM through their API.

This is the second version, it used to be a quickly whipped up player without any other functionality.

The front end is made with Typescript and Vue as template engine. The backend is using dotnetcore with an sqlite database.

## Usage

Change the appsettings.json to point to the correct directories. 2 database files are created, one for the metadata, another specifically for the cover images. The 3rd path you point to the actual directory containing the mp3 files. For setting up the Last FM integration, look at the Lpfm.LastFmScrobbler documentation.

## Screenshots

![](https://i.imgur.com/07AoCly.png)

![](https://i.imgur.com/lLRVQhr.png)

![](https://i.imgur.com/rB7zn3n.png)

![](https://i.imgur.com/aiFJdPx.png)

![](https://i.imgur.com/cmdq9GM.png)
