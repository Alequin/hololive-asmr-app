import { useEffect, useState } from "react";
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

  return { videos, isLoading };
};
