import React from "react";
import { ActivityIndicator } from "react-native";

export const LoadingSpinner = (props) => {
  return (
    <ActivityIndicator
      testID="loadingIndicator"
      size="large"
      color="#fff"
      {...props}
    />
  );
};
