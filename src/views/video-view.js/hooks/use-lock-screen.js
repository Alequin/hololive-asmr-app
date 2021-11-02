import { useCallback, useEffect, useState } from "react";
import { BackHandler } from "react-native";
import { useBrightness } from "../../../use-brightness";

export const INITIAL_UNLOCK_COUNTDOWN = 5;
const DIMMED_SCREEN_BRIGHTNESS = 0;

export const useLockScreen = () => {
  const { setBrightness, resetBrightness } = useBrightness();

  const [isScreenLocked, setIsScreenLocked] = useState(false);
  const [unlockPressCount, setUnlockPressCount] = useState(INITIAL_UNLOCK_COUNTDOWN);

  const resetUnlockCount = useCallback(() => setUnlockPressCount(INITIAL_UNLOCK_COUNTDOWN), []);

  useEffect(() => {
    // Clean unlock presses if enough time passes
    if (isScreenLocked) {
      const timeout = setTimeout(async () => {
        resetUnlockCount();
        await setBrightness(DIMMED_SCREEN_BRIGHTNESS);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [isScreenLocked, unlockPressCount, resetUnlockCount]);

  useEffect(() => {
    // Unlock the screen if the press count is low enough
    if (unlockPressCount <= 0) {
      setIsScreenLocked(false);
      resetBrightness();
      resetUnlockCount();
    }
  }, [unlockPressCount, resetUnlockCount]);

  useEffect(() => {
    // Disable hardware back events while screen is locked
    if (isScreenLocked) {
      const backHandler = BackHandler.addEventListener("hardwareBackPress", () => true);
      return () => backHandler.remove();
    }
  }, [isScreenLocked]);

  return {
    isScreenLocked,
    unlockPressCount,
    lockScreen: useCallback(async () => {
      setIsScreenLocked(true);
      await setBrightness(DIMMED_SCREEN_BRIGHTNESS);
    }, [setBrightness]),
    onPressLockScreen: useCallback(async () => {
      if (unlockPressCount === INITIAL_UNLOCK_COUNTDOWN) await resetBrightness();

      setUnlockPressCount((count) => count - 1);
    }, [unlockPressCount, setBrightness]),
  };
};
