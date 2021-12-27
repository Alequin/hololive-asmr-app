import React from "react";
import { RetryErrorMessage } from "./retry-error-message";

export const ErrorRequestingVideosMessage = ({ onPressRefresh }) => {
  return (
    <RetryErrorMessage
      onPressRetry={onPressRefresh}
      colour="white"
      message="Sorry, there was an issue requesting the videos"
    />
  );
};
