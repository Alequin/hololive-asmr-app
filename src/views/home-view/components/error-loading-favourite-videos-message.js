import React from "react";
import { RetryErrorMessage } from "./retry-error-message";

export const ErrorLoadingFavouriteVideos = ({ onPressRefresh }) => {
  return (
    <RetryErrorMessage
      onPressRetry={onPressRefresh}
      colour="white"
      message="Sorry, there was an issue fetching your favourite videos"
    />
  );
};
