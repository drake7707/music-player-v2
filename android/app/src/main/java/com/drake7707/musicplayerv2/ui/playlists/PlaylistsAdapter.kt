package com.drake7707.musicplayerv2.ui.playlists

import android.view.LayoutInflater
import android.view.ViewGroup
import android.widget.PopupMenu
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.drake7707.musicplayerv2.R
import com.drake7707.musicplayerv2.data.api.models.Playlist
import com.drake7707.musicplayerv2.databinding.ItemPlaylistBinding

class PlaylistsAdapter(
    private val onItemClick: (Playlist) -> Unit,
    private val onOverflowClick: (Playlist, android.view.View) -> Unit = { _, _ -> }
) : ListAdapter<Playlist, PlaylistsAdapter.ViewHolder>(DiffCallback) {

    companion object DiffCallback : DiffUtil.ItemCallback<Playlist>() {
        override fun areItemsTheSame(old: Playlist, new: Playlist) = old.id == new.id
        override fun areContentsTheSame(old: Playlist, new: Playlist) = old == new
    }

    inner class ViewHolder(private val binding: ItemPlaylistBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(playlist: Playlist) {
            binding.tvPlaylistName.text = playlist.name
            binding.tvTrackCount.text = "${playlist.nrOfTracks} tracks"
            binding.ivCurrentIndicator.visibility = if (playlist.isCurrent) android.view.View.VISIBLE else android.view.View.GONE
            binding.root.setOnClickListener { onItemClick(playlist) }
            binding.btnOverflow.setOnClickListener { onOverflowClick(playlist, it) }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemPlaylistBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(getItem(position))
    }
}
