import { useEffect, useState } from "react";
import { AppState } from "react-native";

export const useIsAppStateActive = () => {
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    AppState.addEventListener("change", setAppState);
    return () => AppState.removeEventListener("change", setAppState);
  }, []);

  return appState === "active";
};
