import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Navigation } from "./src/navigation";

export const App = () => {
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
