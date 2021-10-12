import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { View } from "react-native";
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
    </NavigationContainer>
  );
};
