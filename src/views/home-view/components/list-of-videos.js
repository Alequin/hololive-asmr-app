import { useNavigation } from "@react-navigation/core";
import React from "react";
import { Dimensions } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { FullScreenLoadingSpinner } from "../../../components/full-screen-loading-spinner";
import { LoadingSpinner } from "../../../components/loading-spinner";
import { useColumnCount } from "../hooks/use-column-count";
import { useHasSortOrderChanged } from "../hooks/use-has-sort-order-changed";
import { useOrderedVideos } from "../hooks/use-ordered-videos";
import { VideoButton } from "./video-button";

const windowWidth = Dimensions.get("window").width;

export const ListOfVideos = ({ videos, sortOrder, zoomModifier }) => {
  const nav = useNavigation();
  const orderedVideos = useOrderedVideos(videos, sortOrder);
  const { columnCount, isUpdatingColumnCount } = useColumnCount(zoomModifier);

  if (useHasSortOrderChanged(sortOrder) || isUpdatingColumnCount)
    return <FullScreenLoadingSpinner />;

  return (
    <FlatList
      testID="videoList"
      style={{ width: "100%", height: "100%" }}
      data={orderedVideos}
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
