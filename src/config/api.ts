// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.PROD ? 'https://your-api-domain.com' : '/api',
  ENDPOINTS: {
    HEALTH: '/v1/health',
    SEARCH: '/v1/search',
    TRANSLATE_EN_TO_JP: '/v1/translate/en2jp',
    TRANSLATE_JP_TO_EN: '/v1/translate/jp2en',
  }
} as const;

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
