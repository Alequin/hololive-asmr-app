import { ToastAndroid } from "react-native";

export const showToast = (message, timeToShowFor) => ToastAndroid.show(message, timeToShowFor);
