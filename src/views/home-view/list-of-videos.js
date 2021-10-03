import { useNavigation } from "@react-navigation/core";
import React from "react";
import { ActivityIndicator, Dimensions, Image } from "react-native";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { useRequestVideos } from "./use-request-videos";

const windowWidth = Dimensions.get("window").width;

export const ListOfVideos = () => {
  const nav = useNavigation();
  const { videos, isLoading } = useRequestVideos();

  if (isLoading) return <ActivityIndicator size="large" color="#fff" />;

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
          onSelectVideo={async () =>
            nav.navigate("videoView", {
              videoId: item.video_id,
            })
          }
        />
      )}
    />
  );
};

const VideoButton = ({ thumbnailUrl, size, onSelectVideo }) => {
  return (
    <TouchableOpacity
      style={{ width: size, height: size }}
      onPress={onSelectVideo}
    >
      <Image
        style={{ width: "100%", height: "100%", resizeMode: "stretch" }}
        source={{ uri: thumbnailUrl }}
      />
    </TouchableOpacity>
  );
};
