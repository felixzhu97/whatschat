/**
 * API base URL. Defaults to localhost for simulator.
 * On a physical device, set EXPO_PUBLIC_API_URL in .env to your computer's LAN IP,
 * e.g. EXPO_PUBLIC_API_URL=http://192.168.1.100:3001 (Mac: run `ipconfig getifaddr en0` to get IP).
 */
const getBaseUrl = () => {
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  }
  return 'http://localhost:3001';
};
export const API_BASE_URL = getBaseUrl();
export const API_V1 = `${API_BASE_URL}/api/v1`;
