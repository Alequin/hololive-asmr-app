import React, { useCallback, useEffect, useMemo, useState } from "react";
import { zoomState } from "../../async-storage";
import { ControlBar } from "../../components/control-bar";
import { IconButton } from "../../components/icon-button";
import { MainView } from "../../components/main-view";
import { ViewContainerWithStatusBar } from "../view-container-with-status-bar";
import { ListOfVideos } from "./components/list-of-videos";

const VIDEO_SORT_METHODS = [
  { key: "published_at", direction: "desc", name: "Newest to Oldest" },
  { key: "published_at", direction: "asc", name: "Oldest to Newest" },
  { key: "channel_title", direction: "asc", name: "A to Z" },
  { key: "channel_title", direction: "desc", name: "Z to A" },
];

export const ZOOMED_OUT_MODIFIER = 2;
export const ZOOMED_IN_MODIFIER = 1;

export const HomeView = () => {
  const { sortOrder, nextSortOrder } = useVideoSortOrder();
  const { zoomModifier, toggleZoomModifier } = useZoomModifier();

  const isZoomedIn = zoomModifier === ZOOMED_IN_MODIFIER;
  return (
    <ViewContainerWithStatusBar testID="homeView">
      <MainView>
        <ListOfVideos sortOrder={sortOrder} zoomModifier={zoomModifier} />
      </MainView>
      <ControlBar>
        <IconButton
          iconName="sortOrder"
          iconSize={20}
          onPress={nextSortOrder}
          text={sortOrder.name}
        />
        <IconButton
          iconName={isZoomedIn ? "zoomOut" : "zoomIn"}
          onPress={toggleZoomModifier}
          text={isZoomedIn ? "Zoom Out" : "Zoom In"}
        />
      </ControlBar>
    </ViewContainerWithStatusBar>
  );
};

const useVideoSortOrder = () => {
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

const useZoomModifier = () => {
  const [hasLoadedCache, setHasLoadedCache] = useState(false);
  const [zoomModifier, setZoomModifier] = useState(null);

  useEffect(() => {
    // Load zoom from cache
    zoomState.load().then((cachedModifier) => {
      setZoomModifier(cachedModifier || ZOOMED_IN_MODIFIER);
      setHasLoadedCache(true);
    });
  }, []);

  useEffect(() => {
    // Save current zoom
    if (hasLoadedCache) zoomState.save(zoomModifier);
  }, [hasLoadedCache, zoomModifier]);

  return {
    zoomModifier,
    toggleZoomModifier: useCallback(
      () =>
        setZoomModifier((zoomModifier) =>
          zoomModifier === ZOOMED_IN_MODIFIER
            ? ZOOMED_OUT_MODIFIER
            : ZOOMED_IN_MODIFIER
        ),
      [setZoomModifier]
    ),
  };
};
