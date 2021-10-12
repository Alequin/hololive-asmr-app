import { useEffect, useState } from "react";
import { cachedVideos } from "../../../async-storage";
import { requestVideos } from "../../../external-requests/request-videos";

export const VIDEO_CACHE_LIFE_TIME = 1000 * 60 * 10;

export const useRequestVideos = () => {
  const [videos, setVideos] = useState(null);
  const [hasCacheTimedOut, setHasCacheTimedOut] = useState(null);

  useEffect(() => {
    cachedVideos.load().then(async (cache) => {
      setVideos(cache?.videos || null);
      setHasCacheTimedOut(Boolean(cache?.timeout && cache.timeout <= Date.now()));
    });
  }, []);

  useEffect(() => {
    if (hasCacheTimedOut !== null && (!videos || hasCacheTimedOut)) {
      requestVideos().then(async (requestedVideos) => {
        setVideos(requestedVideos);
        await cachedVideos.save({
          videos: requestedVideos,
          timeout: Date.now() + VIDEO_CACHE_LIFE_TIME,
        });
        setHasCacheTimedOut(false);
      });
    }
  }, [videos, hasCacheTimedOut]);

  return videos;
};
