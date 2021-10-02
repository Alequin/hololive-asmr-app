import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { HomeView } from "./views/home-view/home-view";
import { VideoView } from "./views/video-view.js/video-view";

const Stack = createNativeStackNavigator();

export const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Root"
          component={HomeView}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="videoView" component={VideoView} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
