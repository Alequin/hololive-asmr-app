import React from "react";
import { Text } from "react-native";
import { SCREEN_SIZES, withScreenSize } from "./window";

const FONT_SIZE_MODIFIER = withScreenSize({
  [SCREEN_SIZES.mini]: -2,
  [SCREEN_SIZES.small]: -3,
  [SCREEN_SIZES.medium]: 2,
  [SCREEN_SIZES.default]: 0,
});

export const StyledText = (props) => {
  const baseFontSize = props.fontSize || 14;
  return (
    <Text
      {...props}
      style={[
        {
          fontSize: baseFontSize + FONT_SIZE_MODIFIER,
        },
        props.style,
      ]}
    />
  );
};
