import React from "react";
import { ViewContainerWithStatusBar } from "../view-container-with-status-bar";
import { ListOfVideos } from "./list-of-videos";

export const HomeView = () => {
  return (
    <ViewContainerWithStatusBar>
      <ListOfVideos />
    </ViewContainerWithStatusBar>
  );
};
