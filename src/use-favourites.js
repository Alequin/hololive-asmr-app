import { useFocusEffect } from "@react-navigation/native";
import orderBy from "lodash/orderBy";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as asyncStorage from "./async-storage";
import { VIDEO_SORT_METHODS } from "./views/home-view/hooks/use-sort-video-order";

export const useFavourites = (sortOrder) => {
  const sortOrderToUse = sortOrder || VIDEO_SORT_METHODS[0];
  const [favourites, setFavourites] = useState([]);
  const [error, setError] = useState(null);

  const loadFavourites = useCallback(async (onLoad) => {
    try {
      setError(null);
      onLoad((await asyncStorage.favourites.load()) || []);
    } catch (error) {
      setError(
        new Error(
          `There was an issue while loading favourite videos / ${error?.message}`
        )
      );
    }
  }, []);

  // Load on mount
  useEffect(() => {
    let hasUnmounted = false;
    loadFavourites(
      (loadedFavourites) => !hasUnmounted && setFavourites(loadedFavourites)
    );
    return () => (hasUnmounted = true);
  }, []);

  // load on page navigation
  useFocusEffect(
    useCallback(() => {
      loadFavourites((loadedFavourites) => setFavourites(loadedFavourites));
    }, [])
  );

  return {
    favourites: useMemo(
      () => orderBy(favourites, sortOrderToUse.key, sortOrderToUse.direction),
      [favourites, sortOrderToUse]
    ),
    error,
    reloadFavourites: useCallback(() => loadFavourites(setFavourites), []),
    isInFavourites: useCallback(
      (video) =>
        Boolean(favourites.find(({ video_id }) => video_id === video.video_id)),
      [favourites]
    ),
    toggleFavourites: useCallback(
      async (video) => {
        const isAlreadyInFavourites = favourites.find(
          ({ video_id }) => video_id === video.video_id
        );

        const nextFavourites = isAlreadyInFavourites
          ? favourites.filter(({ video_id }) => video_id !== video.video_id)
          : [...favourites, video];

        await asyncStorage.favourites.save(nextFavourites);
        setFavourites(nextFavourites);
      },
      [favourites]
    ),
  };
};
