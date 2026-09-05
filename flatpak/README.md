# Flatpak packaging for PiMusicPlayerTray

This directory contains everything needed to build PiMusicPlayerTray-linux
as a Flatpak, so it can run on any Linux distribution without manually
installing GTK/WebKit/AppIndicator system packages.

## Files

- `org.drakarah.PiMusicPlayerTray.yml` — the Flatpak manifest.
- `org.drakarah.PiMusicPlayerTray.desktop` — desktop entry (app menu, icon).
- `org.drakarah.PiMusicPlayerTray.metainfo.xml` — AppStream metadata.
- `python3-pynput.json` — builds `pynput` and its dependencies (`six`,
  `python-xlib`, `evdev`) from pinned PyPI sources so the build works fully
  offline once the sources are downloaded.
- `shared-modules/` — copies of the relevant modules from the
  [flathub/shared-modules](https://github.com/flathub/shared-modules)
  repository, used to build `libayatana-appindicator` (and its `intltool`
  dependency) from source, since it is not part of the GNOME runtime.

The app itself (`main.py`, `config.ini`, `playericon_2.png`) is picked up
directly from `../PiMusicPlayerTray-linux`.

## Building locally

Requires `flatpak` and `flatpak-builder`, plus the GNOME 48 runtime/SDK:

```bash
flatpak install -y flathub org.gnome.Platform//48 org.gnome.Sdk//48

flatpak-builder --user --install --force-clean build-dir \
    org.drakarah.PiMusicPlayerTray.yml
```

Then run it with:

```bash
flatpak run org.drakarah.PiMusicPlayerTray
```

## Permissions (finish-args)

- `--socket=wayland` / `--socket=fallback-x11` / `--socket=x11`: needed to
  show the popup window, and for `pynput` to register global hotkeys (which
  requires direct X11/XWayland access).
- `--share=network`: the popup loads the MusicPlayerV2 web page, normally
  served from `localhost`.
- `--talk-name=org.kde.StatusNotifierWatcher` / `--own-name=org.kde.StatusNotifierItem-*`:
  required for the AppIndicator-based tray icon to register itself.

## Configuration

The app ships `config.ini` with the same defaults as the Windows version.
Users can override any setting (e.g. `PlayerUrl` or a hotkey) by creating
`~/.config/pimusicplayertray/config.ini` — inside the Flatpak sandbox this
resolves to `~/.var/app/org.drakarah.PiMusicPlayerTray/config/pimusicplayertray/config.ini`
automatically, no extra permissions required. Only the keys you want to
change need to be present; anything else falls back to the bundled default.

## Updating pinned pip sources

If `pynput` (or one of its dependencies) needs to be updated, regenerate
`python3-pynput.json` with the new PyPI download URLs and `sha256` hashes,
e.g. using [flatpak-pip-generator](https://github.com/flatpak/flatpak-builder-tools/tree/master/pip).
