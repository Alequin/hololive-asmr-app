import React from "react";
import { Image } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { Button } from "../../../components/button";
import { windowWidth } from "../../../window";
import { useNavigateToVideoView } from "../hooks/use-navigate-to-video-view";

const COLUMN_COUNT = 7;

export const ThumbnailVideoList = ({ videos }) => {
  const navigateToVideoView = useNavigateToVideoView();

  return (
    <FlatList
      testID="videoList"
      style={{ width: "100%", height: "100%" }}
      data={videos}
      numColumns={COLUMN_COUNT}
      keyExtractor={({ video_id }) => video_id}
      renderItem={({ item }) => (
        <ThumbnailVideoButton
          size={windowWidth / COLUMN_COUNT}
          thumbnailUrl={item.video_thumbnail_url}
          onSelectVideo={() => navigateToVideoView(item)}
        />
      )}
    />
  );
};

const ThumbnailVideoButton = ({ thumbnailUrl, size, onSelectVideo }) => {
  return (
    <Button testID="videoButton" style={{ width: size, height: size }} onPress={onSelectVideo}>
      <Image
        testID="videoImageBackground"
        style={{ width: "100%", height: "100%", resizeMode: "stretch" }}
        source={{ uri: thumbnailUrl }}
      />
    </Button>
  );
};
