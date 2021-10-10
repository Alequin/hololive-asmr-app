import { useCallback, useEffect, useState } from "react";
import { zoomModifierState } from "../../../async-storage";

export const ZOOMED_OUT_MODIFIER = 2;
export const ZOOMED_IN_MODIFIER = 1;

export const useZoomModifier = () => {
  const [hasLoadedCache, setHasLoadedCache] = useState(false);
  const [zoomModifier, setZoomModifier] = useState(null);

  useEffect(() => {
    // Load zoom from cache
    zoomModifierState.load().then((cachedModifier) => {
      setZoomModifier(cachedModifier || ZOOMED_OUT_MODIFIER);
      setHasLoadedCache(true);
    });
  }, []);

  useEffect(() => {
    // Save current zoom
    if (hasLoadedCache) zoomModifierState.save(zoomModifier);
  }, [hasLoadedCache, zoomModifier]);

  return {
    zoomModifier,
    toggleZoomModifier: useCallback(
      () =>
        setZoomModifier((zoomModifier) =>
          zoomModifier === ZOOMED_IN_MODIFIER ? ZOOMED_OUT_MODIFIER : ZOOMED_IN_MODIFIER
        ),
      [setZoomModifier]
    ),
  };
};
