# PiMusicPlayerTray (Linux)

A Linux port of the Windows `PiMusicPlayerTray` application. It shows a system
tray icon that displays what's currently playing, opens a small popup with
the music player web page, and registers global keyboard shortcuts so you can
control playback without switching to the browser.

## Features

- System tray icon (via AppIndicator) showing the current "now playing" info
  as its tooltip/title.
- Popup window (bottom-right of the screen) embedding the player web page,
  shown automatically when the track changes, or manually via the tray menu
  or the "Show" hotkey.
- Global hotkeys (work even when the window isn't focused) for:
  - Play/Pause
  - Stop
  - Next / Previous
  - Volume up / down
  - Reload the page
  - Show the popup
- Same `Version` setting as the Windows app to switch between the `API.*`
  JavaScript interface (`Version = 2`) and the legacy `player*` functions.

> **Note:** Global hotkeys are registered through the
> [`org.freedesktop.portal.GlobalShortcuts`](https://flatpak.github.io/xdg-desktop-portal/docs/doc-org.freedesktop.portal.GlobalShortcuts.html)
> desktop portal, which is the native, sandbox-friendly way to get global
> hotkeys on Wayland (compositors don't let arbitrary clients grab keys
> directly the way X11 does). This requires an `xdg-desktop-portal` backend
> that implements the interface, e.g. `xdg-desktop-portal-gnome` (GNOME 45+),
> `xdg-desktop-portal-kde`, or `xdg-desktop-portal-wlr` with it enabled; on
> first use the desktop may prompt you to confirm/assign the shortcuts. If
> that portal interface isn't available, the app automatically falls back to
> `pynput`, which listens for key presses via X11 directly — this works on
> X11 sessions and on Wayland sessions running under XWayland. If neither
> backend can be initialized (e.g. no portal support and no X server
> reachable at all), the application still starts normally with the tray
> icon and popup; a warning is printed to stderr and global hotkeys are
> simply disabled instead of crashing on startup.

## Installing via Flatpak

The easiest way to run PiMusicPlayerTray on any Linux distribution — without
manually installing GTK/WebKit/AppIndicator packages — is via the Flatpak
packaging in [`../flatpak`](../flatpak). See that directory's `README.md` for
build/install instructions.

## Dependencies

System packages (Debian/Ubuntu names, adjust for your distro):

```bash
sudo apt install python3-gi gir1.2-gtk-3.0 gir1.2-webkit2-4.1 \
    gir1.2-ayatanaappindicator3-0.1 python3-pip
```

If `gir1.2-ayatanaappindicator3-0.1` is not available on your distribution,
install `gir1.2-appindicator3-0.1` instead.

Python dependencies:

```bash
pip3 install -r requirements.txt
```

## Configuration

Edit `config.ini`:

```ini
[General]
PlayerUrl = http://localhost:5000/
Version = 2
PopupChange = true
WaitTicksOnAutoPopup = 100
FormWidth = 400
FormHeight = 520

[Hotkeys]
PlayPause = ctrl+alt+k
Stop = ctrl+alt+n
Next = ctrl+alt+m
Previous = ctrl+alt+i
VolumeUp = ctrl+alt+o
VolumeDown = ctrl+alt+l
Refresh = ctrl+alt+f5
Show = ctrl+alt+u
```

- `PlayerUrl`: address of the MusicPlayerV2 web page.
- `Version`: `2` uses `API.playPause()`, `API.forward()`, etc. Anything else
  falls back to the legacy `playerTogglePlay()`, `playerNext()`, ... calls.
- `PopupChange`: automatically show the popup for a bit when the playing
  track changes.
- `WaitTicksOnAutoPopup`: how many 100ms ticks the popup stays visible before
  fading out again.
- Hotkeys are written as `modifier+modifier+key`, e.g. `ctrl+alt+k` or
  `ctrl+alt+f5`. Supported modifiers: `ctrl`, `alt`, `shift`, `super`/`win`.

## Running

```bash
python3 main.py
```

Run it from your desktop environment's autostart to have it start
automatically, e.g. by adding a `.desktop` file to
`~/.config/autostart/`.
