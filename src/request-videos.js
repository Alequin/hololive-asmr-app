import fetch from "node-fetch";

export const requestVideos = async () => {
  const { data, status, error } = await getJson(
    `https://hololive-asmr-server.herokuapp.com/videos`
  );

  if (error) {
    throw new Error(
      `Error requesting videos / Error: ${error}, Status code: ${status}`
    );
  }

  return data;
};

const getJson = async (url) => {
  const response = await fetch(url);
  const isErrorStatus = response.status >= 400;

  return {
    data: !isErrorStatus ? await response.json() : null,
    status: response.status,
    error: isErrorStatus ? await response.text() : null,
  };
};
