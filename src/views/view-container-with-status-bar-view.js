import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ViewContainer } from "./view-container";

export const ViewContainerWithStatusBarView = (props) => {
  const insets = useSafeAreaInsets();
  return (
    <ViewContainer
      {...props}
      style={[{ paddingTop: insets.top }, props.style]}
    />
  );
};
