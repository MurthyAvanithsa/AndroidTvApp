package com.mytvapp.videoplayer

import android.content.Context
import android.net.Uri
import androidx.annotation.OptIn
import androidx.media3.common.MediaItem
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.source.MediaSource
import androidx.media3.exoplayer.source.DefaultMediaSourceFactory
import androidx.media3.datasource.DataSource
import androidx.media3.datasource.DefaultDataSource
import androidx.media3.datasource.cache.CacheDataSource
import androidx.media3.datasource.cache.LeastRecentlyUsedCacheEvictor
import androidx.media3.datasource.cache.SimpleCache
import androidx.media3.database.StandaloneDatabaseProvider
import android.util.Log
import java.io.File

@OptIn(UnstableApi::class)
object VideoCache {
  private const val MAX_CACHE_BYTES: Long = 200L * 1024L * 1024L // 200MB
  @Volatile private var cache: SimpleCache? = null

  fun getCache(context: Context): SimpleCache {
    val existing = cache
    if (existing != null) return existing

    synchronized(this) {
      val again = cache
      if (again != null) return again

      val evictor = LeastRecentlyUsedCacheEvictor(MAX_CACHE_BYTES)
      val dir = File(context.cacheDir, "exo_video_cache")
      val dbProvider = StandaloneDatabaseProvider(context)

      val created = SimpleCache(dir, evictor, dbProvider)
      cache = created
      return created
    }
  }

  fun buildCacheDataSourceFactory(context: Context): DataSource.Factory {
    val upstream = DefaultDataSource.Factory(context)
    // Log.d("VideoCache", "buildCacheDataSourceFactory: $upstream")
    Log.d("VideoCache", "buildCacheDataSourceFactory: ${getCache(context)}")
    return CacheDataSource.Factory()
      .setCache(getCache(context))
      .setUpstreamDataSourceFactory(upstream)
      .setFlags(CacheDataSource.FLAG_IGNORE_CACHE_ON_ERROR)
  }

  fun buildProgressiveSource(context: Context, uri: Uri): MediaSource {
    return DefaultMediaSourceFactory(buildCacheDataSourceFactory(context))
      .createMediaSource(MediaItem.fromUri(uri))
  }
}