import isNil from "lodash/isNil";
import { useCallback, useEffect, useState } from "react";
import { sortOrderState } from "../../../async-storage";
import { showToast } from "../../../show-toast";

const VIDEO_SORT_METHODS = [
  { key: "published_at", direction: "desc", name: "Newest to oldest" },
  { key: "published_at", direction: "asc", name: "Oldest to newest" },
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
    sortOrder: VIDEO_SORT_METHODS[sortOrderIndex]
      ? VIDEO_SORT_METHODS[sortOrderIndex]
      : null,
    nextSortOrder: useCallback(() => {
      setSortOrderIndex((currentIndex) => {
        const nextIndex = currentIndex + 1;
        const nextSortOrderIndex = VIDEO_SORT_METHODS[nextIndex]
          ? nextIndex
          : 0;
        showToast(
          `Sorting videos: ${VIDEO_SORT_METHODS[nextSortOrderIndex].name}`,
          3000
        );
        return nextSortOrderIndex;
      });
    }, []),
  };
};
