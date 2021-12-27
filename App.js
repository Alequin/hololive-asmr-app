import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "./src/components/status-bar";
import { turnApiOn } from "./src/external-requests/turn-api-on";
import { Navigation } from "./src/navigation";
import { requestBrightnessPermissions } from "./src/use-brightness";

export const App = () => {
  useEffect(() => {
    requestBrightnessPermissions();
    turnApiOn();
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
