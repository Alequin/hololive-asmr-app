import React from "react";
import { View } from "react-native";

export const MainView = (props) => (
  <View
    {...props}
    style={[
      {
        flex: 1,
        backgroundColor: "#000",
      },
      props.style,
    ]}
  />
);
