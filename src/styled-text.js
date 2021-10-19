import React from "react";
import { Text } from "react-native";
import { isSmallScreen } from "./window";

export const StyledText = (props) => {
  const baseFontSize = props.fontSize || 14;
  return (
    <Text
      {...props}
      style={[
        {
          fontSize: isSmallScreen ? baseFontSize - 2 : baseFontSize,
        },
        props.style,
      ]}
    />
  );
};
