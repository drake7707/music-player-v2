package com.drake7707.musicplayerv2.ui.settings

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.lifecycleScope
import com.drake7707.musicplayerv2.data.api.RetrofitClient
import com.drake7707.musicplayerv2.databinding.FragmentSettingsBinding
import com.drake7707.musicplayerv2.ui.SharedPlayerViewModel
import kotlinx.coroutines.launch

class SettingsFragment : Fragment() {

    private var _binding: FragmentSettingsBinding? = null
    private val binding get() = _binding!!
    private val sharedViewModel: SharedPlayerViewModel by activityViewModels()

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentSettingsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        activity?.title = "Settings"
        binding.etServerUrl.setText(RetrofitClient.getSavedUrl(requireContext()))

        binding.btnSave.setOnClickListener {
            val url = binding.etServerUrl.text.toString().trim()
            if (url.isEmpty()) {
                Toast.makeText(requireContext(), "Please enter a server URL", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            RetrofitClient.saveToPreferences(requireContext(), url)
            Toast.makeText(requireContext(), "Server URL saved", Toast.LENGTH_SHORT).show()
            // Reload player state from the new URL without requiring an app restart
            sharedViewModel.loadCurrentState()
        }

        binding.btnTestConnection.setOnClickListener {
            val url = binding.etServerUrl.text.toString().trim()
            if (url.isEmpty()) {
                Toast.makeText(requireContext(), "Please enter a URL to test", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            binding.btnTestConnection.isEnabled = false
            binding.btnTestConnection.text = "Testing..."

            RetrofitClient.configure(url)

            val repository = com.drake7707.musicplayerv2.data.MusicRepository(RetrofitClient.getApiService())
            lifecycleScope.launch {
                try {
                    repository.getCurrentPlayerState()
                    Toast.makeText(requireContext(), "✓ Connected successfully!", Toast.LENGTH_SHORT).show()
                } catch (e: Exception) {
                    Toast.makeText(requireContext(), "✗ Connection failed: ${e.message}", Toast.LENGTH_LONG).show()
                } finally {
                    binding.btnTestConnection.isEnabled = true
                    binding.btnTestConnection.text = "Test Connection"
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
