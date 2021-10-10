import { useNavigation } from "@react-navigation/core";
import * as Brightness from "expo-brightness";
import React, { useEffect, useState } from "react";
import { BackHandler, Pressable, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { ControlBar } from "../../components/control-bar";
import { IconButton } from "../../components/icon-button";
import { LoadingSpinner } from "../../components/loading-spinner";
import { MainView } from "../../components/main-view";
import { ViewContainerWithStatusBar } from "../view-container-with-status-bar";
import * as youtubeLinks from "./youtube-links";

const VIEW_ID = "videoView";
const DIMMED_SCREEN_BRIGHTNESS = 0.01;

export const VideoView = ({ route }) => {
  const nav = useNavigation();
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
        <View style={{ width: "100%", height: "100%" }}>
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
          <ControlBar>
            {isScreenLocked ? (
              <Text style={{ color: "white", fontSize: 20, fontWeight: "bold", padding: 5 }}>
                Screen is locked. Press and hold anywhere to unlock.
              </Text>
            ) : (
              <>
                <IconButton iconName="lock" onPress={lockScreen} text="Lock Screen" />
                <IconButton
                  iconName="youtubeSubscription"
                  onPress={() => youtubeLinks.toYoutubeChannel(route.params.channelId)}
                  text={route.params.channelTitle}
                />
                <IconButton iconName="back" onPress={() => nav.navigate("homeView")} text="Back" />
              </>
            )}
          </ControlBar>
        </View>
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
            <Text style={{ color: "white" }}>Unlocking</Text>
            <LoadingSpinner style={{ margin: 20 }} />
            <Text style={{ color: "white" }}>{`Continue holding for ${Math.ceil(
              unlockCountDown
            )} seconds`}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
};

const useBrightness = () => {
  const statusPromise = Brightness.requestPermissionsAsync();

  return {
    getBrightness: async () =>
      statusPromise.then(async ({ granted }) => granted && Brightness.getBrightnessAsync()),
    setBrightness: async (brightnessLevel) =>
      statusPromise.then(
        async ({ granted }) => granted && Brightness.setBrightnessAsync(brightnessLevel)
      ),
  };
};

const useInitialBrightness = ({ getBrightness, setBrightness }) => {
  const [initialBrightness, setInitialBrightness] = useState(null);

  useEffect(() => {
    let brightnessToResetTo = null;
    getBrightness().then((brightness) => {
      brightnessToResetTo = brightness;
      setInitialBrightness(brightness);
    });
    return async () => setBrightness(brightnessToResetTo);
  }, []);

  return initialBrightness;
};

const useLockScreen = ({ setBrightness }) => {
  const [isScreenLocked, setIsScreenLocked] = useState(false);

  useEffect(() => {
    if (isScreenLocked) {
      setBrightness(isScreenLocked ? DIMMED_SCREEN_BRIGHTNESS : initialBrightness);
    }
  }, [isScreenLocked]);

  useEffect(() => {
    if (isScreenLocked) {
      const backHandler = BackHandler.addEventListener("hardwareBackPress", () => isScreenLocked);
      return () => backHandler.remove();
    }
  }, [isScreenLocked]);

  return {
    isScreenLocked,
    unlockScreen: () => setIsScreenLocked(false),
    lockScreen: () => setIsScreenLocked(true),
  };
};

const useUnlockCountDown = (isScreenLocked, unlockScreen) => {
  const [unlockCountDown, setUnlockCountDown] = useState(-1);

  const shouldStartUnlockCountdown = unlockCountDown > 0;
  useEffect(() => {
    if (shouldStartUnlockCountdown) {
      const interval = setInterval(() => setUnlockCountDown((value) => value - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [isScreenLocked, shouldStartUnlockCountdown]);

  useEffect(() => {
    if (isScreenLocked && unlockCountDown === 0) {
      setUnlockCountDown(-1);
      unlockScreen();
    }
  }, [unlockCountDown]);

  return {
    unlockCountDown,
    startUnlockCountDown: () => setUnlockCountDown(4),
    resetUnlockCountDown: () => setUnlockCountDown(-1),
  };
};
