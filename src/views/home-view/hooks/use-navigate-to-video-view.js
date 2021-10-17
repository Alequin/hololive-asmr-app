import { useNavigation } from "@react-navigation/core";
import { useCallback } from "react";

export const useNavigateToVideoView = () => {
  const nav = useNavigation();

  return useCallback(
    (video) =>
      nav.navigate("videoView", {
        videoId: video.video_id,
        videoTitle: video.video_title,
        channelTitle: video.channel_title,
        channelId: video.channel_id,
        channelThumbnailUrl: video.channel_thumbnail_url,
      }),
    []
  );
};
