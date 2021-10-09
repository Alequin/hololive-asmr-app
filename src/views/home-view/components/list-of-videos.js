import { useNavigation } from "@react-navigation/core";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useHasSortOrderChanged } from "../hooks/use-has-sort-order-changed";
import { useOrderedVideos } from "../hooks/use-ordered-videos";
import { useRequestVideos } from "../hooks/use-request-videos";
import { VideoButton } from "./video-button";

const windowWidth = Dimensions.get("window").width;

export const ListOfVideos = ({ sortOrder, zoomModifier }) => {
  const nav = useNavigation();
  const videos = useOrderedVideos(useRequestVideos(), sortOrder);
  const { columnCount, isColumnCountOutOfSync } = useColumnCount(zoomModifier);

  if (
    useHasSortOrderChanged(sortOrder) ||
    !videos ||
    isColumnCountOutOfSync ||
    !zoomModifier
  )
    return <ActivityIndicator size="large" color="#fff" style={{ flex: 1 }} />;

  return (
    <FlatList
      testID="videoList"
      style={{ width: "100%", height: "100%" }}
      data={videos}
      numColumns={columnCount}
      keyExtractor={({ video_id }) => video_id}
      renderItem={({ item }) => (
        <VideoButton
          size={windowWidth / columnCount}
          thumbnailUrl={item.thumbnail_url}
          onSelectVideo={() =>
            nav.navigate("videoView", {
              videoId: item.video_id,
              channelTitle: item.channel_title,
              channelId: item.channel_id,
            })
          }
        />
      )}
    />
  );
};

const useColumnCount = (zoomModifier = 1) => {
  const baseColumnCount = 4;
  const columnCount = baseColumnCount * zoomModifier;
  const [columnCountToUse, setColumnCountToUse] = useState(columnCount);

  const isColumnCountOutOfSync = columnCountToUse !== columnCount;

  useEffect(() => {
    if (isColumnCountOutOfSync) setColumnCountToUse(columnCount);
  }, [isColumnCountOutOfSync]);

  return { columnCount: columnCountToUse, isColumnCountOutOfSync };
};
