import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { AdBanner } from "./ad-banner";
import { AppContext } from "./app-context";
import { LoadingSpinner } from "./components/loading-spinner";
import { HomeView } from "./views/home-view/home-view";
import { useLockScreen } from "./views/video-view.js/hooks/use-lock-screen";
import { VideoView } from "./views/video-view.js/video-view";

const Stack = createNativeStackNavigator();

export const Navigation = () => {
  const {
    isScreenLocked,
    unlockCountDown,
    lockScreen,
    startUnlockingScreen,
    resetUnlockCountDown,
  } = useLockScreen();

  return (
    <AppContext.Provider
      value={{
        isScreenLocked,
        lockScreen,
      }}
    >
      <ViewMask
        isScreenLocked={isScreenLocked}
        unlockCountDown={unlockCountDown}
        onPressIn={startUnlockingScreen}
        onPressOut={resetUnlockCountDown}
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
        <AdBanner />
      </NavigationContainer>
    </AppContext.Provider>
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
