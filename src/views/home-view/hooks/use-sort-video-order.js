import { useCallback, useMemo, useState } from "react";

const VIDEO_SORT_METHODS = [
  { key: "published_at", direction: "desc", name: "Newest to Oldest" },
  { key: "published_at", direction: "asc", name: "Oldest to Newest" },
  { key: "channel_title", direction: "asc", name: "A to Z" },
  { key: "channel_title", direction: "desc", name: "Z to A" },
];

export const useVideoSortOrder = () => {
  const [sortOrderIndex, setSortOrderIndex] = useState(0);

  return {
    sortOrder: useMemo(
      () => VIDEO_SORT_METHODS[sortOrderIndex],
      [sortOrderIndex]
    ),
    nextSortOrder: useCallback(() => {
      setSortOrderIndex((currentIndex) => {
        const nextIndex = currentIndex + 1;
        return VIDEO_SORT_METHODS[nextIndex] ? nextIndex : 0;
      });
    }, [setSortOrderIndex]),
  };
};
