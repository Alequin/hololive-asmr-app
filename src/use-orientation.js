import { useEffect, useState } from "react";
import * as ScreenOrientation from "expo-screen-orientation";

const ORIENTATION_OPTIONS = {
  [0]: "UNKNOWN",
  [1]: "PORTRAIT_UP",
  [2]: "PORTRAIT_DOWN",
  [3]: "LANDSCAPE_LEFT",
  [4]: "LANDSCAPE_RIGHT",
};

export const useOrientation = () => {
  const [orientation, setOrientation] = useState(null);

  useEffect(() => {
    ScreenOrientation.getOrientationAsync().then(setOrientation);
  });

  useEffect(() => {
    const listener = ScreenOrientation.addOrientationChangeListener(({ orientationInfo }) => {
      setOrientation(orientationInfo.orientation);
    });
    return () => ScreenOrientation.removeOrientationChangeListener(listener);
  });

  return ORIENTATION_OPTIONS[orientation];
};
