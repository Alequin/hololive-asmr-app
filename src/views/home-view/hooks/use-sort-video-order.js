import isNil from "lodash/isNil";
import { useCallback, useEffect, useState } from "react";
import { sortOrderState } from "../../../async-storage";

const VIDEO_SORT_METHODS = [
  { key: "published_at", direction: "desc", name: "Newest to Oldest" },
  { key: "published_at", direction: "asc", name: "Oldest to Newest" },
  { key: "channel_title", direction: "asc", name: "A to Z" },
  { key: "channel_title", direction: "desc", name: "Z to A" },
];

export const useVideoSortOrder = () => {
  const [hasLoadedCache, setHasLoadedCache] = useState(false);
  const [sortOrderIndex, setSortOrderIndex] = useState(null);

  useEffect(() => {
    // Save current zoom
    if (hasLoadedCache) sortOrderState.save(sortOrderIndex);
  }, [hasLoadedCache, sortOrderIndex]);

  useEffect(() => {
    sortOrderState
      .load()
      .then((savedSortOrderIndex) => {
        setSortOrderIndex(savedSortOrderIndex || 0);
        setHasLoadedCache(true);
      })
      .catch(() => {
        setSortOrderIndex(0);
        setHasLoadedCache(true);
      });
  }, []);

  return {
    sortOrder: !isNil(sortOrderIndex) ? VIDEO_SORT_METHODS[sortOrderIndex] : null,
    nextSortOrder: useCallback(() => {
      setSortOrderIndex((currentIndex) => {
        const nextIndex = currentIndex + 1;
        return VIDEO_SORT_METHODS[nextIndex] ? nextIndex : 0;
      });
    }, [setSortOrderIndex]),
  };
};
