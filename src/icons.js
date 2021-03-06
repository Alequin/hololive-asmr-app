import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import camelCase from "lodash/camelCase";
import React from "react";
import { View } from "react-native";

export const Icon = ({ name, ...otherProps }) => {
  const IconToRender = ICON_OPTIONS[name];
  if (!IconToRender)
    throw new Error(`Unable to find an icon by the name ${name}`);
  return <IconToRender {...otherProps} />;
};

const customIcon =
  (IconSourceElement, iconName, { testIdOverride } = {}) =>
  ({ size, color, style, ...otherProps }) =>
    (
      <TestIdElement
        testID={
          testIdOverride
            ? `${testIdOverride}Icon`
            : `${camelCase(iconName)}Icon`
        }
        style={style}
      >
        <IconSourceElement
          name={iconName}
          size={size}
          color={color}
          {...otherProps}
        />
      </TestIdElement>
    );

const ICON_OPTIONS = {
  back: customIcon(Ionicons, "arrow-back"),
  sortOrder: customIcon(FontAwesome, "sort-amount-asc"),
  zoomIn: customIcon(Feather, "zoom-in"),
  zoomOut: customIcon(Feather, "zoom-out"),
  search: customIcon(FontAwesome5, "search"),
  clear: customIcon(MaterialIcons, "clear"),
  lock: customIcon(MaterialCommunityIcons, "lock"),
  shieldKey: customIcon(MaterialCommunityIcons, "shield-key"),
  youtubeTv: customIcon(MaterialCommunityIcons, "youtube-tv"),
  refresh: customIcon(FontAwesome, "refresh"),
  fullscreen: customIcon(MaterialCommunityIcons, "fullscreen"),
  favouriteOutline: customIcon(MaterialIcons, "favorite-outline", {
    testIdOverride: "favouriteOutline",
  }),
  favourite: customIcon(MaterialIcons, "favorite", {
    testIdOverride: "favourite",
  }),
};

const TestIdElement = (props) => <View {...props} />;
