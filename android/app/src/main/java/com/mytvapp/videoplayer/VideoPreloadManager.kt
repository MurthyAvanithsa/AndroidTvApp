package com.mytvapp.videoplayer

import android.content.Context
import android.net.Uri
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.common.Player
import com.mytvapp.videoplayer.VideoCache

object VideoPreloadManager {
  @Volatile private var player: ExoPlayer? = null
  @Volatile private var currentUrl: String? = null

  private fun getPlayer(context: Context): ExoPlayer {
    val existing = player
    if (existing != null) return existing

    synchronized(this) {
      val again = player
      if (again != null) return again

      val created = ExoPlayer.Builder(context.applicationContext).build().apply {
        playWhenReady = false
        repeatMode = Player.REPEAT_MODE_OFF
        volume = 0f
      }
      player = created
      return created
    }
  }

  fun preload(context: Context, url: String) {
    if (url == currentUrl) return
    currentUrl = url

    val p = getPlayer(context)
    val source = VideoCache.buildProgressiveSource(context, Uri.parse(url))

    p.stop()
    p.clearMediaItems()
    p.setMediaSource(source)
    p.playWhenReady = false
    p.prepare() // ✅ buffers in background, no playback
  }

  fun cancel() {
    currentUrl = null
    player?.stop()
    player?.clearMediaItems()
  }
}