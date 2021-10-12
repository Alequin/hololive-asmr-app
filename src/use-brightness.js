import * as Brightness from "expo-brightness";
import { showToast } from "./show-toast";

export const useBrightness = () => {
  return {
    getBrightness: async () =>
      Brightness.getPermissionsAsync().then(
        ({ granted }) => granted && Brightness.getBrightnessAsync()
      ),
    setBrightness: async (brightnessLevel) =>
      Brightness.getPermissionsAsync().then(
        ({ granted }) => granted && Brightness.setBrightnessAsync(brightnessLevel)
      ),
  };
};

export const requestBrightnessPermissions = async () => {
  Brightness.requestPermissionsAsync().then(({ granted }) => {
    if (!granted)
      showToast("Permission is required to dim the brightness when locking the screen", 5000);
  });
};
