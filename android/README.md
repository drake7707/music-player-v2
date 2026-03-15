# Music Player V2 - Android App

A native Android app for the Music Player V2 backend API.

## Features

- **Player screen**: Shows current track with album art, title, artists, and album. Controls include play/pause, previous, next, shuffle, and like.
- **Auto-advance**: When a track finishes, the app automatically calls the backend API to get the next track and plays it — even in the background.
- **Background playback**: Uses a foreground Service with ExoPlayer so music keeps playing when the screen is off or the app is in the background.
- **Media notification**: Shows playback controls in the system notification, allowing control without opening the app.
- **Browse screen**: Browse albums and tracks with search, sort, and pagination support.
- **Playlists screen**: List, play, and delete playlists. Create new playlists.
- **Track details screen**: Shows full track metadata including play count and scrobble history.
- **Add to Playlist**: Add/remove tracks or albums to/from playlists.
- **Settings**: Configure the server URL.

## Requirements

- Android 8.0 (API 26) or higher
- Android Studio Hedgehog (2023.1.1) or newer, or Android SDK command-line tools

## Building

1. Open Android Studio
2. Open the `android/` folder as a project
3. In the Settings screen, enter your server URL (e.g. `http://192.168.1.100:5000`)
4. Build and run on your device or emulator

Or using the command line:
```bash
cd android
./gradlew assembleDebug
```

## Architecture

- **Language**: Kotlin
- **UI**: Single Activity + Navigation Component (fragments)
- **Architecture**: MVVM with ViewModels + LiveData
- **Audio**: ExoPlayer (androidx.media3) inside a LifecycleService
- **Networking**: Retrofit2 + OkHttp + Gson
- **Image Loading**: Glide
- **Build**: Gradle with Android Gradle Plugin 8.5.2

## Configuration

On first launch, go to the overflow menu → **Settings** and enter the URL of your Music Player backend server (including port). 

Example: `http://192.168.1.100:5000`

The URL is saved in shared preferences and persists across app restarts.
