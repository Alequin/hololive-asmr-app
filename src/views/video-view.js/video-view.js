import { useNavigation } from "@react-navigation/core";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";
import { Icon } from "../../icons";
import { ViewContainerWithStatusBar } from "../view-container-with-status-bar";

export const VideoView = ({ route }) => {
  const nav = useNavigation();

  return (
    <ViewContainerWithStatusBar
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#000",
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "#000",
          padding: 20,
        }}
      >
        <WebView
          style={{ width: "100%", height: "100%", backgroundColor: "#000" }}
          originWhitelist={["*"]}
          source={{
            uri: youtubeEmbeddedVideoUri(route.params.videoId),
          }}
        />
      </View>
      <FullScreenControls onPressBack={async () => nav.navigate("homeView")} />
    </ViewContainerWithStatusBar>
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

const FullScreenControls = ({ onPressBack }) => {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-around",
      }}
    >
      <IconButton iconName="back" onPress={onPressBack} />
    </View>
  );
};

const IconButton = ({ iconName, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        marginHorizontal: 5,
      }}
    >
      <Icon
        style={{
          alignItems: "center",
          width: "100%",
        }}
        name={iconName}
        color="white"
        size={24}
      />
    </TouchableOpacity>
  );
};
