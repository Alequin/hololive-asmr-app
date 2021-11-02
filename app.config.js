import { googleMobileAdsAppId } from "./secrets.json";

const version = 6;

export default {
  name: "Hololive ASMR Catalog",
  slug: "hololive-asmr-catalog",
  version: `${version}.0.0`,
  orientation: "landscape",
  icon: "./assets/images/icon.png",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
  },
  android: {
    package: "com.just_for_fun.hololive_asmr_catalog",
    versionCode: version,
    permissions: ["WRITE_SETTINGS"], // Use minimum permissions (https://docs.expo.dev/versions/latest/config/app/#permissions)
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#000000",
    },
    config: {
      googleMobileAdsAppId,
    },
  },
};
