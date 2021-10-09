import React from "react";
import { Image } from "react-native";
import { Button } from "../../../components/button";

export const VideoButton = ({ thumbnailUrl, size, onSelectVideo }) => {
  return (
    <Button
      testID="videoButton"
      style={{ width: size, height: size }}
      onPress={onSelectVideo}
    >
      <Image
        testID="videoImageBackground"
        style={{ width: "100%", height: "100%", resizeMode: "stretch" }}
        source={{ uri: thumbnailUrl }}
      />
    </Button>
  );
};
