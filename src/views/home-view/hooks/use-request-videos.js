import isEqual from "lodash/isEqual";
import { useCallback, useEffect, useState } from "react";
import { cachedVideos } from "../../../async-storage";
import { requestVideos } from "../../../external-requests/request-videos";
import { useIsAppStateActive } from "../../../use-app-state";

export const VIDEO_CACHE_LIFE_TIME = 1000 * 60 * 10;

export const useRequestVideos = () => {
  const isAppActive = useIsAppStateActive();
  const [videos, setVideos] = useState(null);
  const [isRefreshingVideosFromAPI, setIsRefreshingVideosFromAPI] = useState(false);
  const [lastApiCallTime, setLastApiCallTime] = useState(Date.now());
  const [hasLoadedCache, setHasLoadedCache] = useState(false);
  const [cacheError, setCacheError] = useState(null);
  const [apiError, setApiError] = useState(null);

  const updateVideosIfRequired = useCallback(
    async (currentVideos) => {
      try {
        const updatedVideos = await requestVideos();
        setLastApiCallTime(Date.now());
        if (isEqual(currentVideos, updatedVideos)) return currentVideos;
        setVideos(updatedVideos);
        return updatedVideos;
      } catch (error) {
        setApiError(error);
      } finally {
        setIsRefreshingVideosFromAPI(false);
      }
    },
    [apiError]
  );

  useEffect(() => {
    // On mount request cached videos and make an api call to get most recent videos
    (async () => {
      let loadedVideos = null;
      try {
        // Use cached videos on initial load
        loadedVideos = await cachedVideos.load();
        setVideos(loadedVideos || null);
      } catch (error) {
        setCacheError(error);
      } finally {
        setHasLoadedCache(true);
      }

      await updateVideosIfRequired(loadedVideos);
    })();
  }, []);

  useEffect(() => {
    // Make more calls to check if there are new videos on every interval
    if (isAppActive) {
      const interval = setIncrementalInterval(
        async () => updateVideosIfRequired(videos),
        VIDEO_CACHE_LIFE_TIME
      );
      return () => clearInterval(interval);
    }
  }, [videos, isAppActive]);

  useEffect(() => {
    // If the app has been in the background for longer than the cache life make an api call instantly
    if (isAppActive && lastApiCallTime + VIDEO_CACHE_LIFE_TIME < Date.now()) {
      updateVideosIfRequired(videos);
    }
  }, [isAppActive]);

  useEffect(() => {
    // Save the current videos to the cache where appropriate
    if (hasLoadedCache && videos) cachedVideos.save(videos);
  }, [hasLoadedCache, videos]);

  useEffect(() => {
    if (videos) {
      // reset error states if videos are available
      setCacheError(false);
      setApiError(false);
    }
  }, [Boolean(videos)]);

  useEffect(() => {
    if (isRefreshingVideosFromAPI)
      // Fake a delay to allow the interface to show a spinner and reduce how often users can spam retry
      new Promise((r) => setTimeout(r, 2000)).then(() => updateVideosIfRequired(videos));
  }, [isRefreshingVideosFromAPI]);

  return {
    videos,
    isRefreshing: isRefreshingVideosFromAPI,
    error: hasLoadedCache && !videos && (apiError || cacheError),
    refreshVideos: useCallback(async () => setIsRefreshingVideosFromAPI(true), []),
  };
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
