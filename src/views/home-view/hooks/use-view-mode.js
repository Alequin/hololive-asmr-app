import isNil from "lodash/isNil";
import { useCallback, useEffect, useState } from "react";
import { viewModeState } from "../../../async-storage";

export const useViewMode = () => {
  const [hasLoadedCache, setHasLoadedCache] = useState(false);
  const [isDetailedViewMode, setIsDetailsViewMode] = useState(null);

  useEffect(() => {
    if (hasLoadedCache) viewModeState.save(isDetailedViewMode);
  }, [hasLoadedCache, isDetailedViewMode]);

  useEffect(() => {
    viewModeState
      .load()
      .then((isDetailedViewMode) => {
        setIsDetailsViewMode(isNil(isDetailedViewMode) ? true : isDetailedViewMode);
        setHasLoadedCache(true);
      })
      .catch(() => {
        setIsDetailsViewMode(true);
        setHasLoadedCache(true);
      });
  }, []);

  return {
    isDetailedViewMode,
    toggleDetailedViewMode: useCallback(() => setIsDetailsViewMode((value) => !value), []),
  };
};
