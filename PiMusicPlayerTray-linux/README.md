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

> **Note:** Global hotkeys are implemented with `pynput`, which uses X11 to
> listen for key presses. This works out of the box on X11 sessions and on
> most Wayland sessions running under XWayland, but pure-Wayland compositors
> without XWayland support may not deliver global hotkeys.

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
