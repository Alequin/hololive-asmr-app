import { useEffect, useMemo, useState } from "react";
import orderBy from "lodash/orderBy";
import { requestVideos } from "../../external-requests/request-videos";

export const useRequestVideos = () => {
  const [isLoading, setIsLoading] = useState([]);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    requestVideos().then((videos) => {
      setIsLoading(false);
      setVideos(videos);
    });
  });

  return {
    videos: useMemo(
      () => orderBy(videos, "published_at", "desc"),
      [videos, videos.length]
    ),
    isLoading,
  };
};
