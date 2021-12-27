import * as Brightness from "expo-brightness";
import isNil from "lodash/isNil";
import React, { useEffect, useState } from "react";
import { AdBanner } from "../../ad-banner";
import { ControlBar } from "../../components/control-bar";
import { FullScreenLoadingSpinner } from "../../components/full-screen-loading-spinner";
import { IconButton } from "../../components/icon-button";
import { MainView } from "../../components/main-view";
import { useIsAppStateActive } from "../../use-app-state";
import { requestBrightnessPermissions } from "../../use-brightness";
import { ViewContainerWithStatusBar } from "../view-container-with-status-bar";
import { DetailedVideoList } from "./components/detailed-video-list";
import { ErrorRequestingVideosMessage } from "./components/error-requesting-videos-message";
import { FilterModal } from "./components/filter-modal";
import { ThumbnailVideoList } from "./components/thumbnail-video-list";
import { useRequestVideos } from "./hooks/use-request-videos";
import { useVideoSortOrder } from "./hooks/use-sort-video-order";
import { useViewMode } from "./hooks/use-view-mode";

const VIEW_ID = "homeView";

export const HomeView = () => {
  const { isFilerModalOpen, showFilterModal, hideFilterModal } =
    useIsFilterModalVisible();
  const { isDetailedViewMode, toggleDetailedViewMode } = useViewMode();

  const isAppActive = useIsAppStateActive();
  const [shouldRequestPermission, setShouldRequestPermission] = useState(false);
  useEffect(() => {
    if (isAppActive)
      Brightness.getPermissionsAsync().then(({ granted }) =>
        setShouldRequestPermission(!granted)
      );
  }, [isAppActive]);

  const {
    channelsToFilterBy,
    toggleChannelToFilterBy,
    clearChannelsToFilterBy,
  } = useFilteredVideos();
  const { sortOrder, nextSortOrder } = useVideoSortOrder();

  const {
    videos,
    isRefreshing,
    refreshVideos,
    fetchNextPageOfVideos,
    error: errorRequestingVideos,
  } = useRequestVideos(channelsToFilterBy, sortOrder);

  const isError = !isRefreshing && errorRequestingVideos;

  const isPageLoading =
    !isError &&
    (!videos || !sortOrder || isNil(isDetailedViewMode) || isRefreshing);
  const canShowHomeView = !isError && !isPageLoading;

  return (
    <ViewContainerWithStatusBar testID={VIEW_ID}>
      {isError && (
        <ErrorRequestingVideosMessage onPressRefresh={refreshVideos} />
      )}
      {isPageLoading && <FullScreenLoadingSpinner />}
      {canShowHomeView && (
        <>
          <MainView>
            {isDetailedViewMode ? (
              <DetailedVideoList
                videos={videos}
                fetchNextPageOfVideos={fetchNextPageOfVideos}
              />
            ) : (
              <ThumbnailVideoList
                videos={videos}
                fetchNextPageOfVideos={fetchNextPageOfVideos}
              />
            )}
            <FilterModal
              isOpen={isFilerModalOpen}
              videos={videos}
              channelsToFilterBy={channelsToFilterBy}
              onSelectChannel={toggleChannelToFilterBy}
              onClearAllChannels={clearChannelsToFilterBy}
              onDismissModal={hideFilterModal}
            />
          </MainView>
          <ControlBar>
            <FilterModalButton openSearchModal={showFilterModal} />
            <SortButton
              nextSortOrder={nextSortOrder}
              sortOrderDescription={sortOrder.name}
            />
            <ViewModeButton
              isDetailedViewMode={isDetailedViewMode}
              toggleViewMode={toggleDetailedViewMode}
            />
            <PermissionsButton
              shouldRequestPermission={shouldRequestPermission}
            />
          </ControlBar>
        </>
      )}
      <AdBanner />
    </ViewContainerWithStatusBar>
  );
};

const useFilteredVideos = () => {
  const [channelsToFilterBy, setChannelsToFilterBy] = useState([]);

  return {
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

const useIsFilterModalVisible = () => {
  const [isFilerModalOpen, setIsFilerModalOpen] = useState(false);

  return {
    isFilerModalOpen,
    showFilterModal: () => setIsFilerModalOpen(true),
    hideFilterModal: () => setIsFilerModalOpen(false),
  };
};

const ViewModeButton = ({ isDetailedViewMode, toggleViewMode }) => (
  <HomeViewIconButton
    iconName={isDetailedViewMode ? "zoomOut" : "zoomIn"}
    onPress={toggleViewMode}
  />
);

const PermissionsButton = ({ shouldRequestPermission }) =>
  shouldRequestPermission ? (
    <HomeViewIconButton
      iconName="shieldKey"
      onPress={requestBrightnessPermissions}
    />
  ) : null;

const FilterModalButton = ({ openSearchModal }) => (
  <HomeViewIconButton
    iconName="search"
    iconSize={20}
    onPress={openSearchModal}
  />
);

const SortButton = ({ nextSortOrder, sortOrderDescription }) => (
  <HomeViewIconButton
    iconName="sortOrder"
    iconSize={20}
    onPress={nextSortOrder}
  />
);

const HomeViewIconButton = (props) => (
  <IconButton
    {...props}
    style={{
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      padding: 10,
      maxWidth: "25%",
    }}
  />
);
