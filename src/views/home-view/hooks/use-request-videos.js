import { isEmpty, uniqBy } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { requestVideos } from "../../../external-requests/request-videos";

export const useRequestVideos = (channelsToFilterBy, sortOrder) => {
  const [videos, setVideos] = useState(null);
  const [isRefreshingVideosFromAPI, setIsRefreshingVideosFromAPI] =
    useState(false);
  const [apiError, setApiError] = useState(null);

  const baseVideoRequestParams = useMemo(
    () => ({
      channelIds: !isEmpty(channelsToFilterBy) && channelsToFilterBy,
      orderDirection: sortOrder?.direction,
    }),
    [channelsToFilterBy, sortOrder]
  );

  const updateVideos = useCallback(
    async (newVideosCallback) => {
      const newVideos = await newVideosCallback(videos);
      setVideos(uniqBy(newVideos, "video_id"));
    },
    [videos]
  );

  const fetchVideos = useCallback(async () => {
    try {
      setShouldDisableNextPageFetch(false); // on fetching new videos enable next page fetch
      const videos = await requestVideos(baseVideoRequestParams);
      updateVideos(async () => videos);
    } catch (error) {
      setApiError(error);
    } finally {
      setIsRefreshingVideosFromAPI(false);
    }
  }, [baseVideoRequestParams, updateVideos]);

  const [shouldDisableNextPageFetch, setShouldDisableNextPageFetch] =
    useState(null);

  const fetchNextPageOfVideos = useCallback(async () => {
    try {
      if (shouldDisableNextPageFetch) return; // Stop making api calls onces disabled
      const reqestedvideos = await requestVideos({
        ...baseVideoRequestParams,
        offset: videos?.length,
      });

      const wereThereMoreVideos = reqestedvideos.length > 0;
      setShouldDisableNextPageFetch(!wereThereMoreVideos);
      updateVideos((videos) => [...videos, ...reqestedvideos]);
      return wereThereMoreVideos;
    } catch (error) {
      setApiError(error);
    } finally {
      setIsRefreshingVideosFromAPI(false);
    }
  }, [
    baseVideoRequestParams,
    videos?.length,
    shouldDisableNextPageFetch,
    updateVideos,
  ]);

  useEffect(() => {
    if (baseVideoRequestParams.orderDirection) fetchVideos();
  }, [baseVideoRequestParams]);

  useEffect(() => {
    if (videos) {
      // reset error states if videos are available
      setApiError(false);
    }
  }, [Boolean(videos)]);

  useEffect(() => {
    if (isRefreshingVideosFromAPI)
      // Fake a delay to allow the interface to show a spinner and reduce how often users can spam retry
      new Promise((r) => setTimeout(r, 2000)).then(() => fetchVideos(videos));
  }, [isRefreshingVideosFromAPI]);

  return {
    videos,
    isRefreshing: isRefreshingVideosFromAPI,
    error: apiError,
    refreshVideos: useCallback(
      async () => setIsRefreshingVideosFromAPI(true),
      []
    ),
    fetchNextPageOfVideos,
  };
};
