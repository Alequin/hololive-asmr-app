import React, { useEffect, useMemo } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { firstLoadState } from "./src/async-storage";
import { StatusBar } from "./src/components/status-bar";
import { turnApiOn } from "./src/external-requests/turn-api-on";
import { Navigation } from "./src/navigation";
import { requestBrightnessPermissions } from "./src/use-brightness";

export const App = () => {
  useEffect(() => {
    turnApiOn();
  }, []);

  useMemo(() => {
    // If user has not used the app before make a call to the api
    // to wake them up and speed up the first request for videos
    firstLoadState
      .load()
      .then((hasUserLoadedTheAppBefore) => {
        if (!hasUserLoadedTheAppBefore) {
          requestBrightnessPermissions();
          firstLoadState.save(true);
        }
      })
      .catch(() => {
        requestBrightnessPermissions();
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
