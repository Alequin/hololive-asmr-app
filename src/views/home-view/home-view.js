import * as Brightness from "expo-brightness";
import { isEmpty } from "lodash";
import isNil from "lodash/isNil";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { AdBanner } from "../../ad-banner";
import { ControlBar } from "../../components/control-bar";
import { FullScreenLoadingSpinner } from "../../components/full-screen-loading-spinner";
import { IconButton } from "../../components/icon-button";
import { MainView } from "../../components/main-view";
import { showToast } from "../../show-toast";
import { useIsAppStateActive } from "../../use-app-state";
import { requestBrightnessPermissions } from "../../use-brightness";
import { useFavorites } from "../../use-favorites";
import { ViewContainerWithStatusBar } from "../view-container-with-status-bar";
import { ErrorLoadingFavoriteVideos } from "./components/error-loading-favorite-videos-message";
import { ErrorRequestingVideosMessage } from "./components/error-requesting-videos-message";
import { FilterModal } from "./components/filter-modal";
import { NoFavoriteVideosMessage } from "./components/no-favorite-videos-message";
import { VideoList } from "./components/video-list";
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

  const { sortOrder, nextSortOrder } = useVideoSortOrder();
  const [areFavoritesVisible, setAreFavoritesVisible] = useState(false);
  const {
    favorites: favoriteVideos,
    error: errorFavoriteVideos,
    reloadFavorites,
  } = useFavorites(sortOrder);

  const {
    channelsToFilterBy,
    toggleChannelToFilterBy,
    clearChannelsToFilterBy,
  } = useFilteredVideos();

  const {
    videos: videosFromApi,
    refreshVideos,
    fetchNextPageOfVideos,
    error: errorRequestingVideos,
  } = useRequestVideos(channelsToFilterBy, sortOrder);

  const videos = areFavoritesVisible ? favoriteVideos : videosFromApi;

  const hasErroredRequestingVideos =
    !areFavoritesVisible && errorRequestingVideos;
  const hasErroredLoadingFavorites = areFavoritesVisible && errorFavoriteVideos;

  const isPageLoading =
    !hasErroredRequestingVideos &&
    (!videos || !sortOrder || isNil(isDetailedViewMode));
  const canShowHomeView =
    !hasErroredRequestingVideos &&
    !hasErroredLoadingFavorites &&
    !isPageLoading;

  return (
    <ViewContainerWithStatusBar testID={VIEW_ID}>
      {hasErroredRequestingVideos && (
        <ErrorRequestingVideosMessage onPressRefresh={refreshVideos} />
      )}
      {hasErroredLoadingFavorites && (
        <ErrorLoadingFavoriteVideos onPressRefresh={reloadFavorites} />
      )}
      {isPageLoading && <FullScreenLoadingSpinner />}
      {canShowHomeView && (
        <>
          <MainView>
            {isEmpty(videos) && areFavoritesVisible ? (
              <NoFavoriteVideosMessage />
            ) : (
              <VideoList
                isDetailedViewMode={isDetailedViewMode}
                videos={videos}
                fetchNextPageOfVideos={fetchNextPageOfVideos}
                shouldDisableNextPageFetch={areFavoritesVisible}
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
            <ShowFavoritesButton
              areFavoritesVisible={areFavoritesVisible}
              toggleFavorites={() => {
                const willShowFavorites = !areFavoritesVisible;
                showToast(
                  willShowFavorites
                    ? "Showing favorite videos"
                    : "Showing all videos",
                  1000
                );
                setAreFavoritesVisible(willShowFavorites);
              }}
            />
            {shouldRequestPermission ? <PermissionsButton /> : <View />}
            <SortButton
              nextSortOrder={nextSortOrder}
              sortOrderDescription={sortOrder.name}
            />
            <ViewModeButton
              isDetailedViewMode={isDetailedViewMode}
              toggleViewMode={toggleDetailedViewMode}
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

const PermissionsButton = () => (
  <HomeViewIconButton
    iconName="shieldKey"
    onPress={requestBrightnessPermissions}
  />
);

const FilterModalButton = ({ openSearchModal }) => (
  <HomeViewIconButton
    iconName="search"
    iconSize={20}
    onPress={openSearchModal}
  />
);

const SortButton = ({ nextSortOrder }) => (
  <HomeViewIconButton
    iconName="sortOrder"
    iconSize={20}
    onPress={nextSortOrder}
  />
);

const ShowFavoritesButton = ({ areFavoritesVisible, toggleFavorites }) => (
  <HomeViewIconButton
    iconName={areFavoritesVisible ? "favorite" : "favoriteOutline"}
    iconSize={23}
    onPress={toggleFavorites}
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
