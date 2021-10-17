import * as Brightness from "expo-brightness";
import isEmpty from "lodash/isEmpty";
import isNil from "lodash/isNil";
import React, { useEffect, useMemo, useState } from "react";
import { ControlBar } from "../../components/control-bar";
import { FullScreenLoadingSpinner } from "../../components/full-screen-loading-spinner";
import { IconButton } from "../../components/icon-button";
import { MainView } from "../../components/main-view";
import { useIsAppStateActive } from "../../use-app-state";
import { requestBrightnessPermissions } from "../../use-brightness";
import { isSmallScreen } from "../../window";
import { ViewContainerWithStatusBar } from "../view-container-with-status-bar";
import { DetailedVideoList } from "./components/detailed-video-list";
import { ErrorRequestingVideosMessage } from "./components/error-requesting-videos-message";
import { FilterModal } from "./components/filter-modal";
import { ThumbnailVideoList } from "./components/thumbnail-video-list";
import { useHasSortOrderChanged } from "./hooks/use-has-sort-order-changed";
import { useOrderedVideos } from "./hooks/use-ordered-videos";
import { useRequestVideos } from "./hooks/use-request-videos";
import { useVideoSortOrder } from "./hooks/use-sort-video-order";
import { useViewMode } from "./hooks/use-view-mode";

const VIEW_ID = "homeView";

export const HomeView = () => {
  const { videos, isRefreshing, refreshVideos, error: errorRequestingVideos } = useRequestVideos();
  const { sortOrder, nextSortOrder } = useVideoSortOrder();
  const { isFilerModalOpen, showFilterModal, hideFilterModal } = useIsFilterModalVisible();
  const { isDetailedViewMode, toggleDetailedViewMode } = useViewMode();

  const isAppActive = useIsAppStateActive();
  const [shouldRequestPermission, setShouldRequestPermission] = useState(false);
  useEffect(() => {
    if (isAppActive)
      Brightness.getPermissionsAsync().then(({ granted }) => setShouldRequestPermission(!granted));
  }, [isAppActive]);

  const { filteredVideos, channelsToFilterBy, toggleChannelToFilterBy, clearChannelsToFilterBy } =
    useFilteredVideos(videos);

  const orderedVideos = useOrderedVideos(filteredVideos, sortOrder);
  const hasSortOrderChanged = useHasSortOrderChanged(sortOrder);

  if (!isRefreshing && errorRequestingVideos)
    return (
      <ViewContainerWithStatusBar testID={VIEW_ID}>
        <ErrorRequestingVideosMessage onPressRefresh={refreshVideos} />
      </ViewContainerWithStatusBar>
    );

  const isPageLoading = !orderedVideos || !sortOrder || isNil(isDetailedViewMode) || isRefreshing;
  if (isPageLoading)
    return (
      <ViewContainerWithStatusBar testID={VIEW_ID}>
        <FullScreenLoadingSpinner />
      </ViewContainerWithStatusBar>
    );

  const isVideoViewLoading = hasSortOrderChanged;
  return (
    <ViewContainerWithStatusBar testID={VIEW_ID}>
      <MainView>
        {isVideoViewLoading && <FullScreenLoadingSpinner />}
        {!isVideoViewLoading &&
          (isDetailedViewMode ? (
            <DetailedVideoList videos={orderedVideos} />
          ) : (
            <ThumbnailVideoList videos={orderedVideos} />
          ))}
        <FilterModal
          isOpen={isFilerModalOpen}
          videos={videos}
          channelsToFilterBy={channelsToFilterBy}
          onSelectChannel={toggleChannelToFilterBy}
          onClearAllChannels={clearChannelsToFilterBy}
          onDismissModal={hideFilterModal}
        />
      </MainView>
      {isSmallScreen ? (
        <>
          <ControlBar>
            <FilterModalButton openSearchModal={showFilterModal} />
            <SortButton nextSortOrder={nextSortOrder} sortOrderDescription={sortOrder.name} />
          </ControlBar>
          <ControlBar>
            <ViewModeButton
              isDetailedViewMode={isDetailedViewMode}
              toggleViewMode={toggleDetailedViewMode}
            />
            <PermissionsButton shouldRequestPermission={shouldRequestPermission} />
          </ControlBar>
        </>
      ) : (
        <ControlBar>
          <FilterModalButton openSearchModal={showFilterModal} />
          <SortButton nextSortOrder={nextSortOrder} sortOrderDescription={sortOrder.name} />
          <ViewModeButton
            isDetailedViewMode={isDetailedViewMode}
            toggleViewMode={toggleDetailedViewMode}
          />
          <PermissionsButton shouldRequestPermission={shouldRequestPermission} />
        </ControlBar>
      )}
    </ViewContainerWithStatusBar>
  );
};

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

const useIsFilterModalVisible = () => {
  const [isFilerModalOpen, setisFilerModalOpen] = useState(false);

  return {
    isFilerModalOpen,
    showFilterModal: () => setisFilerModalOpen(true),
    hideFilterModal: () => setisFilerModalOpen(false),
  };
};

const ViewModeButton = ({ isDetailedViewMode, toggleViewMode }) => (
  <HomeViewIconButton
    iconName={isDetailedViewMode ? "zoomOut" : "zoomIn"}
    onPress={toggleViewMode}
    text={isDetailedViewMode ? "Less Details" : "More Details"}
  />
);

const PermissionsButton = ({ shouldRequestPermission }) =>
  shouldRequestPermission ? (
    <HomeViewIconButton
      iconName="shieldKey"
      onPress={requestBrightnessPermissions}
      text="Give System Permission"
    />
  ) : null;

const FilterModalButton = ({ openSearchModal }) => (
  <HomeViewIconButton
    iconName="search"
    iconSize={20}
    onPress={openSearchModal}
    text="Filter By Channel"
  />
);

const SortButton = ({ nextSortOrder, sortOrderDescription }) => (
  <HomeViewIconButton
    iconName="sortOrder"
    iconSize={20}
    onPress={nextSortOrder}
    text={sortOrderDescription}
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
      maxWidth: isSmallScreen ? "50%" : "25%",
    }}
  />
);
