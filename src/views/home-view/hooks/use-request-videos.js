import { useEffect, useState } from "react";
import { requestVideos } from "../../../external-requests/request-videos";

export const useRequestVideos = () => {
  const [videos, setVideos] = useState(null);

  useEffect(() => {
    requestVideos().then(setVideos);
  }, []);

  return videos;
};
