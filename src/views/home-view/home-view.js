import React, { useCallback, useMemo, useState } from "react";
import { ControlBar } from "../../components/control-bar";
import { IconButton } from "../../components/icon-button";
import { MainView } from "../../components/main-view";
import { ViewContainerWithStatusBar } from "../view-container-with-status-bar";
import { ListOfVideos } from "./components/list-of-videos";

const VIDEO_SORT_METHODS = [
  { key: "published_at", direction: "desc", name: "Newest to Oldest" },
  { key: "published_at", direction: "asc", name: "Oldest to Newest" },
  { key: "channel_title", direction: "desc", name: "A to Z" },
  { key: "channel_title", direction: "asc", name: "Z to A" },
];

export const HomeView = () => {
  const { sortOrder, nextSortOrder } = useVideoSortOrder();

  return (
    <ViewContainerWithStatusBar>
      <MainView>
        <ListOfVideos sortOrder={sortOrder} />
      </MainView>
      <ControlBar>
        <IconButton
          iconName="sortOrder"
          iconSize={20}
          onPress={nextSortOrder}
          text={sortOrder.name}
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
