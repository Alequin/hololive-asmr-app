import { serverAuthToken, addBannerId, googleMobileAdsAppId } from "../secrets.json";

// If you're missing the secrets file include it at the root level and include the required secret variables

const secrets = { serverAuthToken, addBannerId, googleMobileAdsAppId };

Object.entries(secrets).forEach(([key, value]) => {
  if (!value) throw new Error(`A values must be given for the secret ${key}`);
});

export default secrets;
