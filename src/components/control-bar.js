import React from "react";
import { View } from "react-native";

export const ControlBar = (props) => (
  <View
    {...props}
    style={[
      {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
      },
      props.style,
    ]}
  />
);
