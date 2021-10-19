import { useNavigation } from "@react-navigation/core";
import React, { useCallback, useContext } from "react";
import { Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { AppContext } from "../../app-context";
import { ChannelButton } from "../../components/channel-button";
import { ControlBar } from "../../components/control-bar";
import { IconButton } from "../../components/icon-button";
import { MainView } from "../../components/main-view";
import { StatusBar } from "../../components/status-bar";
import { StyledText } from "../../styled-text";
import { isSmallScreen } from "../../window";
import { ViewContainerWithStatusBar } from "../view-container-with-status-bar";
import { useIsFullScreenMode } from "./hooks/use-is-full-screen-mode";
import * as youtubeLinks from "./youtube-links";

const VIEW_ID = "videoView";

export const VideoView = ({
  route: {
    params: { channelId, channelTitle, videoId, channelThumbnailUrl, videoTitle },
  },
}) => {
  const { isScreenLocked, lockScreen } = useContext(AppContext);

  const nav = useNavigation();
  const { isFullScreenMode, toggleFullScreenMode } = useIsFullScreenMode();
  const { toYoutubeVideo, toYoutubeChannel } = useYoutubeLinks(videoId, channelId);

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
      <View style={{ flex: 1, height: "100%", justifyContent: "space-between" }}>
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
              {videoTitle}
            </StyledText>
          )}
          <View
            style={{
              flexDirection: "row",
              flex: 1,
            }}
          >
            <SideBar>
              {isFullScreenMode ? (
                <>
                  <FullViewIconButtons iconName="fullscreen" onPress={toggleFullScreenMode} />
                  <FullViewIconButtons iconName="lock" onPress={lockScreen} />
                </>
              ) : (
                <>
                  <HalfViewIconButton
                    iconName="fullscreen"
                    onPress={toggleFullScreenMode}
                    text="Full Screen"
                  />
                  <HalfViewIconButton iconName="lock" onPress={lockScreen} text="Lock Screen" />
                </>
              )}
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
                  uri: youtubeLinks.youtubeEmbeddedVideoUri(videoId),
                }}
              />
            </View>
            <SideBar>
              {isFullScreenMode ? (
                <>
                  <FullViewIconButtons iconName="youtubeTv" onPress={toYoutubeVideo} />
                  <FullViewIconButtons iconName="back" onPress={() => nav.goBack()} />
                </>
              ) : (
                <>
                  <HalfViewIconButton
                    iconName="youtubeTv"
                    onPress={toYoutubeVideo}
                    text="Watch on youtube"
                  />
                  <HalfViewIconButton iconName="back" onPress={() => nav.goBack()} text="Back" />
                </>
              )}
            </SideBar>
          </View>
        </MainView>
        {(isScreenLocked || !isFullScreenMode) && (
          <ControlBar style={{ flex: 20 }}>
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
                  channelTitle={channelTitle}
                  channelThumbnailUrl={channelThumbnailUrl}
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

const SideBar = (props) => <View style={{ flex: 1, justifyContent: "space-around" }} {...props} />;

const HalfViewIconButton = (props) => (
  <IconButton {...props} style={{ justifyContent: "space-between", padding: 5 }} />
);

const FullViewIconButtons = (props) => (
  <IconButton
    {...props}
    iconSize={26}
    style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
  />
);

const useYoutubeLinks = (videoId, channelId) => ({
  toYoutubeVideo: useCallback(() => youtubeLinks.toYoutubeVideo(videoId), [videoId]),
  toYoutubeChannel: useCallback(() => youtubeLinks.toYoutubeChannel(channelId), [channelId]),
});

const webViewWidth = (isFullScreenMode) => {
  if (isSmallScreen) {
    return isFullScreenMode ? "80%" : "60%";
  }

  return isFullScreenMode ? "87%" : "75%";
};
