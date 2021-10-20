import React from "react";
import { Image } from "react-native";
import { SCREEN_SIZES, withScreenSize } from "../window";

const BASE_SIZE = withScreenSize({
  [SCREEN_SIZES.mini]: 35,
  [SCREEN_SIZES.small]: 30,
  [SCREEN_SIZES.default]: 40,
});

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
