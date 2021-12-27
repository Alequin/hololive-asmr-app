import React from "react";
import { DetailedVideoList } from "./detailed-video-list";
import { ThumbnailVideoList } from "./thumbnail-video-list";

export const VideoList = ({ isDetailedViewMode, ...otherProps }) => {
  return isDetailedViewMode ? (
    <DetailedVideoList {...otherProps} />
  ) : (
    <ThumbnailVideoList {...otherProps} />
  );
};
