import { useEffect, useState } from "react";

export const useUnlockCountDown = (isScreenLocked, unlockScreen) => {
  const [unlockCountDown, setUnlockCountDown] = useState(-1);

  const shouldStartUnlockCountdown = unlockCountDown > 0;
  useEffect(() => {
    if (shouldStartUnlockCountdown) {
      const interval = setInterval(() => setUnlockCountDown((value) => value - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [isScreenLocked, shouldStartUnlockCountdown]);

  useEffect(() => {
    if (isScreenLocked && unlockCountDown === 0) {
      setUnlockCountDown(-1);
      unlockScreen();
    }
  }, [unlockCountDown]);

  return {
    unlockCountDown,
    startUnlockCountDown: () => setUnlockCountDown(4),
    resetUnlockCountDown: () => setUnlockCountDown(-1),
  };
};
