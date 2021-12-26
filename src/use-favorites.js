import { useCallback, useEffect, useState } from "react";
import * as asyncStorage from "./async-storage";

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    let hasUnmounted = false;
    asyncStorage.favorites.load().then((savedFavorites) => {
      if (hasUnmounted) return;
      setFavorites(savedFavorites || []);
    });
    return () => (hasUnmounted = true);
  }, []);

  return {
    favorites,
    isInFavorites: useCallback(
      (video) => favorites.find(({ video_id }) => video_id === video.video_id),
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
