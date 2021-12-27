import { get } from "./get";
import secrets from "../secrets";
import { serverUrl } from "./base-urls";

const healthUrl = `${serverUrl}/_health`;

export const turnApiOn = async () => {
  try {
    await get(healthUrl, {
      headers: { authToken: secrets.serverAuthToken },
    });
  } catch (error) {
    // Do not throw when waking up API. The next call will do it
  }
};
