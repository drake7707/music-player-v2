using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MusicPlayerV2.Shared;
using MusicPlayerV2.Domain;

namespace MusicPlayerV2
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc();

            services.AddOptions();
            services.Configure<PlayerSettings>(Configuration.GetSection("Settings"));
            var settings = Configuration.GetSection("Settings").Get<PlayerSettings>();

            
            // configure to use sqlite
            Dapper.SimpleCRUD.SetDialect(Dapper.SimpleCRUD.Dialect.SQLite);

            // make sure databases exist
            EnsureDatabasesExist(settings);

            // scan for files
            MusicScanner.Scan(settings, false);

            // setup last fm manager
            LastFMManager lastFMManager = new LastFMManager(settings);
            services.AddSingleton<LastFMManager>(lastFMManager);

            // load default playlist
            using (DAL.DALManager mgr = new DAL.DALManager(settings.DatabasePath))
            {
                var tracks = mgr.GetTrackItems(Domain.Objects.Playlist.ALL_ID);
                Player.Instance.LoadPlaylist(new Player.Playlist()
                {
                    Id = Domain.Objects.Playlist.ALL_ID,
                    Tracks = tracks
                });
            }
            
        }

        private static void EnsureDatabasesExist(PlayerSettings settings)
        {
            if (!System.IO.File.Exists(settings.DatabasePath))
                DAL.DALInitializer.InitializeMainDatabase(settings.DatabasePath);

            if (!System.IO.File.Exists(settings.CoverDatabasePath))
                DAL.DALInitializer.InitializeCoverDatabase(settings.CoverDatabasePath);
        }



        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseDefaultFiles();
            app.UseStaticFiles();

            app.UseMvc();
        }
    }
}
