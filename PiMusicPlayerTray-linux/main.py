#!/usr/bin/env python3
"""PiMusicPlayerTray for Linux.

A GTK based system tray application that shows the music player web page in a
small popup window and lets you control playback (play/pause, next,
previous, stop, volume, ...) using global keyboard shortcuts, without having
to switch to the browser tab.

This is the Linux counterpart of the Windows PiMusicPlayerTray application.
See README.md for setup instructions and dependencies.
"""
import configparser
import os
import sys

import gi

gi.require_version("Gtk", "3.0")
gi.require_version("WebKit2", "4.1")

try:
    gi.require_version("AyatanaAppIndicator3", "0.1")
    from gi.repository import AyatanaAppIndicator3 as AppIndicator3
except (ValueError, ImportError):
    gi.require_version("AppIndicator3", "0.1")
    from gi.repository import AppIndicator3

from gi.repository import Gdk, GLib, Gtk, WebKit2

from pynput import keyboard

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
APP_ID = "org.drakarah.PiMusicPlayerTray"

# Same set of hotkeys/actions as the Windows PiMusicPlayerTray application.
HOTKEY_NAMES = [
    "PlayPause",
    "Stop",
    "Next",
    "Previous",
    "VolumeUp",
    "VolumeDown",
    "Refresh",
    "Show",
]

# Maps the friendly modifier names used in config.ini to the names pynput
# expects when building a hotkey combo string.
MODIFIER_MAP = {
    "ctrl": "<ctrl>",
    "control": "<ctrl>",
    "alt": "<alt>",
    "shift": "<shift>",
    "win": "<cmd>",
    "super": "<cmd>",
    "cmd": "<cmd>",
}

# Legacy (Version != "2") player API function names, mirroring MainForm.cs.
LEGACY_API_FUNCTIONS = {
    "playPause": "playerTogglePlay",
    "forward": "playerNext",
    "rewind": "playerPrevious",
    "stop": "playerStop",
    "volumeUp": "playerVolumeUp",
    "volumeDown": "playerVolumeDown",
}


def _default_config_path():
    """Locate the bundled config.ini with the built-in default settings.

    When run from a checkout it sits next to this script; when installed
    (e.g. via the Flatpak) it is shipped as a read-only data file instead.
    """
    local = os.path.join(SCRIPT_DIR, "config.ini")
    if os.path.exists(local):
        return local

    for data_dir in GLib.get_system_data_dirs():
        candidate = os.path.join(data_dir, "pimusicplayertray", "config.ini")
        if os.path.exists(candidate):
            return candidate

    return local


def _user_config_path():
    """Per-user, writable config.ini used to override the bundled defaults."""
    return os.path.join(GLib.get_user_config_dir(), "pimusicplayertray", "config.ini")


def load_config():
    parser = configparser.ConfigParser()
    # Values from the user config (if present) take precedence over the
    # bundled defaults, so users only need to set the keys they want to
    # change (e.g. just PlayerUrl or a single hotkey).
    parser.read([_default_config_path(), _user_config_path()])
    general = parser["General"] if parser.has_section("General") else {}
    hotkeys = parser["Hotkeys"] if parser.has_section("Hotkeys") else {}
    return general, hotkeys


def to_pynput_combo(value):
    """Convert a 'ctrl+alt+k' style combo into pynput's '<ctrl>+<alt>+k'."""
    parts = [p.strip().lower() for p in value.split("+") if p.strip()]
    if not parts:
        raise ValueError("empty hotkey definition")

    converted = []
    for part in parts:
        if part in MODIFIER_MAP:
            converted.append(MODIFIER_MAP[part])
        elif len(part) == 1:
            converted.append(part)
        else:
            # Named keys such as function keys (f5), space, tab, etc.
            converted.append("<%s>" % part)
    return "+".join(converted)


class PiMusicPlayerTray:
    WAIT_TICKS_DEFAULT = 50
    ANIM_TICK_MS = 100
    INFO_TICK_MS = 1000
    FADE_STEP = 0.1

    def __init__(self):
        self.general, self.hotkeys_cfg = load_config()

        self.player_url = self.general.get("PlayerUrl", "http://localhost:5000/")
        self.api_version = str(self.general.get("Version", "2"))
        self.popup_on_change = str(self.general.get("PopupChange", "true")).lower() == "true"
        self.wait_ticks = int(self.general.get("WaitTicksOnAutoPopup", self.WAIT_TICKS_DEFAULT))
        self.form_width = int(self.general.get("FormWidth", 400))
        self.form_height = int(self.general.get("FormHeight", 520))

        self.wait_timeout = self.wait_ticks
        self.do_not_auto_hide = False
        self.anim_state = "idle"  # idle, fade_in, wait, fade_out
        self.last_info = ""
        self.hotkey_listener = None

        self._build_window()
        self._build_indicator()
        self._register_hotkeys()

        GLib.timeout_add(self.INFO_TICK_MS, self._on_update_info_tick)
        GLib.timeout_add(self.ANIM_TICK_MS, self._on_anim_tick)

    # ------------------------------------------------------------------
    # UI construction
    # ------------------------------------------------------------------
    def _build_window(self):
        self.window = Gtk.Window(title="PiMusicPlayerTray")
        self.window.set_default_size(self.form_width, self.form_height)
        self.window.set_keep_above(True)
        self.window.set_skip_taskbar_hint(True)
        self.window.set_skip_pager_hint(True)
        self.window.connect("delete-event", self._on_window_close)
        self.webview = WebKit2.WebView()
        self.webview.connect("load-changed", self._on_load_changed)
        self.webview.load_uri(self.player_url)
        self.window.add(self.webview)

        self.is_loaded = False

    def _build_indicator(self):
        icon = self._resolve_icon()

        self.indicator = AppIndicator3.Indicator.new(
            "pimusicplayertray",
            icon,
            AppIndicator3.IndicatorCategory.APPLICATION_STATUS,
        )
        self.indicator.set_status(AppIndicator3.IndicatorStatus.ACTIVE)

        menu = Gtk.Menu()

        show_item = Gtk.MenuItem(label="Show")
        show_item.connect("activate", lambda *_: self.show_form(True))
        menu.append(show_item)

        reload_item = Gtk.MenuItem(label="Reload")
        reload_item.connect("activate", lambda *_: self.reload())
        menu.append(reload_item)

        menu.append(Gtk.SeparatorMenuItem())

        exit_item = Gtk.MenuItem(label="Exit")
        exit_item.connect("activate", lambda *_: self.quit())
        menu.append(exit_item)

        menu.show_all()
        self.indicator.set_menu(menu)

    def _resolve_icon(self):
        # AppIndicator expects an icon theme name or a path to a standard
        # image format (PNG/SVG); .ico files are not reliably supported.
        # Prefer the icon installed into the icon theme (e.g. by the
        # Flatpak/package), falling back to the bundled PNG shipped next to
        # this script or as a data file when running from an installed
        # (e.g. Flatpak) location.
        theme = Gtk.IconTheme.get_default()
        if theme is not None and theme.has_icon(APP_ID):
            return APP_ID

        candidates = [os.path.join(SCRIPT_DIR, "playericon_2.png")]
        for data_dir in GLib.get_system_data_dirs():
            candidates.append(os.path.join(data_dir, "pimusicplayertray", "playericon_2.png"))

        for candidate in candidates:
            if os.path.exists(candidate):
                return candidate

        return "multimedia-player"

    # ------------------------------------------------------------------
    # Hotkeys
    # ------------------------------------------------------------------
    def _register_hotkeys(self):
        combos = {}
        for name in HOTKEY_NAMES:
            value = self.hotkeys_cfg.get(name)
            if not value:
                continue
            try:
                combo = to_pynput_combo(value)
            except Exception as ex:
                print(
                    "Unable to register hotkey %s (%s): %s" % (name, value, ex),
                    file=sys.stderr,
                )
                continue

            if combo in combos:
                print(
                    "Hotkey %s (%s) conflicts with another hotkey using the "
                    "same combo; only the first one will be used." % (name, value),
                    file=sys.stderr,
                )
                continue

            def make_callback(hotkey_name):
                return lambda: GLib.idle_add(self._on_hotkey, hotkey_name)

            combos[combo] = make_callback(name)

        self.hotkey_listener = keyboard.GlobalHotKeys(combos)
        self.hotkey_listener.start()

    def _on_hotkey(self, name):
        self._reset_wait_timeout_if_active()
        try:
            if name == "PlayPause":
                self._run_js(self._api_call("playPause"))
            elif name == "Next":
                self._run_js(self._api_call("forward"))
            elif name == "Previous":
                self._run_js(self._api_call("rewind"))
            elif name == "Stop":
                self._run_js(self._api_call("stop"))
            elif name == "VolumeUp":
                self._run_js(self._api_call("volumeUp"))
            elif name == "VolumeDown":
                self._run_js(self._api_call("volumeDown"))
            elif name == "Refresh":
                self.reload()
            elif name == "Show":
                self.show_form(False)
        except Exception as ex:
            print("Unable to apply hotkey %s: %s" % (name, ex), file=sys.stderr)
        return False  # one-shot GLib idle callback

    def _api_call(self, action):
        if self.api_version == "2":
            return "API.%s()" % action
        legacy_name = LEGACY_API_FUNCTIONS.get(action)
        if legacy_name is None:
            raise ValueError("No legacy API mapping for action %r" % action)
        return "%s()" % legacy_name

    def _run_js(self, script):
        if not self.is_loaded:
            return
        self.webview.run_javascript(script, None, None, None)

    # ------------------------------------------------------------------
    # Info polling (tray tooltip / title)
    # ------------------------------------------------------------------
    def _on_load_changed(self, webview, load_event):
        if load_event == WebKit2.LoadEvent.STARTED:
            self.is_loaded = False
        elif load_event == WebKit2.LoadEvent.FINISHED:
            self.is_loaded = True

    def _on_update_info_tick(self):
        if not self.is_loaded:
            return True

        script = "API.getInfo()" if self.api_version == "2" else "playerGetInfo()"
        try:
            self.webview.run_javascript(script, None, self._on_info_ready, None)
        except Exception as ex:
            print("Unable to update tray text: %s" % ex, file=sys.stderr)
        return True

    def _on_info_ready(self, webview, result, user_data):
        try:
            js_result = webview.run_javascript_finish(result)
            js_value = js_result.get_js_value()
            info = js_value.to_string() if js_value else ""
        except Exception as ex:
            print("Unable to update tray text: %s" % ex, file=sys.stderr)
            return
        self._apply_info(info or "")

    def _apply_info(self, info):
        if len(info) >= 64:
            info = info[:60] + "..."

        if info != self.last_info:
            was_empty = not self.last_info
            self.last_info = info
            self.indicator.set_title(info)

            if self.popup_on_change:
                if self.anim_state == "idle" and not was_empty:
                    self.show_form(False)
                else:
                    self.wait_timeout = self.wait_ticks  # reset wait timeout

    # ------------------------------------------------------------------
    # Show / hide / animation, mirrors MainForm's fade in/out behavior
    # ------------------------------------------------------------------
    def _reset_wait_timeout_if_active(self):
        if self.anim_state != "idle":
            self.wait_timeout = self.wait_ticks

    def show_form(self, auto_hide):
        self.do_not_auto_hide = auto_hide

        screen = Gdk.Screen.get_default()
        if screen is not None:
            x = max(0, screen.get_width() - self.form_width)
            y = max(0, screen.get_height() - self.form_height)
            self.window.move(x, y)

        self.window.resize(self.form_width, self.form_height)
        self.window.set_opacity(0)
        self.window.show_all()

        self.anim_state = "fade_in"
        self.wait_timeout = self.wait_ticks

    def reload(self):
        self.webview.reload_bypass_cache()

    def _on_anim_tick(self):
        if self.anim_state == "fade_out":
            opacity = self.window.get_opacity() - self.FADE_STEP
            if opacity <= 0:
                self.window.set_opacity(0)
                self.window.hide()
                self.anim_state = "idle"
            else:
                self.window.set_opacity(opacity)
        elif self.anim_state == "wait":
            if self.do_not_auto_hide:
                if not self.window.is_active():
                    self.anim_state = "fade_out"
            else:
                if self.wait_timeout < 0:
                    self.anim_state = "fade_out"
                else:
                    self.wait_timeout -= 1
        elif self.anim_state == "fade_in":
            opacity = self.window.get_opacity() + self.FADE_STEP
            if opacity >= 1:
                self.window.set_opacity(1)
                if self.do_not_auto_hide:
                    self.window.present()
                self.anim_state = "wait"
            else:
                self.window.set_opacity(opacity)
        return True

    def _on_window_close(self, *_args):
        # Clicking the window close button just hides it, like minimizing to
        # tray on Windows. Use the tray menu's "Exit" to actually quit.
        self.window.hide()
        self.anim_state = "idle"
        return True  # stop the default handler from destroying the window

    def quit(self):
        if self.hotkey_listener is not None:
            try:
                self.hotkey_listener.stop()
            except Exception:
                pass
        Gtk.main_quit()


def main():
    Gtk.Window.set_default_icon_name(APP_ID)
    PiMusicPlayerTray()
    Gtk.main()


if __name__ == "__main__":
    main()
