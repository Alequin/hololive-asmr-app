import orderBy from "lodash/orderBy";
import { useEffect, useState } from "react";

export const useOrderedVideos = (videos, sortOrder) => {
  const [orderedVideos, setOrderedVideos] = useState(videos);

  useEffect(() => {
    if (videos && sortOrder)
      setOrderedVideos(orderBy(videos, sortOrder.key, sortOrder.direction));
  }, [videos?.length, sortOrder?.key, sortOrder?.direction]);

  return orderedVideos;
};
