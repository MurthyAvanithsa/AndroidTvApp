package com.mytvapp.videoplayer

import android.content.Context
import android.util.Log
import androidx.media3.common.MediaItem
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.source.DefaultMediaSourceFactory
import androidx.media3.exoplayer.source.MediaSource
import androidx.media3.exoplayer.source.preload.DefaultPreloadManager
import androidx.media3.exoplayer.source.preload.TargetPreloadStatusControl
import kotlin.math.abs

// @OptIn(UnstableApi::class)
object PreloadManager {

    private var preloadManager: DefaultPreloadManager? = null
    private var currentIndex: Int = 0

    fun get(context: Context): DefaultPreloadManager {
        if (preloadManager == null) {
            preloadManager =
                DefaultPreloadManager.Builder(
                    context.applicationContext,
                    FeedPreloadStatusControl()
                )
                    .setMediaSourceFactory(
                        DefaultMediaSourceFactory(
                            VideoCache.buildCacheDataSourceFactory(context)
                        )
                    )
                    .build()
        }
        return preloadManager!!
    }

    fun preload(context: Context, url: String, index: Int) {
        val mediaItem = MediaItem.fromUri(url)
        Log.d("PreloadManager", "preload: $mediaItem at index $index")
        get(context).add(mediaItem, index)
    }

    fun getMediaSource(
        context: Context,
        mediaItem: MediaItem
    ): MediaSource? {
        val src = preloadManager?.getMediaSource(mediaItem)
        Log.d("PreloadManager", "getMediaSource: mediaItem=$mediaItem found=${src != null}")
        return src
    }

    fun setCurrentPlayingIndex(index: Int) {
        currentIndex = index
        Log.d("PreloadManager", "currentIndex: $currentIndex ")
        preloadManager?.setCurrentPlayingIndex(index)
        preloadManager?.invalidate()
        
    }

    fun remove(mediaItem: MediaItem) {
        Log.d("PreloadManager", "remove: $mediaItem")
        preloadManager?.remove(mediaItem)
    }

    fun release() {
        Log.d("PreloadManager", "release called")
        preloadManager?.release()
        preloadManager = null
    }

    // 🔥 Feed-style preload priority
    private class FeedPreloadStatusControl :
        TargetPreloadStatusControl<Int, DefaultPreloadManager.PreloadStatus> {

        override fun getTargetPreloadStatus(index: Int)
            : DefaultPreloadManager.PreloadStatus {

            val distance = abs(index - currentIndex)

            return when {
                distance == 1 ->
                    DefaultPreloadManager.PreloadStatus
                        .specifiedRangeLoaded(20000L) // ~20s buffer for immediate next

                distance == 2 ->
                    DefaultPreloadManager.PreloadStatus
                        .specifiedRangeLoaded(8000L) // ~8s for second next

                distance <= 4 ->
                    DefaultPreloadManager.PreloadStatus
                        .PRELOAD_STATUS_TRACKS_SELECTED

                else ->
                    DefaultPreloadManager.PreloadStatus
                        .PRELOAD_STATUS_NOT_PRELOADED
            }
        }
    }
}