import { AdMobBanner } from "expo-ads-admob";
import React, { useState } from "react";
import { View } from "react-native";
import { isEnvironmentProduction } from "./environment";
import secrets from "./secrets";

export const AdBanner = () => {
  const [shouldShowAd, setShouldShowAd] = useState(true);

  return (
    <>
      <View style={{ width: "100%", height: 1, backgroundColor: "white" }} />
      <AdMobBanner
        style={!shouldShowAd ? { height: 0 } : { alignItems: "center" }}
        bannerSize="smartBanner"
        servePersonalizedAds={false}
        adUnitID={
          isEnvironmentProduction() ? secrets.addBannerId : "ca-app-pub-3940256099942544/6300978111"
        }
        onAdViewDidReceiveAd={() => setShouldShowAd(true)}
        onDidFailToReceiveAdWithError={() => setShouldShowAd(false)}
      />
    </>
  );
};
