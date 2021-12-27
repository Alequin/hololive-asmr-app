import React from "react";
import { RetryErrorMessage } from "./retry-error-message";

export const ErrorRequestingChannelsMessage = ({ onPressRefresh }) => {
  return (
    <RetryErrorMessage
      onPressRetry={onPressRefresh}
      colour="black"
      message="Sorry, there was an issue requesting the list of channels"
      retryMessage="Press to refresh and try again"
    />
  );
};
