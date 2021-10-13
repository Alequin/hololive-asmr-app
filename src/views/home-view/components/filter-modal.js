import isEmpty from "lodash/isEmpty";
import React, { useMemo } from "react";
import { Modal, Text, View, ScrollView } from "react-native";
import { Button } from "../../../components/button";
import { Icon } from "../../../icons";
import { isSmallScreen } from "../../../window";

export const FilterModal = ({
  isOpen,
  orderedChannelNames,
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
      <View
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
            backgroundColor: "white",
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
                marginTop: 10,
                justifyContent: "center",
              }}
            >
              {orderedChannelNames.map((channelName) => {
                return (
                  <ChannelOptionButton
                    key={channelName}
                    channelName={channelName}
                    onSelect={() => onSelectChannel(channelName)}
                    isSelected={useMemo(
                      () => channelsToFilterBy.includes(channelName),
                      [channelsToFilterBy, channelName]
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

const ChannelOptionButton = ({ onSelect, isSelected, channelName }) => {
  return (
    <Button
      style={{
        flexDirection: "row",
        alignItems: "center",
        margin: 2,
        borderColor: "black",
        borderWidth: 1,
        padding: 5,
        borderRadius: 10,
      }}
      onPress={onSelect}
    >
      <Icon
        name={isSelected ? "markedCheckBox" : "blankCheckBox"}
        style={{ marginRight: 5 }}
        size={16}
      />
      <Text
        style={{
          fontSize: 16,
          fontWeight: isSelected ? "bold" : "normal",
        }}
      >
        {channelName}
      </Text>
    </Button>
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
