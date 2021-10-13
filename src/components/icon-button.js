import React from "react";
import { Text } from "react-native";
import { Icon } from "../icons";
import { isSmallScreen } from "../window";
import { Button } from "./button";

export const IconButton = ({ iconName, iconSize = 24, onPress, text }) => {
  return (
    <Button
      onPress={onPress}
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        padding: 10,
        maxWidth: isSmallScreen ? "50%" : "25%",
      }}
    >
      <Icon
        style={{
          alignItems: "center",
          marginHorizontal: 5,
        }}
        name={iconName}
        color="white"
        size={iconSize}
      />
      <Text style={{ color: "white", marginHorizontal: 5, textAlign: "center" }}>{text}</Text>
    </Button>
  );
};
