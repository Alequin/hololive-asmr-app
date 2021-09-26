import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const FullScreenView = (props) => {
  const insets = useSafeAreaInsets();
  return <View {...props} style={[{ paddingTop: insets.top }, props.style]} />;
};

const HomeView = () => {
  return (
    <FullScreenView>
      <Text>Hello world</Text>
    </FullScreenView>
  );
};
