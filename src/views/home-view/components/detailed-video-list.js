import React from "react";
import { Image, Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { Button } from "../../../components/button";
import { ChannelThumbnail } from "../../../components/channel-thumbnail";
import { windowHeight } from "../../../window";
import { useNavigateToVideoView } from "../hooks/use-navigate-to-video-view";

export const DetailedVideoList = ({ videos }) => {
  const navigateToVideoView = useNavigateToVideoView();

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
          onSelectVideo={() => navigateToVideoView(item)}
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
          <ChannelThumbnail channelThumbnailUrl={channelThumbnailUrl} size={channelThumbnailSize} />
          <Text style={{ color: "white", textAlign: "center", margin: 5, width: "100%" }}>
            {channelTitle}
          </Text>
        </View>
      </View>
    </Button>
  );
};
