import isEmpty from "lodash/isEmpty";
import orderBy from "lodash/orderBy";
import React, { useMemo } from "react";
import { Modal, ScrollView, View } from "react-native";
import { Button } from "../../../components/button";
import { ChannelButton } from "../../../components/channel-button";
import { LoadingSpinner } from "../../../components/loading-spinner";
import { Icon } from "../../../icons";
import { StyledText } from "../../../styled-text";
import { isMiniScreen } from "../../../window";
import { useRequestChannels } from "../hooks/use-request-channels";
import { ErrorRequestingChannelsMessage } from "./error-requesting-channels-message";

export const FilterModal = ({
  isOpen,
  onDismissModal,
  onSelectChannel,
  onClearAllChannels,
  channelsToFilterBy,
}) => {
  return (
    <Modal
      style={{ width: "100%", height: "100%" }}
      animationType="fade"
      transparent
      visible={isOpen}
    >
      <ChannelOptionsList
        onDismissModal={onDismissModal}
        onSelectChannel={onSelectChannel}
        onClearAllChannels={onClearAllChannels}
        channelsToFilterBy={channelsToFilterBy}
      />
    </Modal>
  );
};

const ChannelOptionsList = ({
  onDismissModal,
  onSelectChannel,
  onClearAllChannels,
  channelsToFilterBy,
}) => {
  const { channels, loading, error, refetchChannels } = useRequestChannels();

  const orderedChannels = useMemo(
    () => orderBy(channels, "channel_title"),
    [channels]
  );

  return (
    <FilterModalContainer
      onDismissModal={onDismissModal}
      onSelectChannel={onSelectChannel}
      onClearAllChannels={onClearAllChannels}
      channelsToFilterBy={channelsToFilterBy}
    >
      {error && (
        <ErrorRequestingChannelsMessage onPressRefresh={refetchChannels} />
      )}
      {!error && loading && (
        <LoadingSpinner style={{ flex: 1 }} color="black" />
      )}
      {!error && !loading && (
        <ScrollView>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {orderedChannels?.map(
              ({
                channel_title: channelTitle,
                channel_thumbnail_url: channelThumbnailUrl,
              }) => {
                return (
                  <ChannelOptionButton
                    key={channelTitle}
                    channelTitle={channelTitle}
                    channelThumbnailUrl={channelThumbnailUrl}
                    onSelect={() => onSelectChannel(channelTitle)}
                    isSelected={channelsToFilterBy.includes(channelTitle)}
                  />
                );
              }
            )}
          </View>
        </ScrollView>
      )}
    </FilterModalContainer>
  );
};

const FilterModalContainer = ({
  children,
  onClearAllChannels,
  channelsToFilterBy,
  onDismissModal,
}) => (
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
      {children}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          paddingHorizontal: "5%",
          width: isMiniScreen() ? "100%" : "60%",
        }}
      >
        <ActionButton
          text="Clear all Selected"
          icon="clear"
          onPress={onClearAllChannels}
          disabled={isEmpty(channelsToFilterBy)}
        />
        <ActionButton
          text="Back to Videos"
          icon="back"
          onPress={onDismissModal}
        />
      </View>
    </View>
  </View>
);

const ChannelOptionButton = ({
  onSelect,
  isSelected,
  channelTitle,
  channelThumbnailUrl,
}) => {
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
    <StyledText>{text}</StyledText>
  </Button>
);
