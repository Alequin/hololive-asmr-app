import React from "react";
import { View } from "react-native";
import { StyledText } from "../../../styled-text";

export const NoFavouriteVideosMessage = () => {
  return (
    <View
      style={{
        width: "100%",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <StyledText style={{ margin: 15, color: "white" }} fontSize={16}>
        {`You don't have any videos in your favourites`}
      </StyledText>
      <StyledText style={{ margin: 15, color: "white" }} fontSize={16}>
        You can add to your favourites while watching a video
      </StyledText>
    </View>
  );
};
