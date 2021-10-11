import fetch from "node-fetch";

export const get = async (url, options) => fetch(url, options);
