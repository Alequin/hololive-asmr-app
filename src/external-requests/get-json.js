import fetch from "node-fetch";

export const getJson = async (url) => {
  const response = await fetch(url);
  const isErrorStatus = response.status >= 400;

  return {
    data: !isErrorStatus ? await response.json() : null,
    status: response.status,
    error: isErrorStatus ? await response.text() : null,
  };
};
