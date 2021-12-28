import uniqBy from "lodash/uniqBy";
import isEmpty from "lodash/isEmpty";
import { useCallback, useEffect, useMemo, useState } from "react";
import { requestVideos } from "../../../external-requests/request-videos";
import { videoCache } from "../../../async-storage";
import { flatten } from "lodash";

export const useRequestVideos = (channelsToFilterBy, sortOrder) => {
  const [hasCacheLoaded, setHasCacheLoaded] = useState(null);
  const [videos, setVideos] = useState(null);
  const [apiError, setApiError] = useState(null);

  const baseVideoRequestParams = useMemo(
    () => ({
      channelIds: !isEmpty(channelsToFilterBy) && channelsToFilterBy,
      orderDirection: sortOrder.direction,
    }),
    [channelsToFilterBy, sortOrder]
  );

  const fetchVideos = useCallback(async () => {
    try {
      setShouldDisableNextPageFetch(false); // on fetching new videos enable next page fetch
      const videos = await requestVideos(baseVideoRequestParams);
      if (sortOrder.isDefaultOrder) {
        // Only cache the default sort order to speed up viewing on app load
        await videoCache.save(videos.slice(0, 50));
      }
      setVideos(uniqByVideoId(videos));
    } catch (error) {
      setApiError(error);
    }
  }, [baseVideoRequestParams]);

  const [shouldDisableNextPageFetch, setShouldDisableNextPageFetch] =
    useState(null);

  const fetchNextPageOfVideos = useCallback(async () => {
    try {
      if (shouldDisableNextPageFetch) return; // Stop making api calls once disabled
      const reqestedvideos = await requestVideos({
        ...baseVideoRequestParams,
        offset: videos?.length,
      });

      const wereThereMoreVideos = reqestedvideos.length > 0;
      setShouldDisableNextPageFetch(!wereThereMoreVideos);
      setVideos((videos) => uniqByVideoId(videos, reqestedvideos));
      return wereThereMoreVideos;
    } catch (error) {
      setApiError(error);
    }
  }, [baseVideoRequestParams, videos, shouldDisableNextPageFetch]);

  useEffect(() => {
    // Speed up app load with cache
    (async () => {
      try {
        const cachedVideos = await videoCache.load();
        setVideos((videos) => uniqByVideoId(videos, cachedVideos));
      } catch (error) {
        // If cache fails to load do nothing and allow the api request to get videos
      } finally {
        setHasCacheLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    // Fetch new batch of videos when required
    if (baseVideoRequestParams.orderDirection && hasCacheLoaded) fetchVideos();
  }, [baseVideoRequestParams, hasCacheLoaded]);

  useEffect(() => {
    if (videos) {
      // reset error states if videos are available
      setApiError(false);
    }
  }, [Boolean(videos)]);

  return {
    videos,
    error: apiError,
    refreshVideos: useCallback(async () => fetchVideos(videos), [videos]),
    fetchNextPageOfVideos,
  };
};

const uniqByVideoId = (...videos) =>
  uniqBy(flatten(videos.filter(Boolean)), "video_id");
