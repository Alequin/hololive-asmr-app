import { useEffect, useState } from "react";
import { BackHandler } from "react-native";

const DIMMED_SCREEN_BRIGHTNESS = 0.01;

export const useLockScreen = ({ setBrightness }) => {
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
