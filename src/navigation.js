import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AdMobBanner } from "expo-ads-admob";
import React, { useState } from "react";
import { View } from "react-native";
import { isEnvironmentProduction } from "./environment";
import secrets from "./secrets";
import { HomeView } from "./views/home-view/home-view";
import { VideoView } from "./views/video-view.js/video-view";

const Stack = createNativeStackNavigator();

export const Navigation = () => {
  const [shouldShowAd, setShouldShowAd] = useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="homeView"
          component={HomeView}
          options={{ headerShown: false, orientation: "landscape_right" }}
        />
        <Stack.Screen
          name="videoView"
          component={VideoView}
          options={{
            headerShown: false,
            orientation: "landscape_right",
          }}
        />
      </Stack.Navigator>
      <View style={{ width: "100%", height: 3, backgroundColor: "white" }} />
      <AdMobBanner
        style={!shouldShowAd ? { height: 0 } : undefined}
        bannerSize="smartBanner"
        servePersonalizedAds={false}
        adUnitID={
          isEnvironmentProduction() ? secrets.addBannerId : "ca-app-pub-3940256099942544/6300978111"
        }
        onAdViewDidReceiveAd={() => setShouldShowAd(true)}
        onDidFailToReceiveAdWithError={() => setShouldShowAd(false)}
      />
    </NavigationContainer>
  );
};
