package com.mytvapp.videoplayer

import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class VideoPlayerManager : SimpleViewManager<VideoPlayerView>() {

    override fun getName(): String = "VideoPlayerView"

    override fun createViewInstance(reactContext: ThemedReactContext): VideoPlayerView {
        return VideoPlayerView(reactContext)
    }

    @ReactProp(name = "sourceUrl")
    fun setSourceUrl(view: VideoPlayerView, url: String?) {
        view.setSourceUrl(url)
    }

    @ReactProp(name = "autoPlay", defaultBoolean = true)
    fun setAutoPlay(view: VideoPlayerView, value: Boolean) {
        view.setAutoPlay(value)
    }

    @ReactProp(name = "muted", defaultBoolean = false)
    fun setMuted(view: VideoPlayerView, value: Boolean) {
        view.setMuted(value)
    }

    @ReactProp(name = "paused", defaultBoolean = false)
    fun setPaused(view: VideoPlayerView, value: Boolean) {
        view.setPaused(value)
    }

    @ReactProp(name = "index", defaultInt = 0)
    fun setIndex(view: VideoPlayerView, index: Int) {
        view.setIndex(index)
    }

    override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any> {
        return mutableMapOf(
            "onStateChange" to mutableMapOf("registrationName" to "onStateChange"),
            "onProgress" to mutableMapOf("registrationName" to "onProgress")
        )
    }
}
