import { Dimensions } from "react-native";

export const windowWidth = Dimensions.get("window").width;
console.log("🚀 ~ file: window.js ~ line 4 ~ windowWidth", windowWidth);

export const isSmallScreen = windowWidth <= 450;
