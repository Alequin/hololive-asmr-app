import React from "react";
import { Image } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

export const VideoButton = ({ thumbnailUrl, size, onSelectVideo }) => {
  return (
    <TouchableOpacity
      style={{ width: size, height: size }}
      onPress={onSelectVideo}
    >
      <Image
        style={{ width: "100%", height: "100%", resizeMode: "stretch" }}
        source={{ uri: thumbnailUrl }}
      />
    </TouchableOpacity>
  );
};
