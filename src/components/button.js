import React from "react";
import { TouchableOpacity } from "react-native";

export const Button = (props) => (
  <TouchableOpacity
    accessibilityRole="button"
    {...props}
    style={[{ opacity: props.disabled ? 0.5 : 1 }, props.style]}
  />
);
