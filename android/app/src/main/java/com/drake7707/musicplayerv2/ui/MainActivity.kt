package com.drake7707.musicplayerv2.ui

import android.os.Bundle
import android.view.MenuItem
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.NavController
import androidx.navigation.fragment.NavHostFragment
import androidx.navigation.ui.AppBarConfiguration
import androidx.navigation.ui.setupActionBarWithNavController
import com.drake7707.musicplayerv2.R
import com.drake7707.musicplayerv2.data.api.RetrofitClient
import com.drake7707.musicplayerv2.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {

    val sharedViewModel: SharedPlayerViewModel by viewModels()
    private lateinit var binding: ActivityMainBinding
    private lateinit var navController: NavController

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        setSupportActionBar(binding.toolbar)

        // Load server URL from preferences
        RetrofitClient.loadFromPreferences(this)

        val navHostFragment = supportFragmentManager.findFragmentById(R.id.nav_host_fragment) as NavHostFragment
        navController = navHostFragment.navController

        val appBarConfiguration = AppBarConfiguration(setOf(R.id.playerFragment))
        setupActionBarWithNavController(navController, appBarConfiguration)

        // Observe errors
        sharedViewModel.errorMessage.observe(this) { msg ->
            if (!msg.isNullOrEmpty()) {
                Toast.makeText(this, msg, Toast.LENGTH_LONG).show()
                sharedViewModel.clearError()
            }
        }

        // Bind to playback service
        sharedViewModel.bindService(this)
    }

    override fun onDestroy() {
        sharedViewModel.unbindService(this)
        super.onDestroy()
    }

    override fun onSupportNavigateUp(): Boolean {
        return navController.navigateUp() || super.onSupportNavigateUp()
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            android.R.id.home -> {
                navController.navigateUp()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }
}
