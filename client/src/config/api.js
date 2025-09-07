export const API_CONFIG = {
  PEXELS_API_KEY: import.meta.env.VITE_PEXELS_API_KEY || '',
  PEXELS_BASE_URL: 'https://api.pexels.com/v1',
  DEFAULT_IMAGES_PER_PAGE: 15,
  FAL_API_KEY: import.meta.env.VITE_FAL_API_KEY || '',
  FAL_BASE_URL: 'https://fal.run/fal-ai',
  FAL_MODEL: 'fast-sdxl', 
  FAL_TIMEOUT: 30000, 
};