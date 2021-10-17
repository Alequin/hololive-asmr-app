import isEmpty from "lodash/isEmpty";
import orderBy from "lodash/orderBy";
import uniqBy from "lodash/uniqBy";
import React, { useMemo } from "react";
import { Modal, ScrollView, Text, View } from "react-native";
import { Button } from "../../../components/button";
import { ChannelButton } from "../../../components/channel-button";
import { Icon } from "../../../icons";
import { isSmallScreen } from "../../../window";

export const FilterModal = ({
  isOpen,
  videos,
  onDismissModal,
  onSelectChannel,
  onClearAllChannels,
  channelsToFilterBy,
}) => {
  const orderedChannels = useMemo(
    () => (videos ? orderBy(getChannelsFromVideos(videos), "channelTitle") : null),
    [videos]
  );

  return (
    <Modal
      style={{ width: "100%", height: "100%" }}
      animationType="fade"
      transparent
      visible={isOpen}
    >
      <View
        testID="filterModal"
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#00000080",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "90%",
            height: "80%",
            backgroundColor: "#ffffffE6",
            borderRadius: 50,
            padding: 5,
            paddingTop: 20,
            alignItems: "center",
          }}
        >
          <ScrollView>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {orderedChannels.map(({ channelTitle, channelThumbnailUrl }) => {
                return (
                  <ChannelOptionButton
                    key={channelTitle}
                    channelTitle={channelTitle}
                    channelThumbnailUrl={channelThumbnailUrl}
                    onSelect={() => onSelectChannel(channelTitle)}
                    isSelected={useMemo(
                      () => channelsToFilterBy.includes(channelTitle),
                      [channelsToFilterBy, channelTitle]
                    )}
                  />
                );
              })}
            </View>
          </ScrollView>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              paddingHorizontal: "5%",
              width: isSmallScreen ? "100%" : "60%",
            }}
          >
            <ActionButton
              text="Clear all Selected"
              icon="clear"
              onPress={onClearAllChannels}
              disabled={isEmpty(channelsToFilterBy)}
            />
            <ActionButton text="Back to Videos" icon="back" onPress={onDismissModal} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const getChannelsFromVideos = (videos) =>
  uniqBy(videos, "channel_title").map(({ channel_thumbnail_url, channel_title }) => ({
    channelTitle: channel_title,
    channelThumbnailUrl: channel_thumbnail_url,
  }));

const ChannelOptionButton = ({ onSelect, isSelected, channelTitle, channelThumbnailUrl }) => {
  return (
    <View
      style={{
        margin: 4,
        marginHorizontal: isSelected ? 1 : 4,
        borderRadius: 1000,
      }}
      elevation={isSelected ? 10 : 0}
    >
      <ChannelButton
        channelTitle={channelTitle}
        channelThumbnailUrl={channelThumbnailUrl}
        isSelected={isSelected}
        onPress={onSelect}
      />
    </View>
  );
};

const ActionButton = ({ icon, text, onPress, disabled }) => (
  <Button
    style={{
      padding: 10,
      minWidth: "12%",
      alignItems: "center",
      marginHorizontal: 5,
      flexDirection: "row",
      alignItems: "center",
    }}
    onPress={onPress}
    disabled={disabled}
  >
    <Icon name={icon} size={22} style={{ marginRight: 5 }} />
    <Text style={{ fontSize: 16 }}>{text}</Text>
  </Button>
);
