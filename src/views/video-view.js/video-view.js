import { useNavigation } from "@react-navigation/core";
import React from "react";
import { WebView } from "react-native-webview";
import { ControlBar } from "../../components/control-bar";
import { IconButton } from "../../components/icon-button";
import { MainView } from "../../components/main-view";
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
      <MainView
        style={{
          paddingHorizontal: 20,
        }}
      >
        <WebView
          style={{ width: "100%", height: "100%", backgroundColor: "#000" }}
          originWhitelist={["*"]}
          source={{
            uri: youtubeLinks.youtubeEmbeddedVideoUri(route.params.videoId),
          }}
        />
      </MainView>
      <ControlBar>
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
