import { useNavigation } from "@react-navigation/core";
import React, { useCallback, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { AdBanner } from "../../ad-banner";
import { Button } from "../../components/button";
import { ControlBar } from "../../components/control-bar";
import { IconButton } from "../../components/icon-button";
import { LoadingSpinner } from "../../components/loading-spinner";
import { MainView } from "../../components/main-view";
import { useBrightness } from "../../use-brightness";
import { ViewContainerWithStatusBar } from "../view-container-with-status-bar";
import { useInitialBrightness } from "./hooks/use-initial-brightness";
import { useIsFullScreenMode } from "./hooks/use-is-full-screen-mode";
import { useLockScreen } from "./hooks/use-lock-screen";
import { useUnlockCountDown } from "./hooks/use-unlock-count-down";
import * as youtubeLinks from "./youtube-links";

const VIEW_ID = "videoView";
const DIMMED_SCREEN_BRIGHTNESS = 0.01;

export const VideoView = ({
  route: {
    params: { channelId, channelTitle, videoId, channelThumbnailUrl, videoTitle },
  },
}) => {
  const nav = useNavigation();
  const { getBrightness, setBrightness } = useBrightness();
  const initialBrightness = useInitialBrightness({ getBrightness, setBrightness });
  const { isScreenLocked, unlockScreen, lockScreen } = useLockScreen({ setBrightness });
  const { unlockCountDown, startUnlockCountDown, resetUnlockCountDown } = useUnlockCountDown(
    isScreenLocked,
    unlockScreen
  );
  const { isFullScreenMode, toggleFullScreenMode } = useIsFullScreenMode();
  const { toYoutubeVideo, toYoutubeChannel } = useYoutubeLinks(videoId, channelId);

  return (
    <>
      <ViewMask
        isScreenLocked={isScreenLocked}
        unlockCountDown={unlockCountDown}
        onPressIn={async () => {
          await setBrightness(initialBrightness);
          startUnlockCountDown();
        }}
        onPressOut={async () => {
          resetUnlockCountDown();
          if (!isScreenLocked) return;
          await setBrightness(DIMMED_SCREEN_BRIGHTNESS);
        }}
      />
      <ViewContainerWithStatusBar
        testID={VIEW_ID}
        style={{
          width: "100%",
          height: "100%",
          zIndex: isScreenLocked ? 1 : 2,
        }}
      >
        <View style={{ flex: 1, height: "100%" }}>
          <MainView>
            {!isFullScreenMode && (
              <Text
                style={{ color: "white", textAlign: "center", fontSize: 16, paddingBottom: 10 }}
              >
                {videoTitle}
              </Text>
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
                  width: isFullScreenMode ? "87%" : "75%",
                  height: "100%",
                  backgroundColor: "#000",
                  borderWidth: 1,
                  borderColor: "white",
                }}
              >
                <WebView
                  testID="embeddedVideo"
                  style={{
                    width: "100%",
                    height: "100%",
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
                    <FullViewIconButtons iconName="back" onPress={nav.goBack} />
                  </>
                ) : (
                  <>
                    <HalfViewIconButton
                      iconName="youtubeTv"
                      onPress={toYoutubeVideo}
                      text="Watch on youtube"
                    />
                    <HalfViewIconButton iconName="back" onPress={nav.goBack} text="Back" />
                  </>
                )}
              </SideBar>
            </View>
          </MainView>
          {(isScreenLocked || !isFullScreenMode) && (
            <ControlBar>
              {isScreenLocked && (
                <Text
                  style={{
                    color: "white",
                    fontSize: 18,
                    fontWeight: "bold",
                    padding: 5,
                    textAlign: "center",
                  }}
                >
                  Screen is locked. Press and hold anywhere to unlock.
                </Text>
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
                  <Button
                    onPress={toYoutubeChannel}
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "#282828",
                      borderRadius: 1000,
                    }}
                    hitSlop={{ left: 30, right: 30, bottom: 0, top: 0 }}
                  >
                    <Image
                      testID="channelImage"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 1000,
                      }}
                      source={{ uri: channelThumbnailUrl }}
                    />
                    <Text style={{ color: "white", textAlign: "center", margin: 10 }}>
                      {channelTitle}
                    </Text>
                  </Button>
                </View>
              )}
            </ControlBar>
          )}
        </View>
        <AdBanner />
      </ViewContainerWithStatusBar>
    </>
  );
};

const ViewMask = ({ isScreenLocked, onPressIn, onPressOut, unlockCountDown }) => {
  if (!isScreenLocked) return null;

  const shouldShowUnlockCountdown = unlockCountDown >= 0;

  return (
    <Pressable
      testID="lockScreen"
      style={{
        position: "absolute",
        height: "100%",
        width: "100%",
        zIndex: 2,
      }}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      android_disableSound
    >
      <View
        style={{
          position: "absolute",
          height: "100%",
          width: "100%",
          backgroundColor: "black",
          opacity: shouldShowUnlockCountdown ? 0.9 : 0.5,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {shouldShowUnlockCountdown ? (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>Unlocking</Text>
            <LoadingSpinner style={{ margin: 20 }} />
            <Text
              style={{ color: "white", fontSize: 16, fontWeight: "bold" }}
            >{`Continue holding for ${Math.ceil(unlockCountDown)} seconds`}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
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
