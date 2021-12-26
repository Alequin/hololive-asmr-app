import { getJson } from "./get-json";
import secrets from "../secrets";
import { serverUrl } from "./base-urls";

const channelsUrl = `${serverUrl}/channels`;

export const requestChannels = async () => {
  const { data, status, error } = await getJson(channelsUrl, {
    headers: { authToken: secrets.serverAuthToken },
  });

  if (error) {
    throw new Error(
      `Error requesting channels / Error: ${error}, Status code: ${status}`
    );
  }

  return data;
};
