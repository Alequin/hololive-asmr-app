import { useEffect, useState } from "react";

export const useUnlockCountDown = () => {
  const [unlockCountDown, setUnlockCountDown] = useState(-1);

  const shouldStartUnlockCountdown = unlockCountDown > 0;
  useEffect(() => {
    if (shouldStartUnlockCountdown) {
      const interval = setInterval(() => setUnlockCountDown((value) => value - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [shouldStartUnlockCountdown]);

  return {
    unlockCountDown,
    startUnlockCountDown: () => setUnlockCountDown(4),
    resetUnlockCountDown: () => setUnlockCountDown(-1),
  };
};
