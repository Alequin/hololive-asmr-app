import { useNavigation } from "@react-navigation/core";
import React, { useCallback, useContext, useMemo } from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";
import { AppContext } from "../../app-context";
import { ChannelButton } from "../../components/channel-button";
import { ControlBar } from "../../components/control-bar";
import { IconButton } from "../../components/icon-button";
import { MainView } from "../../components/main-view";
import { StatusBar } from "../../components/status-bar";
import { StyledText } from "../../styled-text";
import { useFavourites } from "../../use-favourites";
import { SCREEN_SIZES, withScreenSize } from "../../window";
import { ViewContainerWithStatusBar } from "../view-container-with-status-bar";
import { useIsFullScreenMode } from "./hooks/use-is-full-screen-mode";
import * as youtubeLinks from "./youtube-links";

const VIEW_ID = "videoView";

export const VideoView = ({ route: { params: video } }) => {
  const {
    channel_id,
    channel_title,
    channel_thumbnail_url,
    video_title,
    video_id,
  } = video;

  const { isScreenLocked, lockScreen } = useContext(AppContext);

  const nav = useNavigation();
  const { isFullScreenMode, toggleFullScreenMode } = useIsFullScreenMode();
  const { toYoutubeVideo, toYoutubeChannel } = useYoutubeLinks(
    video_id,
    channel_id
  );
  const { favourites, toggleFavourites, isInFavourites } = useFavourites();
  const isFavouriteVideo = useMemo(() => isInFavourites(video), [favourites]);

  return (
    <ViewContainerWithStatusBar
      testID={VIEW_ID}
      style={{
        width: "100%",
        height: "100%",
        zIndex: isScreenLocked ? 1 : 2,
      }}
    >
      <StatusBar isHidden={isFullScreenMode} />
      <View
        style={{ flex: 1, height: "100%", justifyContent: "space-between" }}
      >
        <MainView
          style={{
            flex: 80,
          }}
        >
          {!isFullScreenMode && (
            <StyledText
              style={{
                color: "white",
                textAlign: "center",
                paddingBottom: 10,
                paddingHorizontal: 10,
              }}
              fontSize={15}
            >
              {video_title}
            </StyledText>
          )}
          <View
            style={{
              flexDirection: "row",
              flex: 1,
            }}
          >
            <SideBar>
              <VideoviewIconButton
                isFullScreenMode={isFullScreenMode}
                iconName="fullscreen"
                onPress={toggleFullScreenMode}
                text="Full screen"
              />
              <VideoviewIconButton
                isFullScreenMode={isFullScreenMode}
                iconName="lock"
                onPress={lockScreen}
                text="Lock screen"
              />
              <VideoviewIconButton
                isFullScreenMode={isFullScreenMode}
                iconName={isFavouriteVideo ? "favourite" : "favouriteOutline"}
                text={isFavouriteVideo ? "Remove favourite" : "Add favourite"}
                onPress={() => toggleFavourites(video)}
              />
            </SideBar>
            <View
              testID="embeddedVideoContainer"
              style={{
                width: webViewWidth(isFullScreenMode),
                height: "100%",
                backgroundColor: "#000",
                borderWidth: 1,
                borderBottomWidth: 2,
                borderColor: "#ffffffBF",
              }}
            >
              <WebView
                testID="embeddedVideo"
                style={{
                  backgroundColor: "#000",
                }}
                originWhitelist={["*"]}
                source={{
                  uri: youtubeLinks.youtubeEmbeddedVideoUri(video_id),
                }}
              />
            </View>
            <SideBar>
              <VideoviewIconButton
                isFullScreenMode={isFullScreenMode}
                iconName="youtubeTv"
                onPress={toYoutubeVideo}
                text="Watch on youtube"
              />
              <VideoviewIconButton
                isFullScreenMode={isFullScreenMode}
                iconName="back"
                onPress={() => nav.goBack()}
                text="Back"
              />
            </SideBar>
          </View>
        </MainView>
        {(isScreenLocked || !isFullScreenMode) && (
          <ControlBar
            style={{ flex: isScreenLocked && isFullScreenMode ? 10 : 20 }}
          >
            {isScreenLocked && (
              <StyledText
                fontSize={18}
                style={{
                  color: "white",
                  fontWeight: "bold",
                  padding: 5,
                  textAlign: "center",
                }}
              >
                Screen is locked. Press anywhere to unlock
              </StyledText>
            )}
            {!isFullScreenMode && !isScreenLocked && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  padding: 10,
                }}
              >
                <ChannelButton
                  variant="black"
                  channelTitle={channel_title}
                  channelThumbnailUrl={channel_thumbnail_url}
                  onPress={toYoutubeChannel}
                  hitSlop={{ left: 30, right: 30, bottom: 0, top: 0 }}
                />
              </View>
            )}
          </ControlBar>
        )}
      </View>
    </ViewContainerWithStatusBar>
  );
};

const SideBar = (props) => (
  <View style={{ flex: 1, justifyContent: "space-around" }} {...props} />
);

const VideoviewIconButton = ({ isFullScreenMode, ...otherProps }) => {
  return isFullScreenMode ? (
    <FullViewIconButtons {...otherProps} />
  ) : (
    <HalfViewIconButton {...otherProps} />
  );
};

const HalfViewIconButton = (props) => (
  <IconButton
    {...props}
    style={{
      justifyContent: "space-between",
      alignItems: "center",
      padding: 5,
    }}
  />
);

const FullViewIconButtons = (props) => (
  <IconButton
    {...props}
    text={undefined}
    iconSize={26}
    style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
  />
);

const useYoutubeLinks = (videoId, channelId) => ({
  toYoutubeVideo: useCallback(
    () => youtubeLinks.toYoutubeVideo(videoId),
    [videoId]
  ),
  toYoutubeChannel: useCallback(
    () => youtubeLinks.toYoutubeChannel(channelId),
    [channelId]
  ),
});

const HALF_SCREEN_VIDEO_WIDTH = withScreenSize({
  [SCREEN_SIZES.mini]: "60%",
  [SCREEN_SIZES.small]: "65%",
  [SCREEN_SIZES.medium]: "70%",
  [SCREEN_SIZES.default]: "75%",
});

const FULL_SCREEN_VIDEO_WIDTH = withScreenSize({
  [SCREEN_SIZES.small]: "80%",
  [SCREEN_SIZES.medium]: "85%",
  [SCREEN_SIZES.default]: "87%",
});

const webViewWidth = (isFullScreenMode) => {
  return isFullScreenMode ? FULL_SCREEN_VIDEO_WIDTH : HALF_SCREEN_VIDEO_WIDTH;
};
