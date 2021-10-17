import { useCallback, useEffect, useState } from "react";
import { BackHandler } from "react-native";
import { useBrightness } from "../../../use-brightness";
import { useUnlockCountDown } from "./use-unlock-count-down";

const DIMMED_SCREEN_BRIGHTNESS = 0.01;

export const useLockScreen = () => {
  const [preLockScreenBrightness, setPreLockScreenBrightness] = useState(null);
  const { getBrightness, setBrightness } = useBrightness();
  const [isScreenLocked, setIsScreenLocked] = useState(false);

  const unlockScreen = useCallback(async () => {
    setIsScreenLocked(false);
    await setBrightness(preLockScreenBrightness);
  }, [setBrightness]);

  const { unlockCountDown, startUnlockCountDown, resetUnlockCountDown } = useUnlockCountDown();

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

  useEffect(() => {
    if (isScreenLocked && unlockCountDown === 0) {
      resetUnlockCountDown();
      unlockScreen();
    }
  }, [unlockCountDown]);

  return {
    isScreenLocked,
    unlockCountDown,
    resetUnlockCountDown: async () => {
      resetUnlockCountDown();
      if (!isScreenLocked) return;
      await setBrightness(DIMMED_SCREEN_BRIGHTNESS);
    },
    startUnlockingScreen: useCallback(async () => {
      await setBrightness(preLockScreenBrightness);
      startUnlockCountDown();
    }, [setBrightness, preLockScreenBrightness]),
    unlockScreen: () => {
      resetUnlockCountDown();
      unlockScreen();
    },
    lockScreen: useCallback(async () => {
      setPreLockScreenBrightness(await getBrightness());
      setIsScreenLocked(true);
    }, []),
  };
};
