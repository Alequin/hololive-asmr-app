import React from "react";
import { TouchableOpacity } from "react-native";

export const Button = (props) => (
  <TouchableOpacity accessibilityRole="button" {...props} />
);
