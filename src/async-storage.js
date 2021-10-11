import AsyncStorage from "@react-native-async-storage/async-storage";

const newStorageItem = (storageKey) => ({
  save: async (valueToSave) => {
    AsyncStorage.setItem(storageKey, JSON.stringify(valueToSave));
  },
  load: async () => {
    const item = await AsyncStorage.getItem(storageKey);
    return item ? JSON.parse(item) : null;
  },
  clear: async () => AsyncStorage.removeItem(storageKey),
});

export const cachedVideos = newStorageItem("CACHED_VIDEOS");

export const zoomModifierState = newStorageItem("ZOOM_MODIFIER_STATE");

export const sortOrderState = newStorageItem("SORT_ORDER_STATE");

export const firstLoadState = newStorageItem("FIRST_LOAD_STATE");
