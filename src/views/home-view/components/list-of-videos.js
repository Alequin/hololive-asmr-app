import { useNavigation } from "@react-navigation/core";
import React from "react";
import { ActivityIndicator, Dimensions } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useHasSortOrderChanged } from "../hooks/use-has-sort-order-changed";
import { useOrderedVideos } from "../hooks/use-ordered-videos";
import { useRequestVideos } from "../hooks/use-request-videos";
import { VideoButton } from "./video-button";

const windowWidth = Dimensions.get("window").width;

export const ListOfVideos = ({ sortOrder }) => {
  const nav = useNavigation();
  const videos = useOrderedVideos(useRequestVideos(), sortOrder);

  if (useHasSortOrderChanged(sortOrder) || !videos)
    return <ActivityIndicator size="large" color="#fff" style={{ flex: 1 }} />;

  const numColumns = 4;
  return (
    <FlatList
      style={{ width: "100%", height: "100%" }}
      data={videos}
      numColumns={numColumns}
      keyExtractor={({ video_id }) => video_id}
      renderItem={({ item }) => (
        <VideoButton
          size={windowWidth / numColumns}
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
