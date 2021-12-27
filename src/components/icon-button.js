import React from "react";
import { Icon } from "../icons";
import { StyledText } from "../styled-text";
import { Button } from "./button";

export const IconButton = ({
  iconName,
  iconSize = 24,
  onPress,
  text,
  style,
}) => {
  return (
    <Button onPress={onPress} style={style}>
      <Icon
        style={{
          alignItems: "center",
          marginHorizontal: 5,
        }}
        name={iconName}
        color="white"
        size={iconSize}
      />
      {text && (
        <StyledText
          style={{
            color: "white",
            marginHorizontal: 5,
            textAlign: "center",
          }}
        >
          {text}
        </StyledText>
      )}
    </Button>
  );
};
