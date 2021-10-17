import { useCallback, useState } from "react";

export const useIsFullScreenMode = () => {
  const [isFullScreenMode, setIsFullScreenMode] = useState(false);

  return {
    isFullScreenMode,
    toggleFullScreenMode: useCallback(() => setIsFullScreenMode((value) => !value), []),
  };
};
