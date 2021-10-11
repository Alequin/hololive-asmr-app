import { get } from "./get";

export const getJson = async (url, options) => {
  const response = await get(url, options);
  const isErrorStatus = response.status >= 400;

  return {
    data: !isErrorStatus ? await response.json() : null,
    status: response.status,
    error: isErrorStatus ? await response.text() : null,
  };
};
