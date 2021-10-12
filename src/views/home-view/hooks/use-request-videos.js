import isEqual from "lodash/isEqual";
import { useCallback, useEffect, useState } from "react";
import { cachedVideos } from "../../../async-storage";
import { requestVideos } from "../../../external-requests/request-videos";
import { useIsAppStateActive } from "../../../use-app-state";

export const VIDEO_CACHE_LIFE_TIME = 1000 * 60 * 10;

export const useRequestVideos = () => {
  const isAppActive = useIsAppStateActive();
  const [videos, setVideos] = useState(null);

  const updateVideosIfRequired = useCallback(async (currentVideos) => {
    const updatedVideos = await requestVideos();
    if (isEqual(currentVideos, updatedVideos)) return;
    setVideos(updatedVideos);
    await cachedVideos.save(updatedVideos);
  }, []);

  useEffect(() => {
    // Use cached videos on initial load
    cachedVideos.load().then(async (loadedVideos) => {
      setVideos(loadedVideos || null);
      // Once cache has set videos make a request to see if there are changes to the videos
      await updateVideosIfRequired(loadedVideos);
    });
  }, []);

  useEffect(() => {
    if (isAppActive) {
      // Make more calls to check it there are new videos on every interval
      const interval = setIncrementalInterval(
        async () => updateVideosIfRequired(videos),
        VIDEO_CACHE_LIFE_TIME
      );
      return () => clearInterval(interval);
    }
  }, [videos, isAppActive]);

  return videos;
};

const setIncrementalInterval = (callback, interval) => {
  // Timer is divided by the increment to work around issues with long running timers
  const increment = 10;
  let eventCount = 1;
  return setInterval(async () => {
    eventCount++;
    if (eventCount % increment !== 0) return;
    eventCount = 1;
    await callback();
  }, interval / increment);
};
