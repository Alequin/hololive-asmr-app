import { Dimensions } from "react-native";

export const windowWidth = () => Dimensions.get("window").width;
export const windowHeight = () => Dimensions.get("window").height;

export const SCREEN_SIZES = {
  mini: "mini",
  small: "small",
  medium: "medium",
  default: "default",
};

export const isMiniScreen = () => windowWidth() <= 500;
export const isSmallScreen = () => !isMiniScreen() && windowWidth() <= 550;
export const isMediumScreen = () => !isSmallScreen() && windowWidth() <= 800;

export const getCurrentScreenSize = () => {
  if (isMiniScreen()) return SCREEN_SIZES.mini;
  if (isSmallScreen()) return SCREEN_SIZES.small;
  if (isMediumScreen()) return SCREEN_SIZES.medium;
  return SCREEN_SIZES.default;
};

export const withScreenSize = (options) => {
  const completeOptions = fillInMissingSizes(options);

  const defaultSize = SCREEN_SIZES.default;
  if (defaultSize in completeOptions && getCurrentScreenSize() === defaultSize)
    return completeOptions[defaultSize];
  const medium = SCREEN_SIZES.medium;
  if (medium in completeOptions && getCurrentScreenSize() === medium)
    return completeOptions[medium];
  const small = SCREEN_SIZES.small;
  if (small in completeOptions && getCurrentScreenSize() === small) return completeOptions[small];
  const mini = SCREEN_SIZES.mini;
  if (mini in completeOptions && getCurrentScreenSize() === mini) return completeOptions[mini];
};

const fillInMissingSizes = (options) => {
  const defaultSize = SCREEN_SIZES.default;
  if (!(defaultSize in options))
    throw new Error("an options for the default screen size must be given");

  const newOptions = { ...options };
  const medium = SCREEN_SIZES.medium;
  if (!(medium in newOptions)) newOptions[medium] = newOptions[defaultSize];

  const small = SCREEN_SIZES.small;
  if (!(small in newOptions)) newOptions[small] = newOptions[medium];

  const mini = SCREEN_SIZES.mini;
  if (!(mini in newOptions)) newOptions[mini] = newOptions[small];

  return newOptions;
};
