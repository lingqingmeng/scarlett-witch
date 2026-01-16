import LuciaSDK from 'lucia-sdk';

const apiKey = import.meta.env.VITE_CLICKINSIGHTS_API_KEY;

if (!apiKey) {
  // eslint-disable-next-line no-console
  console.warn('Lucia SDK not initialized: VITE_CLICKINSIGHTS_API_KEY is missing');
} else {
  LuciaSDK.init({
    apiKey,
  });
}

export default LuciaSDK;
