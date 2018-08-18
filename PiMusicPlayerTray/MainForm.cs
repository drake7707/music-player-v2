using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Configuration;
using System.Data;
using System.Diagnostics;
using System.Drawing;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace PiMusicPlayerTray
{
    public partial class MainForm : Form
    {

        private int WAIT_TICKS = 50;

        public const int HOTKEY_START_ID = 7707;

        private bool doPopupOnChange = false;

        public enum HotkeyTypeEnum
        {
            PlayPause = 1,
            Stop,
            Next,
            VolumeUp,
            VolumeDown,
            Refresh,
            Previous,
            Show,
        }

        private HotkeyManager hotkeyManager;

        public MainForm()
        {
            InitializeComponent();

            notifyIcon.Icon = new System.Drawing.Icon(this.Icon, SystemInformation.SmallIconSize);

            browser.Navigate(ConfigurationManager.AppSettings["PlayerUrl"]);

            hotkeyManager = new HotkeyManager();
            hotkeyManager.HotkeyPressed += hotkeyManager_HotkeyPressed;

            doPopupOnChange = ConfigurationManager.AppSettings["PopupChange"] == "true";

            int waitTicks;
            if (int.TryParse(ConfigurationManager.AppSettings["WaitTicksOnAutoPopup"], out waitTicks))
                WAIT_TICKS = waitTicks;
        }


        protected override void OnLoad(EventArgs e)
        {
            base.OnLoad(e);

        }
        private void Reload()
        {

            browser.Refresh(WebBrowserRefreshOption.Completely);
        }


        void hotkeyManager_HotkeyPressed(MainForm.HotkeyTypeEnum e)
        {
            if (browser.ReadyState == WebBrowserReadyState.Complete)
            {
                try
                {
                    if (currentAnimState != AnimStateEnum.Idle)
                        waitTimeout = WAIT_TICKS;

                    if (ConfigurationManager.AppSettings["Version"] == "2")
                    {
                        object result;
                        if (e == HotkeyTypeEnum.PlayPause)
                            result = this.browser.Document.InvokeScript("eval", new object[] { "API.playPause()" });
                        else if (e == HotkeyTypeEnum.Next)
                            result = this.browser.Document.InvokeScript("eval", new object[] { "API.forward()" });
                        else if (e == HotkeyTypeEnum.Previous)
                            result = this.browser.Document.InvokeScript("eval", new object[] { "API.rewind()" });
                        else if (e == HotkeyTypeEnum.Stop)
                            result = this.browser.Document.InvokeScript("eval", new object[] { "API.stop()" });
                        else if (e == HotkeyTypeEnum.VolumeUp)
                            result = this.browser.Document.InvokeScript("eval", new object[] { "API.volumeUp()" });
                        else if (e == HotkeyTypeEnum.VolumeDown)
                            result = this.browser.Document.InvokeScript("eval", new object[] { "API.volumeDown()" });
                        else if (e == HotkeyTypeEnum.Refresh)
                            Reload();
                        else if (e == HotkeyTypeEnum.Show)
                        {
                            ShowForm(false);
                        }

                    }
                    else
                    {
                        if (e == HotkeyTypeEnum.PlayPause)
                            this.browser.Document.InvokeScript("playerTogglePlay");
                        else if (e == HotkeyTypeEnum.Next)
                            this.browser.Document.InvokeScript("playerNext");
                        else if (e == HotkeyTypeEnum.Previous)
                            this.browser.Document.InvokeScript("playerPrevious");
                        else if (e == HotkeyTypeEnum.Stop)
                            this.browser.Document.InvokeScript("playerStop");
                        else if (e == HotkeyTypeEnum.VolumeUp)
                            this.browser.Document.InvokeScript("playerVolumeUp");
                        else if (e == HotkeyTypeEnum.VolumeDown)
                            this.browser.Document.InvokeScript("playerVolumeDown");
                        else if (e == HotkeyTypeEnum.Refresh)
                            Reload();
                        else if (e == HotkeyTypeEnum.Show)
                        {
                            ShowForm(false);
                        }

                    }

                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine("Unable to apply hotkey:" + ex.GetType().FullName + " - " + ex.Message);
                    // silently ignore
                }
            }

        }


        [DllImport("user32.dll")]
        static extern IntPtr GetActiveWindow();
        [DllImport("user32.dll")]
        private static extern IntPtr GetForegroundWindow();

        private bool isBrowserLoadedForTheFirstTime;

        private void tmrUpdateInfo_Tick(object sender, EventArgs e)
        {
            if (browser.ReadyState == WebBrowserReadyState.Complete)
            {
                if (!isBrowserLoadedForTheFirstTime)
                {

                    Timer tmrVolumeDefaultSet = new Timer();
                    tmrVolumeDefaultSet.Tick += (s, ev) =>
                    {
                        tmrVolumeDefaultSet.Stop();
                        try
                        {

                            float vol = (float)Properties.Settings.Default.Volume;
                            if (vol == 0)
                                vol = 10;
                            VolumeMixer.SetApplicationVolume(Process.GetCurrentProcess().Id, vol);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine("Unable to restore application volume: " + ex.GetType().FullName + " - " + ex.Message);
                        }
                    };
                    tmrVolumeDefaultSet.Interval = 10000;
                    tmrVolumeDefaultSet.Start();
                    isBrowserLoadedForTheFirstTime = true;
                }

                try
                {

                    string info;
                    if (ConfigurationManager.AppSettings["Version"] == "2")
                        info = this.browser.Document.InvokeScript("eval", new object[] { "API.getInfo()" }) + "";
                    else
                        info = this.browser.Document.InvokeScript("playerGetInfo") + "";

                    if (info.Length >= 64)
                        info = info.Substring(0, 60) + "...";

                    if (notifyIcon.BalloonTipText != info)
                    {
                        bool wasEmpty = string.IsNullOrEmpty(notifyIcon.BalloonTipText);
                        notifyIcon.BalloonTipText = info;

                        if (doPopupOnChange)
                        {
                            if (currentAnimState == AnimStateEnum.Idle && !wasEmpty)
                                ShowForm(false);
                            else
                                waitTimeout = WAIT_TICKS; // reset wait timeout
                        }
                    }
                    if (notifyIcon.Text != info)
                        notifyIcon.Text = info;
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine("Unable to update tray text:" + ex.GetType().FullName + " - " + ex.Message);
                    // silently ignore
                }
            }



        }

        protected override void OnFormClosed(FormClosedEventArgs e)
        {
            try
            {

                var vol = VolumeMixer.GetApplicationVolume(Process.GetCurrentProcess().Id);
                if (vol.HasValue)
                {
                    Properties.Settings.Default["Volume"] = vol.Value;
                    Properties.Settings.Default.Save();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Unable to store the volume settings: " + ex.GetType().FullName + " - " + ex.Message);
            }
            base.OnFormClosed(e);
        }

        protected override void OnResize(EventArgs e)
        {
            base.OnResize(e);

            //if (this.WindowState == FormWindowState.Minimized)
            //    ShowInTaskbar = false;
            //else
            //    ShowInTaskbar = true;
        }
        protected override void OnResizeEnd(EventArgs e)
        {
            base.OnResizeEnd(e);


        }


        //This class is not required but makes managing the modifiers easier.
        public static class Constants
        {
            public const int NOMOD = 0x0000;
            public const int ALT = 0x0001;
            public const int CTRL = 0x0002;
            public const int SHIFT = 0x0004;
            public const int WIN = 0x0008;

            public const int WM_HOTKEY_MSG_ID = 0x0312;
        }
        public sealed class HotkeyManager : NativeWindow, IDisposable
        {

            [DllImport("user32.dll")]
            private static extern bool RegisterHotKey(IntPtr hWnd, int id, int fsModifiers, int vlc);
            [DllImport("user32.dll")]
            private static extern bool UnregisterHotKey(IntPtr hWnd, int id);


            public HotkeyManager()
            {
                CreateHandle(new CreateParams());
                RegisterHotkeys();
            }

            private void RegisterHotkeys()
            {
                foreach (HotkeyTypeEnum e in Enum.GetValues(typeof(HotkeyTypeEnum)))
                    RegisterHotkey(e);
            }

            public delegate void HotkeyPressedHandler(HotkeyTypeEnum e);
            public event HotkeyPressedHandler HotkeyPressed;

            public void RegisterHotkey(HotkeyTypeEnum e)
            {


                string value = ConfigurationManager.AppSettings["Hotkey" + e.ToString()];
                if (!string.IsNullOrEmpty(value))
                {
                    string[] parts = value.Split('+');

                    int fsModifiers = 0;
                    int key = 0;

                    foreach (var p in parts)
                    {
                        if (p.ToLower() == "ctrl")
                            fsModifiers += Constants.CTRL;
                        else if (p.ToLower() == "shift")
                            fsModifiers += Constants.SHIFT;
                        else if (p.ToLower() == "alt")
                            fsModifiers += Constants.ALT;
                        else if (p.ToLower() == "win")
                            fsModifiers += Constants.WIN;
                        else
                        {
                            var keyValue = Enum.GetValues(typeof(Keys)).Cast<Keys>().Where(k => k.ToString().ToLower() == p.ToLower()).FirstOrDefault();
                            key = (int)keyValue;
                        }
                    }
                    if (key != 0)
                        RegisterHotKey(this.Handle, HOTKEY_START_ID + (int)e, fsModifiers, key);
                }
            }

            protected override void WndProc(ref Message m)
            {
                if (m.Msg == Constants.WM_HOTKEY_MSG_ID)
                {
                    foreach (HotkeyTypeEnum e in Enum.GetValues(typeof(HotkeyTypeEnum)))
                    {
                        if (m.WParam.ToInt32() == HOTKEY_START_ID + (int)e)
                        {
                            HotkeyPressedHandler temp = HotkeyPressed;
                            if (temp != null)
                                temp(e);
                        }
                    }
                }
                base.WndProc(ref m);
            }

            public void Dispose()
            {
                UnregisterHotkeys();

                DestroyHandle();
            }

            private void UnregisterHotkeys()
            {
                foreach (HotkeyTypeEnum e in Enum.GetValues(typeof(HotkeyTypeEnum)))
                {
                    UnregisterHotKey(this.Handle, HOTKEY_START_ID + (int)e);
                }
            }
        }


        private void mnuShow_Click(object sender, EventArgs e)
        {
            ShowForm(true);
        }

        private void ShowForm(bool autoHide)
        {
            this.doNotAutoHide = autoHide;
            this.StartPosition = FormStartPosition.Manual;
            this.Location = new Point(Screen.PrimaryScreen.WorkingArea.Width - this.ClientSize.Width, Screen.PrimaryScreen.WorkingArea.Height - this.ClientSize.Height);
            this.WindowState = FormWindowState.Normal;

            this.Show();
            this.Opacity = 0;
            //this.ShowInTaskbar = true;
            //this.Activate();
            int w;
            if (!string.IsNullOrEmpty(ConfigurationManager.AppSettings["FormWidth"]) && int.TryParse(ConfigurationManager.AppSettings["FormWidth"], out w))
                this.Width = w;
            else
                this.Width = 400;

            int h;
            if (!string.IsNullOrEmpty(ConfigurationManager.AppSettings["FormHeight"]) && int.TryParse(ConfigurationManager.AppSettings["FormHeight"], out h))
                this.Height = h;
            else
                this.Height = 630;


            this.Focus();
            currentAnimState = AnimStateEnum.FadeIn;
            waitTimeout = WAIT_TICKS;
        }



        private void mnuExit_Click(object sender, EventArgs e)
        {
            this.Close();
        }

        private void mnuReload_Click(object sender, EventArgs e)
        {
            Reload();
        }

        private void notifyIcon_DoubleClick(object sender, EventArgs e)
        {
            mnuShow_Click(sender, EventArgs.Empty);
        }

        private void notifyIcon_Click(object sender, EventArgs e)
        {
            MouseButtons button;
            if (e is MouseEventArgs)
                button = ((MouseEventArgs)e).Button;
            else
                button = System.Windows.Forms.MouseButtons.Left;

            if (button == System.Windows.Forms.MouseButtons.Left)
            {
                this.BeginInvoke(new Action(() =>
                {
                    mnuShow_Click(sender, EventArgs.Empty);
                }));
            }

        }


        private enum AnimStateEnum
        {
            Idle,
            FadeIn,
            Wait,
            FadeOut,

        }
        private AnimStateEnum currentAnimState;
        private int waitTimeout;
        private bool doNotAutoHide;

        protected override bool ShowWithoutActivation
        {
            get { return true; }
        }

        protected override void OnActivated(EventArgs e)
        {
            base.OnActivated(e);
        }
        protected override void OnDeactivate(EventArgs e)
        {
            base.OnDeactivate(e);
        }

        private void tmrFormState_Tick(object sender, EventArgs e)
        {
            if (currentAnimState == AnimStateEnum.FadeOut)
            {
                if (this.Opacity - 0.1 < 0)
                {
                    this.Opacity = 0;
                    this.Hide();
                    currentAnimState = AnimStateEnum.Idle;
                }
                else
                    this.Opacity -= 0.1;
            }
            else if (currentAnimState == AnimStateEnum.Wait)
            {
                if (doNotAutoHide)
                {
                    if (GetForegroundWindow() != this.Handle)
                        currentAnimState = AnimStateEnum.FadeOut;

                }
                else
                {
                    if (waitTimeout < 0)
                    {
                        currentAnimState = AnimStateEnum.FadeOut;
                    }
                    else
                        waitTimeout--;
                }
            }
            else if (currentAnimState == AnimStateEnum.FadeIn)
            {
                if (this.Opacity + 0.1 > 1)
                {
                    this.Opacity = 1;
                    if (doNotAutoHide)
                        this.Activate();
                    else
                        this.Show();

                    if (doNotAutoHide)
                        currentAnimState = AnimStateEnum.Wait;
                    else
                    {
                        currentAnimState = AnimStateEnum.Wait;
                    }
                    //tmrFormState.Stop();
                    //this.BeginInvoke(new Action(() =>
                    //{
                    //    System.Threading.Thread.Sleep(100);
                    //    tmrFormState.Start();
                    //}));
                }
                else
                    this.Opacity += 0.1;
            }
        }

        private void browser_DocumentCompleted(object sender, WebBrowserDocumentCompletedEventArgs e)
        {
            //browser.Document.InvokeScript("eval", new object[] { "window.scrollTo(0,60)" });
            if (this.browser.Document != null)
                this.browser.Document.Click += Document_Click;
        }

        private void Document_Click(object sender, HtmlElementEventArgs e)
        {
            if (currentAnimState != AnimStateEnum.Idle)
                waitTimeout = WAIT_TICKS;
        }

    }
}