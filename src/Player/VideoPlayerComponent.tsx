import { requireNativeComponent, ViewProps, HostComponent } from 'react-native';

interface VideoPlayerProps extends ViewProps {
  sourceUrl?: string;
  autoPlay?: boolean;
  muted?: boolean;
  paused?: boolean;
  index?: number;
  onStateChange?: (event: any) => void;
  onProgress?: (event: any) => void;
}

// We name the constant something unique and export it
const VideoPlayerNative = requireNativeComponent<VideoPlayerProps>(
  'VideoPlayerView',
) as HostComponent<VideoPlayerProps>;

export default VideoPlayerNative;
