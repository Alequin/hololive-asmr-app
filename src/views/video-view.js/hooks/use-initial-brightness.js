import { useEffect, useState } from "react";

export const useInitialBrightness = ({ getBrightness, setBrightness }) => {
  const [initialBrightness, setInitialBrightness] = useState(null);

  useEffect(() => {
    let brightnessToResetTo = null;
    getBrightness().then((brightness) => {
      brightnessToResetTo = brightness;
      setInitialBrightness(brightness);
    });
    return async () => setBrightness(brightnessToResetTo);
  }, []);

  return initialBrightness;
};
