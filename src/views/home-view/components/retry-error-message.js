import React, { useState } from "react";
import { View } from "react-native";
import { Button } from "../../../components/button";
import { FullScreenLoadingSpinner } from "../../../components/full-screen-loading-spinner";
import { Icon } from "../../../icons";
import { StyledText } from "../../../styled-text";

export const RetryErrorMessage = ({
  onPressRetry,
  message,
  retryMessage,
  colour,
}) => {
  const [isRetrying, setIsRetrying] = useState(null);

  return isRetrying ? (
    <FullScreenLoadingSpinner colour={colour} />
  ) : (
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
        onPress={async () => {
          setIsRetrying(true);
          await wait(1000); // Delay for one second to show loading indicator
          await onPressRetry();
          setIsRetrying(false);
        }}
      >
        <StyledText style={{ color: colour, marginBottom: 5 }} fontSize={16}>
          {message}
        </StyledText>
        <StyledText style={{ color: colour, marginBottom: 20 }} fontSize={16}>
          {retryMessage || `Press anywhere to refresh and try again`}
        </StyledText>
        <Icon name="refresh" color={colour} size={50} />
      </Button>
    </View>
  );
};

const wait = (time) => new Promise((r) => setTimeout(r, time));
