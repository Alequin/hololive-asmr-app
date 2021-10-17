import React from "react";
import { Image } from "react-native";

export const ChannelThumbnail = ({ channelThumbnailUrl, size = 40 }) => {
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
