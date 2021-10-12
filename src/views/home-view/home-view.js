import isEmpty from "lodash/isEmpty";
import uniq from "lodash/uniq";
import React, { useEffect, useMemo, useState } from "react";
import { AppState } from "react-native";
import { ControlBar } from "../../components/control-bar";
import { FullScreenLoadingSpinner } from "../../components/full-screen-loading-spinner";
import { IconButton } from "../../components/icon-button";
import { MainView } from "../../components/main-view";
import { useIsAppStateActive } from "../../use-app-state";
import { hasBrightnessPermission, requestBrightnessPermissions } from "../../use-brightness";
import { ViewContainerWithStatusBar } from "../view-container-with-status-bar";
import { FilterModal } from "./components/filter-modal";
import { ListOfVideos } from "./components/list-of-videos";
import { useRequestVideos } from "./hooks/use-request-videos";
import { useVideoSortOrder } from "./hooks/use-sort-video-order";
import { useZoomModifier, ZOOMED_IN_MODIFIER } from "./hooks/use-zoom-modifier";
import * as Brightness from "expo-brightness";

const VIEW_ID = "homeView";

export const HomeView = () => {
  const videos = useRequestVideos();
  const { sortOrder, nextSortOrder } = useVideoSortOrder();
  const { zoomModifier, toggleZoomModifier } = useZoomModifier();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const isAppActive = useIsAppStateActive();
  const [shouldRequestPermission, setShouldRequestPermission] = useState(false);
  useEffect(() => {
    if (isAppActive)
      Brightness.getPermissionsAsync().then(({ granted }) => setShouldRequestPermission(!granted));
  }, [isAppActive]);

  const { filteredVideos, channelsToFilterBy, toggleChannelToFilterBy, clearChannelsToFilterBy } =
    useFilteredVideos(videos);

  const orderedChannelNames = useMemo(
    () => (videos ? getChannelNamesFromVideos(videos).sort() : null),
    [videos]
  );

  const isLoading = !filteredVideos || !zoomModifier || !sortOrder || !orderedChannelNames;
  if (isLoading)
    return (
      <ViewContainerWithStatusBar testID={VIEW_ID}>
        <FullScreenLoadingSpinner />
      </ViewContainerWithStatusBar>
    );

  const isZoomedIn = zoomModifier === ZOOMED_IN_MODIFIER;
  return (
    <ViewContainerWithStatusBar testID={VIEW_ID}>
      <MainView>
        <ListOfVideos videos={filteredVideos} sortOrder={sortOrder} zoomModifier={zoomModifier} />
        <FilterModal
          isOpen={isSearchModalOpen}
          orderedChannelNames={orderedChannelNames}
          channelsToFilterBy={channelsToFilterBy}
          onSelectChannel={toggleChannelToFilterBy}
          onClearAllChannels={clearChannelsToFilterBy}
          onDismissModal={() => setIsSearchModalOpen(false)}
        />
      </MainView>
      <ControlBar>
        <IconButton
          iconName="search"
          iconSize={20}
          onPress={() => setIsSearchModalOpen(!isSearchModalOpen)}
          text="Filter By Channel"
        />
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
        {shouldRequestPermission && (
          <IconButton
            iconName="shieldKey"
            onPress={requestBrightnessPermissions}
            text="Give System Permission"
          />
        )}
      </ControlBar>
    </ViewContainerWithStatusBar>
  );
};

const getChannelNamesFromVideos = (videos) =>
  uniq(videos.map(({ channel_title }) => channel_title));

const useFilteredVideos = (videos) => {
  const [channelsToFilterBy, setChannelsToFilterBy] = useState([]);

  const filteredVideos = useMemo(
    () =>
      isEmpty(channelsToFilterBy)
        ? videos
        : videos?.filter(({ channel_title }) => channelsToFilterBy.includes(channel_title)),
    [videos, channelsToFilterBy]
  );

  return {
    filteredVideos,
    channelsToFilterBy,
    toggleChannelToFilterBy: (selectedChannel) =>
      channelsToFilterBy.includes(selectedChannel)
        ? setChannelsToFilterBy((channels) =>
            channels.filter((channel) => channel !== selectedChannel)
          )
        : setChannelsToFilterBy((channels) => [...channels, selectedChannel]),
    clearChannelsToFilterBy: () => setChannelsToFilterBy([]),
  };
};
