package com.drake7707.musicplayerv2.ui.browse

import android.view.LayoutInflater
import android.view.ViewGroup
import android.widget.PopupMenu
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
            binding.tvName.text = if (!item.isTrack && item.name.isBlank())
                binding.root.context.getString(R.string.untitled_album)
            else
                item.name
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

            binding.btnOverflow.setOnClickListener { anchor ->
                val popup = PopupMenu(anchor.context, anchor)
                popup.menuInflater.inflate(R.menu.menu_browse_item, popup.menu)
                // Hide "Details" for album items (details only makes sense for tracks)
                popup.menu.findItem(R.id.action_details)?.isVisible = item.isTrack
                popup.setOnMenuItemClickListener { menuItem ->
                    when (menuItem.itemId) {
                        R.id.action_play_now -> { onPlayNow(item); true }
                        R.id.action_add_to_playlist -> { onAddToPlaylist(item); true }
                        R.id.action_details -> { onShowDetails(item); true }
                        else -> false
                    }
                }
                popup.show()
            }
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
