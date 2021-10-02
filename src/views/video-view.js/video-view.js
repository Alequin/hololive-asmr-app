import React from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";
import { ViewContainer } from "../view-container";

export const VideoView = ({ route }) => {
  return (
    <ViewContainer
      style={{ width: "100%", height: "100%", backgroundColor: "#000" }}
    >
      <WebView
        style={{ flex: 1, backgroundColor: "#000" }}
        originWhitelist={["*"]}
        source={{
          uri: youtubeEmbeddedVideoUri(route.params.videoId),
        }}
      />
      <View style={{ flex: 1, backgroundColor: "#000" }}></View>
    </ViewContainer>
  );
};

const youtubeEmbeddedVideoUri = (videoId, startTimeInSeconds = 0) => {
  const dontAutoPlayVideo = "autoplay=0";
  const shouldShowVideoControls = "controls=1";
  const timeToStartVideoAt = `start=${startTimeInSeconds}`;
  const interfaceLanguage = `hl=en`;
  const hideFullScreenOption = "fs=0";

  return `https://www.youtube.com/embed/${videoId}?rel=0&${dontAutoPlayVideo}&${shouldShowVideoControls}&${timeToStartVideoAt}&${interfaceLanguage}&${hideFullScreenOption}`;
};
