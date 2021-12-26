import { useCallback, useEffect, useState } from "react";
import { requestChannels } from "../../../external-requests/request-channels";

export const VIDEO_CACHE_LIFE_TIME = 1000 * 60 * 10;

export const useRequestChannels = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshingChannelsFromAPI, setIsRefreshingChannelsFromAPI] =
    useState(false);

  const fetchChannels = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      setChannels(await requestChannels());
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
      setIsRefreshingChannelsFromAPI(false);
    }
  }, []);

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    if (isRefreshingChannelsFromAPI) {
      setError(null);
      // Fake a delay to allow the interface to show a spinner and reduce how often users can spam retry
      new Promise((r) => setTimeout(r, 2000)).then(fetchChannels);
    }
  }, [isRefreshingChannelsFromAPI, fetchChannels]);

  return {
    channels,
    loading: loading || isRefreshingChannelsFromAPI,
    error,
    refetchChannels: useCallback(() => setIsRefreshingChannelsFromAPI(true)),
  };
};
