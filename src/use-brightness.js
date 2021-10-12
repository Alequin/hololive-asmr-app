import * as Brightness from "expo-brightness";

export const useBrightness = () => {
  return {
    getBrightness: async () =>
      Brightness.getPermissionsAsync().then(
        async ({ granted }) => granted && Brightness.getBrightnessAsync()
      ),
    setBrightness: async (brightnessLevel) =>
      Brightness.getPermissionsAsync().then(
        async ({ granted }) => granted && Brightness.setBrightnessAsync(brightnessLevel)
      ),
  };
};

export const requestBrightnessPermissions = async () => Brightness.requestPermissionsAsync();
