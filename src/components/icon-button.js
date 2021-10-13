import React from "react";
import { Text } from "react-native";
import { Icon } from "../icons";
import { Button } from "./button";

export const IconButton = ({ iconName, iconSize = 24, onPress, text }) => {
  return (
    <Button
      onPress={onPress}
      style={{
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        padding: 10,
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
