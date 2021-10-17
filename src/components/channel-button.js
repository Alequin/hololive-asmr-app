import React from "react";
import { Text } from "react-native";
import { Button } from "./button";
import { ChannelThumbnail } from "./channel-thumbnail";

const variants = {
  white: {
    backgroundColor: "#ffffff",
    textColor: "#000000",
    border: { borderColor: "#808080" },
  },
  black: {
    backgroundColor: "#282828",
    textColor: "#ffffff",
    border: undefined,
  },
};

export const ChannelButton = ({
  channelTitle,
  channelThumbnailUrl,
  isSelected,
  variant = "white",
  onPress,
  hitSlop = {},
}) => {
  const activeVariant = variants[variant];

  return (
    <Button
      style={{
        borderColor: isSelected ? "black" : activeVariant?.border?.borderColor,
        borderWidth: activeVariant?.border && 1,
        borderRadius: 1000,
        backgroundColor: isSelected
          ? activeVariant.backgroundColor
          : `${activeVariant.backgroundColor}E6`,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      }}
      onPress={onPress}
      hitSlop={hitSlop}
    >
      <ChannelThumbnail channelThumbnailUrl={channelThumbnailUrl} />
      <Text
        style={{
          color: activeVariant.textColor,
          fontWeight: isSelected ? "bold" : "normal",
          marginHorizontal: 10,
        }}
      >
        {channelTitle}
      </Text>
    </Button>
  );
};
