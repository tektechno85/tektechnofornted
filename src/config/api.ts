export const API_CONFIG = {
  BASE_URL: "https://www.khaofit.xyz/tek-techno",
  API_VERSION: "v1",
} as const;

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}/api/${API_CONFIG.API_VERSION}${endpoint}`;
};
