import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import React from "react";

export const StatusBar = ({ isHidden = false }) => (
  <ExpoStatusBar style="light" backgroundColor="black" hidden={isHidden} />
);
