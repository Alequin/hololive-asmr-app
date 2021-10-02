import fetch from "node-fetch";
import { getJson } from "./get-json";

const videosUrl = `https://hololive-asmr-server.herokuapp.com/videos`;

export const requestVideos = async () => {
  const { data, status, error } = await getJson(videosUrl);

  if (error) {
    throw new Error(
      `Error requesting videos / Error: ${error}, Status code: ${status}`
    );
  }

  return data;
};
