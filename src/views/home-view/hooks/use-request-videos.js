import { useCallback, useEffect, useState } from "react";
import { requestVideos } from "../../../external-requests/request-videos";

export const useRequestVideos = () => {
  const [videos, setVideos] = useState(null);
  const [isRefreshingVideosFromAPI, setIsRefreshingVideosFromAPI] =
    useState(false);
  const [apiError, setApiError] = useState(null);

  const fetchVideos = useCallback(async () => {
    try {
      setVideos(await requestVideos());
    } catch (error) {
      setApiError(error);
    } finally {
      setIsRefreshingVideosFromAPI(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, []);

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
  };
};
