import React from "react";
import { RetryErrorMessage } from "./retry-error-message";

export const ErrorLoadingFavoriteVideos = ({ onPressRefresh }) => {
  return (
    <RetryErrorMessage
      onPressRetry={onPressRefresh}
      colour="white"
      message="Sorry, there was an issue fetching your favorite videos"
    />
  );
};
