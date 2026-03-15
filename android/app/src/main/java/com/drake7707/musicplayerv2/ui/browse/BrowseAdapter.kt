package com.drake7707.musicplayerv2.ui.browse

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.drake7707.musicplayerv2.R
import com.drake7707.musicplayerv2.data.api.RetrofitClient
import com.drake7707.musicplayerv2.data.api.models.AlbumOrTrackItem
import com.drake7707.musicplayerv2.databinding.ItemBrowseBinding

class BrowseAdapter(
    private val onItemClick: (AlbumOrTrackItem) -> Unit,
    private val onPlayNow: (AlbumOrTrackItem) -> Unit,
    private val onPlayNext: (AlbumOrTrackItem) -> Unit,
    private val onAddToPlaylist: (AlbumOrTrackItem) -> Unit,
    private val onShowDetails: (AlbumOrTrackItem) -> Unit
) : ListAdapter<AlbumOrTrackItem, BrowseAdapter.ViewHolder>(DiffCallback) {

    companion object DiffCallback : DiffUtil.ItemCallback<AlbumOrTrackItem>() {
        override fun areItemsTheSame(oldItem: AlbumOrTrackItem, newItem: AlbumOrTrackItem): Boolean {
            return oldItem.id == newItem.id && oldItem.isTrack == newItem.isTrack
        }

        override fun areContentsTheSame(oldItem: AlbumOrTrackItem, newItem: AlbumOrTrackItem): Boolean {
            return oldItem == newItem
        }
    }

    inner class ViewHolder(private val binding: ItemBrowseBinding) : RecyclerView.ViewHolder(binding.root) {

        fun bind(item: AlbumOrTrackItem) {
            binding.tvName.text = item.name
            binding.tvArtists.text = item.artists ?: ""
            binding.ivTypeIcon.setImageResource(
                if (item.isTrack) R.drawable.ic_music_note else R.drawable.ic_album
            )

            val artUrl = if (!item.artImage.isNullOrEmpty()) {
                if (item.artImage.startsWith("http")) item.artImage
                else RetrofitClient.getBaseUrl().trimEnd('/') + item.artImage
            } else null

            if (artUrl != null) {
                Glide.with(binding.root.context)
                    .load(artUrl)
                    .placeholder(R.drawable.ic_album)
                    .error(R.drawable.ic_album)
                    .into(binding.ivArt)
            } else {
                binding.ivArt.setImageResource(R.drawable.ic_album)
            }

            binding.root.setOnClickListener { onItemClick(item) }

            binding.btnPlayNow.setOnClickListener { onPlayNow(item) }
            binding.btnPlayNext.setOnClickListener { onPlayNext(item) }
            binding.btnAddToPlaylist.setOnClickListener { onAddToPlaylist(item) }
            binding.btnDetails.setOnClickListener { onShowDetails(item) }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemBrowseBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(getItem(position))
    }
}
