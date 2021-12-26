import React from "react";
import { View } from "react-native";
import { Button } from "../../../components/button";
import { Icon } from "../../../icons";
import { StyledText } from "../../../styled-text";

export const ErrorRequestingChannelsMessage = ({ onPressRefresh }) => {
  return (
    <View
      style={{
        width: "100%",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Button
        style={{
          width: "90%",
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={onPressRefresh}
      >
        <StyledText style={{ marginBottom: 5 }} fontSize={16}>
          Sorry, there was an issue requesting the list of channels
        </StyledText>
        <StyledText style={{ marginBottom: 20 }} fontSize={16}>
          Press to refresh and try again
        </StyledText>
        <Icon name="refresh" color="black" size={50} />
      </Button>
    </View>
  );
};
