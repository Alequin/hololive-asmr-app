import * as Linking from "expo-linking";
import { locale } from "../../environment";

export const toYoutubeVideo = (videoId) =>
  Linking.openURL(`https://www.youtube.com/watch?v=${videoId}`);

export const toYoutubeChannel = (channelId) =>
  Linking.openURL(`https://www.youtube.com/channel/${channelId}`);

// embedded video docs - https://developers.google.com/youtube/player_parameters
const dontAutoPlayVideo = "autoplay=0";
const shouldShowVideoControls = "controls=1";
const hideFullScreenOption = "fs=0";
const BASE_EMBEDDED_PLAYER_CONFIG_QUERY_STRING = `${dontAutoPlayVideo}&${shouldShowVideoControls}&${hideFullScreenOption}`;

export const youtubeEmbeddedVideoUri = (videoId) => {
  const interfaceLanguage = `hl=${locale()}`;
  return `https://www.youtube.com/embed/${videoId}?${BASE_EMBEDDED_PLAYER_CONFIG_QUERY_STRING}&${interfaceLanguage}`;
};
