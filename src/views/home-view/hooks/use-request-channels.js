import { useCallback, useEffect, useState } from "react";
import { requestChannels } from "../../../external-requests/request-channels";

export const VIDEO_CACHE_LIFE_TIME = 1000 * 60 * 10;

export const useRequestChannels = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchChannels = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      setChannels(await requestChannels());
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChannels();
  }, []);

  return {
    channels,
    loading,
    error,
    refetchChannels: fetchChannels,
  };
};
