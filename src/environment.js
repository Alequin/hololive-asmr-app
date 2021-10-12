import * as Localization from "expo-localization";

// local is mocked in tests and so should be a wrapper only without logic
export const locale = () => Localization.locale;
export const isEnvironmentProduction = () => process.env.NODE_ENV === "production";
