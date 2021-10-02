import React from "react";
import { View } from "react-native";

export const ViewContainer = (props) => {
  return <View {...props} style={[{ backgroundColor: "#000" }, props.style]} />;
};
