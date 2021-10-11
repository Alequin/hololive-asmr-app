import { get } from "./get";

const healthUrl = `https://hololive-asmr-server.herokuapp.com/_health`;

export const turnApiOn = async () => get(healthUrl);
