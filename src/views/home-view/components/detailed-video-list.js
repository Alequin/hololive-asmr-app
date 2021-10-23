import React from "react";
import { FlatList, Image, View } from "react-native";
import { Button } from "../../../components/button";
import { ChannelThumbnail } from "../../../components/channel-thumbnail";
import { StyledText } from "../../../styled-text";
import { isMiniScreen, SCREEN_SIZES, windowHeight, withScreenSize } from "../../../window";
import { useNavigateToVideoView } from "../hooks/use-navigate-to-video-view";
import { dateString } from "./date-string";

const ONE_COLUMN = 1;
const TWO_COLUMNS = 2;
const COLUMN_COUNT = isMiniScreen() ? ONE_COLUMN : TWO_COLUMNS;

export const DetailedVideoList = ({ videos }) => {
  const navigateToVideoView = useNavigateToVideoView();

  return (
    <FlatList
      testID="videoList"
      style={{ width: "100%", height: "100%" }}
      data={videos}
      keyExtractor={({ video_id }) => video_id}
      numColumns={COLUMN_COUNT}
      renderItem={({ item }) => (
        <DetailedVideoButton
          title={item.video_title}
          isSingleColumn={COLUMN_COUNT === ONE_COLUMN}
          channelTitle={item.channel_title}
          channelThumbnailUrl={item.channel_thumbnail_url}
          videoThumbnailUrl={item.video_thumbnail_url}
          publishDate={dateString(new Date(item.published_at))}
          onSelectVideo={() => navigateToVideoView(item)}
        />
      )}
    />
  );
};

const SIZE_MODIFIER = withScreenSize({
  [SCREEN_SIZES.small]: 0.45,
  [SCREEN_SIZES.medium]: 0.4,
  [SCREEN_SIZES.default]: 0.5,
});

const VIDEO_TITLE_LINE_COUNT = withScreenSize({
  [SCREEN_SIZES.medium]: 2,
  [SCREEN_SIZES.default]: 3,
});

const DetailedVideoButton = ({
  title,
  channelTitle,
  videoThumbnailUrl,
  channelThumbnailUrl,
  onSelectVideo,
  publishDate,
  isSingleColumn,
}) => {
  const size = windowHeight() * SIZE_MODIFIER;
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
          numberOfLines={VIDEO_TITLE_LINE_COUNT}
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
            <StyledText
              style={{ color: "white", textAlign: "center", width: "100%", margin: 1 }}
              numberOfLines={1}
            >
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
