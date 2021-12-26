import { getJson } from "./get-json";
import secrets from "../secrets";
import { serverUrl } from "./base-urls";

const videosUrl = `${serverUrl}/videos`;

export const requestVideos = async () => {
  const { data, status, error } = await getJson(videosUrl, {
    headers: { authToken: secrets.serverAuthToken },
  });

  if (error) {
    throw new Error(
      `Error requesting videos / Error: ${error}, Status code: ${status}`
    );
  }

  return data;
};
