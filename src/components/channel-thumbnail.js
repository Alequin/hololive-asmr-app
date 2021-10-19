import React from "react";
import { Image } from "react-native";
import { isSmallScreen } from "../window";

const BASE_SIZE = isSmallScreen ? 35 : 40;

export const ChannelThumbnail = ({ channelThumbnailUrl, size = BASE_SIZE }) => {
  return (
    <Image
      testID="channelImage"
      style={{
        width: size,
        height: size,
        borderRadius: 1000,
      }}
      source={{ uri: channelThumbnailUrl }}
    />
  );
};
