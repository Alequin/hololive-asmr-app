import React from "react";
import { LoadingSpinner } from "./loading-spinner";

export const FullScreenLoadingSpinner = ({ colour }) => {
  return <LoadingSpinner color={colour} style={{ flex: 1 }} />;
};
