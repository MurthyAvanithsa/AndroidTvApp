package com.mytvapp.videoplayer

import android.content.Context
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.widget.FrameLayout
import androidx.media3.common.*
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.source.DefaultMediaSourceFactory
import androidx.media3.exoplayer.source.MediaSource
import androidx.media3.ui.PlayerView
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter

class VideoPlayerView(context: Context) : FrameLayout(context) {

    private var player: ExoPlayer? = null
    private val playerView: PlayerView = PlayerView(context)
    private val mainHandler = Handler(Looper.getMainLooper())

    private var sourceUrl: String? = null
    private var autoPlay = true
    private var muted = false
    private var paused = false
    private var index: Int = 0

    init {
        // Essential for TV: Hide default playback controls
        playerView.useController = true
        playerView.controllerShowTimeoutMs = 5000
        // Ensure the video scales to fill the container
        playerView.resizeMode = androidx.media3.ui.AspectRatioFrameLayout.RESIZE_MODE_ZOOM
        
        addView(
            playerView,
            LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
        )
        initPlayer()
    }

    private fun initPlayer() {
        if (player != null) return

        player = ExoPlayer.Builder(context)
            .setMediaSourceFactory(DefaultMediaSourceFactory(VideoCache.buildCacheDataSourceFactory(context)))
            .build()

        playerView.player = player

        player?.addListener(object : Player.Listener {
            override fun onPlaybackStateChanged(state: Int) {
                Log.d("VideoPlayerView", "State Changed: $state")
                when (state) {
                    Player.STATE_READY -> {
                        sendState("ready", null)
                        // Trigger play if we aren't paused
                        if (autoPlay && !paused) {
                            player?.play()
                            sendState("playing", null)
                            startProgress()
                        }
                    }
                    Player.STATE_BUFFERING -> sendState("buffering", null)
                    Player.STATE_ENDED -> {
                        sendState("ended", null)
                        stopProgress()
                    }
                }
            }

            override fun onPlayerError(error: PlaybackException) {
                Log.e("VideoPlayerView", "ExoPlayer Error: ${error.message}")
                sendState("error", error.message)
            }
        })
        applyMute()
    }

    private fun prepareIfNeeded() {
        val url = sourceUrl ?: return
        val p = player ?: return

        val uri = Uri.parse(url)
        val mediaItem = MediaItem.Builder()
            .setUri(uri)
            .setMimeType(if (url.endsWith(".m3u8")) MimeTypes.APPLICATION_M3U8 else MimeTypes.VIDEO_MP4)
            .build()

        // Check PreloadManager for cached source
        val preloadSource: MediaSource? = PreloadManager.getMediaSource(context, mediaItem)
        
        if (preloadSource != null) {
            p.setMediaSource(preloadSource)
        } else {
            p.setMediaItem(mediaItem)
        }

        p.prepare()
        // If autoplay is true, start as soon as ready
        p.playWhenReady = autoPlay && !paused
    }

    // React Props
    fun setSourceUrl(url: String?) {
        if (url != sourceUrl) {
            sourceUrl = url
            prepareIfNeeded()
        }
    }

    fun setAutoPlay(value: Boolean) {
        autoPlay = value
    }

    fun setMuted(value: Boolean) {
        muted = value
        applyMute()
    }

    fun setPaused(value: Boolean) {
        paused = value
        if (paused) {
            player?.pause()
            stopProgress()
        } else {
            player?.play()
            startProgress()
        }
    }

    fun setIndex(i: Int) {
        index = i
    }

    private fun applyMute() {
        player?.volume = if (muted) 0f else 1f
    }

    // Layout fix: Forces the PlayerView to take up the space RN allocates
    override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
        super.onLayout(changed, left, top, right, bottom)
        playerView.layout(0, 0, right - left, bottom - top)
    }

    // Clean up to prevent memory leaks and "Double Registration" errors
    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        stopProgress()
        player?.release()
        player = null
    }

    // Event Emitters
    private fun sendState(state: String, message: String?) {
        val reactContext = context as? ReactContext ?: return
        val event = Arguments.createMap().apply {
            putString("state", state)
            message?.let { putString("message", it) }
        }
        reactContext.getJSModule(RCTEventEmitter::class.java).receiveEvent(id, "onStateChange", event)
    }

    private val progressRunnable = object : Runnable {
        override fun run() {
            player?.let {
                sendProgress(it.currentPosition / 1000.0, it.duration / 1000.0)
            }
            mainHandler.postDelayed(this, 1000)
        }
    }

    private fun sendProgress(current: Double, duration: Double) {
        val reactContext = context as? ReactContext ?: return
        val event = Arguments.createMap().apply {
            putDouble("currentTime", current)
            putDouble("duration", if (duration > 0) duration else 0.0)
        }
        reactContext.getJSModule(RCTEventEmitter::class.java).receiveEvent(id, "onProgress", event)
    }

    private fun startProgress() {
        mainHandler.removeCallbacks(progressRunnable)
        mainHandler.post(progressRunnable)
    }

    private fun stopProgress() = mainHandler.removeCallbacks(progressRunnable)
}