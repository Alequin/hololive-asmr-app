import { useNavigation } from "@react-navigation/core";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";
import { Icon } from "../../icons";
import { ViewContainerWithStatusBar } from "../view-container-with-status-bar";
import * as youtubeLinks from "./youtube-links";

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
            uri: youtubeLinks.youtubeEmbeddedVideoUri(route.params.videoId),
          }}
        />
      </View>
      <ControlBar>
        <IconButton
          iconName="youtubeTv"
          onPress={() => youtubeLinks.toYoutubeVideo(route.params.videoId)}
          text="Watch on Youtube"
        />
        <IconButton
          iconName="youtubeSubscription"
          onPress={() => youtubeLinks.toYoutubeChannel(route.params.channelId)}
          text={route.params.channelTitle}
        />
        <IconButton
          iconName="back"
          onPress={() => nav.navigate("homeView")}
          text="Back"
        />
      </ControlBar>
    </ViewContainerWithStatusBar>
  );
};

const ControlBar = (props) => (
  <View
    style={{
      flexDirection: "row",
      justifyContent: "space-around",
    }}
    {...props}
  />
);

const IconButton = ({ iconName, onPress, text }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        marginHorizontal: 5,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Icon
        style={{
          alignItems: "center",
          marginHorizontal: 5,
        }}
        name={iconName}
        color="white"
        size={24}
      />
      <Text style={{ color: "white", marginHorizontal: 5 }}>{text}</Text>
    </TouchableOpacity>
  );
};
