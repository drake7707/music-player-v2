namespace PiMusicPlayerTray
{
    partial class MainForm
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;



        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }


            if (disposing && hotkeyManager != null)
                hotkeyManager.Dispose();

            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.components = new System.ComponentModel.Container();
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(MainForm));
            this.browser = new System.Windows.Forms.WebBrowser();
            this.notifyIcon = new System.Windows.Forms.NotifyIcon(this.components);
            this.mnuTray = new System.Windows.Forms.ContextMenuStrip(this.components);
            this.mnuShow = new System.Windows.Forms.ToolStripMenuItem();
            this.mnuReload = new System.Windows.Forms.ToolStripMenuItem();
            this.mnuExit = new System.Windows.Forms.ToolStripMenuItem();
            this.tmrUpdateInfo = new System.Windows.Forms.Timer(this.components);
            this.tmrFormState = new System.Windows.Forms.Timer(this.components);
            this.mnuTray.SuspendLayout();
            this.SuspendLayout();
            // 
            // browser
            // 
            this.browser.Dock = System.Windows.Forms.DockStyle.Fill;
            this.browser.Location = new System.Drawing.Point(0, 0);
            this.browser.MinimumSize = new System.Drawing.Size(20, 20);
            this.browser.Name = "browser";
            this.browser.ScrollBarsEnabled = false;
            this.browser.Size = new System.Drawing.Size(400, 640);
            this.browser.TabIndex = 0;
            this.browser.DocumentCompleted += new System.Windows.Forms.WebBrowserDocumentCompletedEventHandler(this.browser_DocumentCompleted);
            // 
            // notifyIcon
            // 
            this.notifyIcon.ContextMenuStrip = this.mnuTray;
            this.notifyIcon.Icon = ((System.Drawing.Icon)(resources.GetObject("notifyIcon.Icon")));
            this.notifyIcon.Visible = true;
            this.notifyIcon.Click += new System.EventHandler(this.notifyIcon_Click);
            this.notifyIcon.DoubleClick += new System.EventHandler(this.notifyIcon_DoubleClick);
            // 
            // mnuTray
            // 
            this.mnuTray.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.mnuShow,
            this.mnuReload,
            this.mnuExit});
            this.mnuTray.Name = "mnuTray";
            this.mnuTray.Size = new System.Drawing.Size(111, 70);
            // 
            // mnuShow
            // 
            this.mnuShow.Name = "mnuShow";
            this.mnuShow.Size = new System.Drawing.Size(110, 22);
            this.mnuShow.Text = "&Show";
            this.mnuShow.Click += new System.EventHandler(this.mnuShow_Click);
            // 
            // mnuReload
            // 
            this.mnuReload.Name = "mnuReload";
            this.mnuReload.Size = new System.Drawing.Size(110, 22);
            this.mnuReload.Text = "&Reload";
            this.mnuReload.Click += new System.EventHandler(this.mnuReload_Click);
            // 
            // mnuExit
            // 
            this.mnuExit.Name = "mnuExit";
            this.mnuExit.Size = new System.Drawing.Size(110, 22);
            this.mnuExit.Text = "&Exit";
            this.mnuExit.Click += new System.EventHandler(this.mnuExit_Click);
            // 
            // tmrUpdateInfo
            // 
            this.tmrUpdateInfo.Enabled = true;
            this.tmrUpdateInfo.Interval = 1000;
            this.tmrUpdateInfo.Tick += new System.EventHandler(this.tmrUpdateInfo_Tick);
            // 
            // tmrFormState
            // 
            this.tmrFormState.Enabled = true;
            this.tmrFormState.Interval = 25;
            this.tmrFormState.Tick += new System.EventHandler(this.tmrFormState_Tick);
            // 
            // MainForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(400, 640);
            this.Controls.Add(this.browser);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.None;
            this.Icon = ((System.Drawing.Icon)(resources.GetObject("$this.Icon")));
            this.Name = "MainForm";
            this.ShowInTaskbar = false;
            this.StartPosition = System.Windows.Forms.FormStartPosition.Manual;
            this.Text = "Pi Music player";
            this.TopMost = true;
            this.WindowState = System.Windows.Forms.FormWindowState.Minimized;
            this.mnuTray.ResumeLayout(false);
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.WebBrowser browser;
        private System.Windows.Forms.NotifyIcon notifyIcon;
        private System.Windows.Forms.Timer tmrUpdateInfo;
        private System.Windows.Forms.ContextMenuStrip mnuTray;
        private System.Windows.Forms.ToolStripMenuItem mnuShow;
        private System.Windows.Forms.ToolStripMenuItem mnuReload;
        private System.Windows.Forms.ToolStripMenuItem mnuExit;
        private System.Windows.Forms.Timer tmrFormState;
    }
}

