// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  ANALYZE: `${API_BASE_URL}/api/analyze`,
  MODELS: `${API_BASE_URL}/api/models`,
  CONFIGURE: `${API_BASE_URL}/api/configure`,
  STATUS: `${API_BASE_URL}/api/status`,
  HEALTH: `${API_BASE_URL}/`,
} as const;

export { API_BASE_URL };