import React from "react";
import { ViewContainerWithStatusBarView } from "../view-container-with-status-bar-view";
import { ListOfVideos } from "./list-of-videos";

export const HomeView = () => {
  return (
    <ViewContainerWithStatusBarView>
      <ListOfVideos />
    </ViewContainerWithStatusBarView>
  );
};
