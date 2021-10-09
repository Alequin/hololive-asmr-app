import React from "react";
import { ActivityIndicator } from "react-native";
import { ControlBar } from "../../components/control-bar";
import { IconButton } from "../../components/icon-button";
import { MainView } from "../../components/main-view";
import { ViewContainerWithStatusBar } from "../view-container-with-status-bar";
import { ListOfVideos } from "./components/list-of-videos";
import { useRequestVideos } from "./hooks/use-request-videos";
import { useVideoSortOrder } from "./hooks/use-sort-video-order";
import { useZoomModifier, ZOOMED_IN_MODIFIER } from "./hooks/use-zoom-modifier";

export const HomeView = () => {
  const videos = useRequestVideos();
  const { sortOrder, nextSortOrder } = useVideoSortOrder();
  const { zoomModifier, toggleZoomModifier } = useZoomModifier();

  const isLoading = !videos || !zoomModifier || !sortOrder;
  if (isLoading)
    return (
      <ViewContainerWithStatusBar testID="homeView">
        <ActivityIndicator size="large" color="#fff" style={{ flex: 1 }} />
      </ViewContainerWithStatusBar>
    );

  const isZoomedIn = zoomModifier === ZOOMED_IN_MODIFIER;
  return (
    <ViewContainerWithStatusBar testID="homeView">
      <MainView>
        <ListOfVideos
          videos={videos}
          sortOrder={sortOrder}
          zoomModifier={zoomModifier}
        />
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
