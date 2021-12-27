import { useFocusEffect } from "@react-navigation/native";
import { orderBy } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as asyncStorage from "./async-storage";
import { VIDEO_SORT_METHODS } from "./views/home-view/hooks/use-sort-video-order";

export const useFavorites = (sortOrder) => {
  const sortOrderToUse = sortOrder || VIDEO_SORT_METHODS[0];
  const [favorites, setFavorites] = useState([]);

  const loadFavorites = useCallback(
    async (onLoad) => onLoad((await asyncStorage.favorites.load()) || []),
    []
  );

  // Load on mount
  useEffect(() => {
    let hasUnmounted = false;
    loadFavorites(
      (loadedFavorites) => !hasUnmounted && setFavorites(loadedFavorites)
    );
    return () => (hasUnmounted = true);
  }, []);

  // load on page navigation
  useFocusEffect(
    useCallback(() => {
      loadFavorites((loadedFavorites) => setFavorites(loadedFavorites));
    }, [])
  );

  return {
    favorites: useMemo(
      () => orderBy(favorites, sortOrderToUse.key, sortOrderToUse.direction),
      [favorites, sortOrderToUse]
    ),
    isInFavorites: useCallback(
      (video) =>
        Boolean(favorites.find(({ video_id }) => video_id === video.video_id)),
      [favorites]
    ),
    toggleFavorites: useCallback(
      async (video) => {
        const isAlreadyInFavorites = favorites.find(
          ({ video_id }) => video_id === video.video_id
        );

        const nextFavorites = isAlreadyInFavorites
          ? favorites.filter(({ video_id }) => video_id !== video.video_id)
          : [...favorites, video];

        await asyncStorage.favorites.save(nextFavorites);
        setFavorites(nextFavorites);
      },
      [favorites]
    ),
  };
};
