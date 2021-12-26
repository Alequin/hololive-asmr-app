import React from "react";
import { Image, FlatList } from "react-native";
import { Button } from "../../../components/button";
import { LoadingSpinner } from "../../../components/loading-spinner";
import { useOrientation } from "../../../use-orientation";
import { isMiniScreen, windowWidth } from "../../../window";
import { useNavigateToVideoView } from "../hooks/use-navigate-to-video-view";

export const ThumbnailVideoList = ({ videos, fetchNextPageOfVideos }) => {
  useOrientation(); // update state on orientation change to re-calc size values
  const navigateToVideoView = useNavigateToVideoView();

  const columnCount = isMiniScreen() ? 6 : 7;

  return (
    <FlatList
      key={`flatlist-${columnCount}-columns`} // force re-render if numColumns changes
      testID="thumbnailVideoList"
      style={{ width: "100%", height: "100%" }}
      data={videos}
      numColumns={columnCount}
      keyExtractor={({ video_id }) => video_id}
      onEndReached={async () => await fetchNextPageOfVideos()}
      renderItem={({ item }) => (
        <ThumbnailVideoButton
          size={windowWidth() / columnCount}
          thumbnailUrl={item.video_thumbnail_url}
          onSelectVideo={() => navigateToVideoView(item)}
        />
      )}
      ListFooterComponent={() => <LoadingSpinner />}
    />
  );
};

const ThumbnailVideoButton = ({ thumbnailUrl, size, onSelectVideo }) => {
  return (
    <Button
      testID="videoButton"
      style={{ width: size, height: size }}
      onPress={onSelectVideo}
    >
      <Image
        testID="videoImageBackground"
        style={{ width: "100%", height: "100%", resizeMode: "stretch" }}
        source={{ uri: thumbnailUrl }}
      />
    </Button>
  );
};
