import React from "react";
import { Image, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { Button } from "../../../components/button";
import { ChannelThumbnail } from "../../../components/channel-thumbnail";
import { StyledText } from "../../../styled-text";
import { isSmallScreen, windowHeight } from "../../../window";
import { useNavigateToVideoView } from "../hooks/use-navigate-to-video-view";
import { dateString } from "./date-string";

const ONE_COLUMN = 1;
const TWO_COLUMNS = 2;

export const DetailedVideoList = ({ videos }) => {
  const navigateToVideoView = useNavigateToVideoView();

  const columnCount = isSmallScreen ? ONE_COLUMN : TWO_COLUMNS;

  return (
    <FlatList
      testID="videoList"
      style={{ width: "100%", height: "100%" }}
      data={videos}
      keyExtractor={({ video_id }) => video_id}
      numColumns={columnCount}
      renderItem={({ item }) => (
        <DetailedVideoButton
          title={item.video_title}
          isSingleColumn={columnCount === ONE_COLUMN}
          channelTitle={item.channel_title}
          channelThumbnailUrl={item.channel_thumbnail_url}
          videoThumbnailUrl={item.video_thumbnail_url}
          publishDate={dateString(new Date(item.published_at))}
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
  publishDate,
  isSingleColumn,
}) => {
  const buttonPadding = 10;
  const thumbnailSize = size - buttonPadding * 2;

  return (
    <Button
      testID="videoButton"
      style={{
        flexDirection: "row",
        width: isSingleColumn ? "100%" : "50%",
        height: size,
        padding: buttonPadding,
      }}
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
          padding: 5,
        }}
      >
        <StyledText
          style={{ color: "white", textAlign: "center", fontWeight: "bold" }}
          numberOfLines={isSingleColumn ? 2 : 3}
        >
          {title}
        </StyledText>
        <View>
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
              width: "100%",
            }}
          >
            <ChannelThumbnail channelThumbnailUrl={channelThumbnailUrl} />
            <StyledText style={{ color: "white", textAlign: "center", width: "100%" }}>
              {channelTitle}
            </StyledText>
          </View>
          <StyledText style={{ color: "white", textAlign: "center", width: "100%" }}>
            {publishDate}
          </StyledText>
        </View>
      </View>
    </Button>
  );
};
