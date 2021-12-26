import { getJson } from "./get-json";
import secrets from "../secrets";
import { serverUrl } from "./base-urls";

const videosUrl = `${serverUrl}/videos`;

export const requestVideos = async (queryParams) => {
  const query = buildQueryParams(queryParams);
  const queryString = query ? `?${query}` : "";

  const { data, status, error } = await getJson(`${videosUrl}${queryString}`, {
    headers: { authToken: secrets.serverAuthToken },
  });

  if (error) {
    throw new Error(
      `Error requesting videos / Error: ${error}, Status code: ${status}`
    );
  }

  return data;
};

const buildQueryParams = ({ channelIds }) => {
  const queryObject = new URLSearchParams();
  if (channelIds) queryObject.append("channelIds", channelIds.join(","));

  return queryObject.toString();
};
