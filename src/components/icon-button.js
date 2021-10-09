import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { Icon } from "../icons";

export const IconButton = ({ iconName, iconSize = 24, onPress, text }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        marginHorizontal: 5,
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
      <Text style={{ color: "white", marginHorizontal: 5 }}>{text}</Text>
    </TouchableOpacity>
  );
};
