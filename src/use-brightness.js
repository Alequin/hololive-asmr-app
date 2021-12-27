import * as Brightness from "expo-brightness";
import { showToast } from "./show-toast";

export const useBrightness = () => {
  return {
    setBrightness: async (brightnessLevel) =>
      Brightness.getPermissionsAsync().then(
        ({ granted }) =>
          granted && Brightness.setBrightnessAsync(brightnessLevel)
      ),
    resetBrightness: async () =>
      Brightness.getPermissionsAsync().then(
        ({ granted }) => granted && Brightness.useSystemBrightnessAsync()
      ),
  };
};

export const requestBrightnessPermissions = async () => {
  try {
    const { granted } = await Brightness.requestPermissionsAsync();
    if (!granted)
      showToast(
        "Permission is required to dim the brightness when locking the screen",
        5000
      );
  } catch (error) {
    // If this fails permission will be requested at another time. Do not throw
  }
};
