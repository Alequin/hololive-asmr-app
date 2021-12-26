import { useNavigation } from "@react-navigation/core";
import { useCallback } from "react";

export const useNavigateToVideoView = () => {
  const nav = useNavigation();

  return useCallback((video) => nav.navigate("videoView", video), []);
};
