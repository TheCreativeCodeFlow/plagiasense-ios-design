// API configuration
const getApiBaseUrl = () => {
  // In production, use environment variable or default to a backend service
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://your-backend-service.vercel.app';
  }
  // In development, use local backend
  return import.meta.env.VITE_API_URL || 'http://localhost:8002';
};

const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  ANALYZE: `${API_BASE_URL}/api/analyze`,
  AI_DETECTION: `${API_BASE_URL}/api/ai-detection/analyze`,
  AI_DETECTION_MODELS: `${API_BASE_URL}/api/ai-detection/models`,
  AI_DETECTION_METHODS: `${API_BASE_URL}/api/ai-detection/methods`,
  MODELS: `${API_BASE_URL}/api/models`,
  CONFIGURE: `${API_BASE_URL}/api/configure`,
  STATUS: `${API_BASE_URL}/api/status`,
  HEALTH: `${API_BASE_URL}/`,
} as const;

export { API_BASE_URL };