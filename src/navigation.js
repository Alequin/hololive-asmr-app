import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { Dimensions, Image, Text, View } from "react-native";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { fakeApiCall } from "./mocks/fake-api-call";

const windowWidth = Dimensions.get("window").width;

const Stack = createNativeStackNavigator();

export const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Root"
          component={HomeView}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="videoView" component={VideoView} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const FullScreenView = (props) => {
  const insets = useSafeAreaInsets();
  return <View {...props} style={[{ paddingTop: insets.top }, props.style]} />;
};

const HomeView = () => {
  return (
    <FullScreenView>
      <ListOfVideos />
    </FullScreenView>
  );
};

const ListOfVideos = () => {
  const nav = useNavigation();
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    fakeApiCall().then(setVideos);
  });

  const numColumns = 2;
  return (
    <FlatList
      style={{ width: "100%", height: "100%" }}
      data={videos}
      numColumns={numColumns}
      keyExtractor={({ id }) => id}
      renderItem={({ item }) => (
        <VideoButton
          size={windowWidth / numColumns}
          title={item.title}
          thumbnails={item.thumbnails}
          onSelectVideo={() =>
            console.log("on click") ||
            nav.navigate("videoView", { videoId: item.id })
          }
        />
      )}
    />
  );
};

const VideoButton = ({ title, thumbnails, size, onSelectVideo }) => {
  return (
    <TouchableOpacity
      style={{ width: size, height: size }}
      onPress={onSelectVideo}
    >
      <Image
        style={{ width: "100%", height: "100%", resizeMode: "stretch" }}
        source={{ uri: thumbnails.medium.url }}
      />
    </TouchableOpacity>
  );
};

const VideoView = ({ route }) => {
  return (
    <WebView
      style={{ width: "100%", height: "100%" }}
      originWhitelist={["*"]}
      source={{
        uri: `https://www.youtube.com/embed/${route.params.videoId}?rel=0&autoplay=0&showinfo=0&controls=1&start=60`,
      }}
    />
  );
};
