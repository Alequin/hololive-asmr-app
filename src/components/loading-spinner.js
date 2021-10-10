import React from "react";
import { ActivityIndicator } from "react-native";

export const LoadingSpinner = (props) => {
  return <ActivityIndicator size="large" color="#fff" {...props} />;
};
