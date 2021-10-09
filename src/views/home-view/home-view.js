import React from "react";
import { ControlBar } from "../../components/control-bar";
import { IconButton } from "../../components/icon-button";
import { MainView } from "../../components/main-view";
import { ViewContainerWithStatusBar } from "../view-container-with-status-bar";
import { ListOfVideos } from "./components/list-of-videos";
import { useVideoSortOrder } from "./hooks/use-sort-video-order";
import { useZoomModifier, ZOOMED_IN_MODIFIER } from "./hooks/use-zoom-modifier";

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
