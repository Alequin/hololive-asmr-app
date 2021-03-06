import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ViewContainer } from "./view-container";

export const ViewContainerWithStatusBar = (props) => {
  const insets = useSafeAreaInsets();
  return (
    <ViewContainer
      {...props}
      style={[{ paddingTop: insets.top, flex: 1 }, props.style]}
    />
  );
};
