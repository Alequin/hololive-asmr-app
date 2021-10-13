import { useNavigation } from "@react-navigation/core";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { AdBanner } from "../../ad-banner";
import { ControlBar } from "../../components/control-bar";
import { IconButton } from "../../components/icon-button";
import { LoadingSpinner } from "../../components/loading-spinner";
import { MainView } from "../../components/main-view";
import { useBrightness } from "../../use-brightness";
import { isSmallScreen } from "../../window";
import { ViewContainerWithStatusBar } from "../view-container-with-status-bar";
import { useInitialBrightness } from "./hooks/use-initial-brightness";
import { useLockScreen } from "./hooks/use-lock-screen";
import { useUnlockCountDown } from "./hooks/use-unlock-count-down";
import * as youtubeLinks from "./youtube-links";

const VIEW_ID = "videoView";
const DIMMED_SCREEN_BRIGHTNESS = 0.01;

export const VideoView = ({ route }) => {
  const { getBrightness, setBrightness } = useBrightness();
  const initialBrightness = useInitialBrightness({ getBrightness, setBrightness });
  const { isScreenLocked, unlockScreen, lockScreen } = useLockScreen({ setBrightness });
  const { unlockCountDown, startUnlockCountDown, resetUnlockCountDown } = useUnlockCountDown(
    isScreenLocked,
    unlockScreen
  );

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
          <MainView
            style={{
              paddingHorizontal: 20,
            }}
          >
            <WebView
              testID="embeddedVideo"
              style={{ width: "100%", height: "100%", backgroundColor: "#000" }}
              originWhitelist={["*"]}
              source={{
                uri: youtubeLinks.youtubeEmbeddedVideoUri(route.params.videoId),
              }}
            />
          </MainView>
          {isScreenLocked && (
            <ControlBar>
              <Text style={{ color: "white", fontSize: 20, fontWeight: "bold", padding: 5 }}>
                Screen is locked. Press and hold anywhere to unlock.
              </Text>
            </ControlBar>
          )}
          {!isScreenLocked && isSmallScreen && (
            <>
              <ControlBar>
                <ViewOnYoutubeButton videoId={route.params.videoId} />
                <ViewYoutubeChannelButton
                  channelId={route.params.channelId}
                  channelTitle={route.params.channelTitle}
                />
              </ControlBar>
              <ControlBar>
                <LockButton lockScreen={lockScreen} />
                <BackButton />
              </ControlBar>
            </>
          )}
          {!isScreenLocked && !isSmallScreen && (
            <ControlBar>
              <LockButton lockScreen={lockScreen} />
              <ViewOnYoutubeButton videoId={route.params.videoId} />
              <ViewYoutubeChannelButton
                channelId={route.params.channelId}
                channelTitle={route.params.channelTitle}
              />
              <BackButton />
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

const LockButton = ({ lockScreen }) => (
  <IconButton iconName="lock" onPress={lockScreen} text="Lock Screen" />
);

const ViewOnYoutubeButton = ({ videoId }) => (
  <IconButton
    iconName="youtubeTv"
    onPress={() => youtubeLinks.toYoutubeVideo(videoId)}
    text="Watch on youtube"
  />
);

const ViewYoutubeChannelButton = ({ channelId, channelTitle }) => (
  <IconButton
    iconName="youtubeSubscription"
    onPress={() => youtubeLinks.toYoutubeChannel(channelId)}
    text={channelTitle}
  />
);

const BackButton = () => {
  const nav = useNavigation();
  return <IconButton iconName="back" onPress={() => nav.navigate("homeView")} text="Back" />;
};
