import * as Linking from "expo-linking";
import * as Localization from "expo-localization";

export const toYoutubeChannel = (channelId) =>
  Linking.openURL(`https://www.youtube.com/channel/${channelId}`);

// embedded video docs - https://developers.google.com/youtube/player_parameters
const dontAutoPlayVideo = "autoplay=0";
const shouldShowVideoControls = "controls=1";
const interfaceLanguage = `hl=${Localization.locale}`; // TODO - set this based on device locale
const hideFullScreenOption = "fs=0";
const EMBEDDED_PLAYER_CONFIG_QUERY_STRING = `${dontAutoPlayVideo}&${shouldShowVideoControls}&${interfaceLanguage}&${hideFullScreenOption}`;

export const youtubeEmbeddedVideoUri = (videoId) =>
  `https://www.youtube.com/embed/${videoId}?${EMBEDDED_PLAYER_CONFIG_QUERY_STRING}`;
