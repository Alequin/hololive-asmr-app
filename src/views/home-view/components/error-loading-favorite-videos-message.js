import React from "react";
import { View } from "react-native";
import { Button } from "../../../components/button";
import { Icon } from "../../../icons";
import { StyledText } from "../../../styled-text";

export const ErrorLoadingFavoriteVideos = ({ onPressRefresh }) => {
  return (
    <View
      style={{
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Button
        style={{
          width: "90%",
          height: "90%",
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={onPressRefresh}
      >
        <StyledText style={{ color: "white", marginBottom: 5 }} fontSize={16}>
          Sorry, there was an issue fetching your favorite videos
        </StyledText>
        <StyledText style={{ color: "white", marginBottom: 20 }} fontSize={16}>
          Press anywhere to refresh and try again
        </StyledText>
        <Icon name="refresh" color="white" size={50} />
      </Button>
    </View>
  );
};
