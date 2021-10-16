import { useNavigation } from "@react-navigation/core";
import React from "react";
import { Image, Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { Button } from "../../../components/button";
import { windowHeight } from "../../../window";

export const DetailedVideoList = ({ videos }) => {
  const nav = useNavigation();

  return (
    <FlatList
      testID="videoList"
      style={{ width: "100%", height: "100%" }}
      data={videos}
      keyExtractor={({ video_id }) => video_id}
      numColumns={2}
      renderItem={({ item }) => (
        <DetailedVideoButton
          title={item.video_title}
          channelTitle={item.channel_title}
          channelThumbnailUrl={item.channel_thumbnail_url}
          videoThumbnailUrl={item.video_thumbnail_url}
          size={windowHeight * 0.5}
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

const DetailedVideoButton = ({
  title,
  channelTitle,
  videoThumbnailUrl,
  channelThumbnailUrl,
  size,
  onSelectVideo,
}) => {
  const buttonPadding = 10;
  const thumbnailSize = size - buttonPadding * 2;
  const channelThumbnailSize = thumbnailSize * 0.25;

  return (
    <Button
      testID="videoButton"
      style={{ flexDirection: "row", width: "50%", height: size, padding: buttonPadding }}
      onPress={onSelectVideo}
    >
      <Image
        testID="videoImageBackground"
        style={{
          width: thumbnailSize,
          height: thumbnailSize,
          resizeMode: "stretch",
        }}
        source={{ uri: videoThumbnailUrl }}
      />
      <View
        style={{
          flex: 1,
          justifyContent: "space-between",
          padding: 7,
        }}
      >
        <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }} numberOfLines={3}>
          {title}
        </Text>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
            width: "100%",
          }}
        >
          <Image
            testID="channelImage"
            style={{
              width: channelThumbnailSize,
              height: channelThumbnailSize,
              borderRadius: 1000,
            }}
            source={{ uri: channelThumbnailUrl }}
          />
          <Text style={{ color: "white", textAlign: "center", margin: 5, width: "100%" }}>
            {channelTitle}
          </Text>
        </View>
      </View>
    </Button>
  );
};
