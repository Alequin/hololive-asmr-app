import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { firstLoadState } from "./src/async-storage";
import { turnApiOn } from "./src/external-requests/turn-api-on";
import { Navigation } from "./src/navigation";

export const App = () => {
  useMemo(() => {
    // If user has not used the app before make a call to the api
    // to wake them up and speed up the first request for videos
    firstLoadState.load().then((hasUserLoadedTheAppBefore) => {
      if (!hasUserLoadedTheAppBefore) {
        turnApiOn();
        firstLoadState.save(true);
      }
    });
  }, []);

  return (
    <>
      <StatusBar />
      <Navigation />
    </>
  );
};

const AppWithSafeAreaProvider = () => (
  <SafeAreaProvider>
    <App />
  </SafeAreaProvider>
);

export default AppWithSafeAreaProvider;
