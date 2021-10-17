import { useCallback, useEffect, useState } from "react";
import { BackHandler } from "react-native";
import { useBrightness } from "../../../use-brightness";

export const INITIAL_UNLOCK_COUNTDOWN = 5;
const DIMMED_SCREEN_BRIGHTNESS = 0.01;

export const useLockScreen = () => {
  const [preLockScreenBrightness, setPreLockScreenBrightness] = useState(null);
  const { getBrightness, setBrightness } = useBrightness();

  const [isScreenLocked, setIsScreenLocked] = useState(false);
  const [unlockPressCount, setUnlockPressCount] = useState(INITIAL_UNLOCK_COUNTDOWN);

  const unlockScreen = useCallback(async () => {
    setIsScreenLocked(false);
    await setBrightness(preLockScreenBrightness);
  }, [preLockScreenBrightness]);

  const resetUnlockCount = useCallback(() => setUnlockPressCount(INITIAL_UNLOCK_COUNTDOWN), []);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      resetUnlockCount();
      await setBrightness(DIMMED_SCREEN_BRIGHTNESS);
    }, 3000);
    return () => clearTimeout(timeout);
  }, [unlockPressCount, resetUnlockCount]);

  useEffect(() => {
    const shouldUnlock = unlockPressCount <= 0;
    if (shouldUnlock) {
      unlockScreen();
      resetUnlockCount();
    }
  }, [unlockPressCount, resetUnlockCount]);

  useEffect(() => {
    if (isScreenLocked) {
      const backHandler = BackHandler.addEventListener("hardwareBackPress", () => isScreenLocked);
      return () => backHandler.remove();
    }
  }, [isScreenLocked]);

  return {
    isScreenLocked,
    unlockPressCount,
    lockScreen: useCallback(async () => {
      setPreLockScreenBrightness(await getBrightness());
      setIsScreenLocked(true);
      await setBrightness(DIMMED_SCREEN_BRIGHTNESS);
    }, [getBrightness, setBrightness]),
    onPressLockScreen: useCallback(async () => {
      if (unlockPressCount === INITIAL_UNLOCK_COUNTDOWN) {
        await setBrightness(preLockScreenBrightness);
      }
      setUnlockPressCount((count) => count - 1);
    }, [unlockPressCount, setBrightness, preLockScreenBrightness]),
  };
};
