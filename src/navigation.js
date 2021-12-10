import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useMemo } from "react";
import { Pressable, View } from "react-native";
import { AppContext } from "./app-context";
import { LoadingSpinner } from "./components/loading-spinner";
import { StyledText } from "./styled-text";
import { HomeView } from "./views/home-view/home-view";
import {
  INITIAL_UNLOCK_COUNTDOWN,
  useLockScreen,
} from "./views/video-view.js/hooks/use-lock-screen";
import { VideoView } from "./views/video-view.js/video-view";

const Stack = createNativeStackNavigator();

export const Navigation = () => {
  const { isScreenLocked, unlockPressCount, lockScreen, onPressLockScreen } = useLockScreen();

  return (
    <AppContext.Provider
      value={{
        isScreenLocked,
        lockScreen,
      }}
    >
      <ViewMask
        isScreenLocked={isScreenLocked}
        unlockPressCount={unlockPressCount}
        onPress={onPressLockScreen}
      />
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="homeView"
            component={HomeView}
            options={{ headerShown: false, orientation: "landscape_right" }}
          />
          <Stack.Screen
            name="videoView"
            component={VideoView}
            options={{
              headerShown: false,
              orientation: "landscape_right",
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AppContext.Provider>
  );
};

const ViewMask = ({ isScreenLocked, unlockPressCount, onPress }) => {
  const shouldShowUnlockCountdown = unlockPressCount < INITIAL_UNLOCK_COUNTDOWN;
  const unlockDots = useMemo(
    () =>
      new Array(INITIAL_UNLOCK_COUNTDOWN)
        .fill(null)
        .map((_, index) => ({
          isActive: unlockPressCount <= index,
        }))
        .reverse(),
    [unlockPressCount]
  );

  if (!isScreenLocked) return null;

  return (
    <Pressable
      testID="lockScreen"
      style={{
        position: "absolute",
        height: "100%",
        width: "100%",
        zIndex: 2,
      }}
      onPress={onPress}
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
              width: "100%",
            }}
          >
            <StyledText style={{ color: "white", fontWeight: "bold" }} fontSize={16}>
              Unlocking
            </StyledText>
            <LoadingSpinner style={{ margin: 20 }} />
            <StyledText style={{ color: "white", fontWeight: "bold" }} fontSize={16}>
              {pressToUnlockMessage(unlockPressCount)}
            </StyledText>
            <View
              style={{
                height: 20,
                width: "50%",
                maxWidth: 300,
                flexDirection: "row",
                justifyContent: "space-around",
                alignItems: "center",
                margin: 20,
              }}
            >
              {unlockDots.map(({ isActive }, index) => (
                <View
                  key={index}
                  style={{
                    width: 20,
                    height: 20,
                    backgroundColor: "white",
                    borderRadius: 1000,
                    opacity: isActive ? 1 : 0.25,
                  }}
                />
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
};

const pressToUnlockMessage = (unlockPressCount) =>
  `Press anywhere ${unlockPressCount} more ${unlockPressCount > 1 ? "times" : "time"}`;
