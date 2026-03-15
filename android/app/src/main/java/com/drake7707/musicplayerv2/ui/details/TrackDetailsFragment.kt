package com.drake7707.musicplayerv2.ui.details

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import androidx.navigation.fragment.navArgs
import android.app.Application
import com.drake7707.musicplayerv2.R
import com.drake7707.musicplayerv2.data.MusicRepository
import com.drake7707.musicplayerv2.data.api.RetrofitClient
import com.drake7707.musicplayerv2.data.api.models.TrackDetails
import com.drake7707.musicplayerv2.databinding.FragmentTrackDetailsBinding
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class TrackDetailsViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = MusicRepository(RetrofitClient.getApiService())
    val details = MutableLiveData<TrackDetails?>()
    val isLoading = MutableLiveData(false)
    val error = MutableLiveData<String?>()

    fun loadDetails(trackId: String) {
        isLoading.value = true
        viewModelScope.launch {
            try {
                details.postValue(repository.getDetails(trackId))
            } catch (e: Exception) {
                error.postValue("Failed to load details: ${e.message}")
            } finally {
                isLoading.postValue(false)
            }
        }
    }
}

class TrackDetailsFragment : Fragment() {

    private var _binding: FragmentTrackDetailsBinding? = null
    private val binding get() = _binding!!
    private val viewModel: TrackDetailsViewModel by viewModels()
    private val args: TrackDetailsFragmentArgs by navArgs()

    private val dateFormat = SimpleDateFormat("dd MMM yyyy HH:mm", Locale.getDefault())
    private val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentTrackDetailsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        viewModel.details.observe(viewLifecycleOwner) { details ->
            if (details != null) updateUI(details)
        }

        viewModel.isLoading.observe(viewLifecycleOwner) { loading ->
            binding.progressBar.visibility = if (loading) View.VISIBLE else View.GONE
        }

        viewModel.error.observe(viewLifecycleOwner) { err ->
            if (!err.isNullOrEmpty()) {
                Toast.makeText(requireContext(), err, Toast.LENGTH_LONG).show()
            }
        }

        viewModel.loadDetails(args.trackId)
    }

    private fun updateUI(details: TrackDetails) {
        activity?.title = details.title
        binding.tvTitle.text = details.title
        binding.tvArtists.text = details.artists.joinToString(", ")
        binding.tvAlbum.text = "Album: ${details.album}"
        binding.tvTrackNr.text = "Track #${details.trackNr}"
        binding.tvGenres.text = if (details.genres.isNotEmpty())
            "Genres: ${details.genres.joinToString(", ")}" else ""
        binding.tvNrPlayed.text = "Played: ${details.nrPlayed} times (${details.nrPlayedToEnd} to end)"

        binding.tvAddedOn.text = details.addedOn?.let {
            "Added: ${formatDate(it)}"
        } ?: ""

        binding.tvLastPlayed.text = details.lastPlayed?.let {
            "Last played: ${formatDate(it)}"
        } ?: "Never played"

        // Scrobble history
        binding.scrobbleContainer.removeAllViews()
        if (details.lastScrobbles.isNotEmpty()) {
            binding.tvScrobbleTitle.visibility = View.VISIBLE
            details.lastScrobbles.take(20).forEach { scrobble ->
                val text = "${formatDate(scrobble.on)} ${if (scrobble.playedToEnd) "✓" else "○"}"
                val tv = TextView(requireContext()).apply {
                    this.text = text
                    setTextColor(ContextCompat.getColor(requireContext(),
                        if (scrobble.playedToEnd) R.color.scrobble_complete else R.color.scrobble_partial
                    ))
                    textSize = 13f
                    setPadding(0, 4, 0, 4)
                }
                binding.scrobbleContainer.addView(tv)
            }
        } else {
            binding.tvScrobbleTitle.visibility = View.GONE
        }
    }

    private fun formatDate(dateStr: String): String {
        return try {
            val date = inputFormat.parse(dateStr.substringBefore(".").trimEnd('Z'))
            date?.let { dateFormat.format(it) } ?: dateStr
        } catch (e: Exception) {
            dateStr
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
