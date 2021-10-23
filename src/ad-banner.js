import { AdMobBanner } from "expo-ads-admob";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { isEnvironmentProduction } from "./environment";
import secrets from "./secrets";
import { useIsAppStateActive } from "./use-app-state";

export const AdBanner = () => {
  const isAppActive = useIsAppStateActive();
  const [shouldShowAd, setShouldShowAd] = useState(true);

  useEffect(() => {
    if (isAppActive && !shouldShowAd) setShouldShowAd(true);
  }, [isAppActive]);

  return (
    <>
      <View style={{ width: "100%", height: 1, backgroundColor: "white" }} />
      {shouldShowAd && (
        <AdMobBanner
          style={{ alignItems: "center" }}
          bannerSize="smartBanner"
          servePersonalizedAds={false}
          adUnitID={
            isEnvironmentProduction()
              ? secrets.addBannerId
              : "ca-app-pub-3940256099942544/6300978111"
          }
          onAdViewDidReceiveAd={() => setShouldShowAd(true)}
          onDidFailToReceiveAdWithError={() => setShouldShowAd(false)}
        />
      )}
    </>
  );
};
