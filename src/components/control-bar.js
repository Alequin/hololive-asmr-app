import React from "react";
import { View } from "react-native";

export const ControlBar = (props) => (
  <View
    style={{
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      height: "12%",
    }}
    {...props}
  />
);
