import React from "react";
import { Text, View } from "react-native";
import { Button } from "../../../components/button";
import { Icon } from "../../../icons";

export const ErrorRequestingVideosMessage = ({ onPressRefresh }) => {
  return (
    <View style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>
      <Button
        style={{ width: "90%", height: "90%", justifyContent: "center", alignItems: "center" }}
        onPress={onPressRefresh}
      >
        <Text style={{ color: "white", marginBottom: 5, fontSize: 16 }}>
          Sorry, there was an issue requesting the videos
        </Text>
        <Text style={{ color: "white", marginBottom: 20, fontSize: 16 }}>
          Press anywhere to refresh and try again
        </Text>
        <Icon name="refresh" color="white" size={50} />
      </Button>
    </View>
  );
};