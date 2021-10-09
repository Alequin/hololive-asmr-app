import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
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
  youtubeSubscription: customIcon(
    MaterialCommunityIcons,
    "youtube-subscription"
  ),
  youtubeTv: customIcon(MaterialCommunityIcons, "youtube-tv"),
};

const TestIdElement = (props) => <View {...props} />;
