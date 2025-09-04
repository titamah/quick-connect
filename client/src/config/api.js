export const API_CONFIG = {
  PEXELS_API_KEY: import.meta.env.VITE_PEXELS_API_KEY || '',
  PEXELS_BASE_URL: 'https://api.pexels.com/v1',
  DEFAULT_IMAGES_PER_PAGE: 15,
  
  // Fal AI config
  FAL_API_KEY: import.meta.env.VITE_FAL_API_KEY || '',
  FAL_BASE_URL: 'https://fal.run/fal-ai',
  FAL_MODEL: 'fast-sdxl', // Super fast model
  FAL_TIMEOUT: 30000, // 30 seconds max
};