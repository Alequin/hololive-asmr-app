import { useEffect, useState } from "react";
import { cachedVideos } from "../../../async-storage";
import { requestVideos } from "../../../external-requests/request-videos";

export const VIDEO_CACHE_LIFE_TIME = 1000 * 60 * 60;

export const useRequestVideos = () => {
  const [videos, setVideos] = useState(null);

  useEffect(() => {
    cachedVideos.load().then(async (cache) => {
      const hasCacheTimedOut = cache?.timeout <= Date.now();
      const shouldUseCache = cache?.videos && !hasCacheTimedOut;
      if (shouldUseCache) return setVideos(cache?.videos);

      const requestedVideos = await requestVideos();
      setVideos(requestedVideos);
      await cachedVideos.save({
        videos: requestedVideos,
        timeout: Date.now() + VIDEO_CACHE_LIFE_TIME,
      });
    });
  }, []);

  return videos;
};
