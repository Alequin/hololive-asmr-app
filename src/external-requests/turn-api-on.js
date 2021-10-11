import { get } from "./get";
import secrets from "../secrets";

const healthUrl = `https://hololive-asmr-server.herokuapp.com/_health`;

export const turnApiOn = async () =>
  get(healthUrl, {
    headers: { authToken: secrets.serverAuthToken },
  });
