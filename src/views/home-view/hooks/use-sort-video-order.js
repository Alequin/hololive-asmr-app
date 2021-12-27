import { useCallback, useEffect, useState } from "react";
import { showToast } from "../../../show-toast";

export const VIDEO_SORT_METHODS = [
  { key: "published_at", direction: "desc", name: "Newest to oldest" },
  { key: "published_at", direction: "asc", name: "Oldest to newest" },
];

export const useVideoSortOrder = () => {
  const [sortOrderIndex, setSortOrderIndex] = useState(0);

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
