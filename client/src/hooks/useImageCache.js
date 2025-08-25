import { useRef, useEffect } from 'react';

// Global image cache to prevent reloading the same images
const imageCache = new Map();
const objectUrlCache = new Map();

export const useImageCache = () => {
  const cleanupRefs = useRef(new Set());

  // Cleanup function to revoke object URLs and remove from cache
  const cleanup = () => {
    cleanupRefs.current.forEach(url => {
      if (objectUrlCache.has(url)) {
        URL.revokeObjectURL(url);
        objectUrlCache.delete(url);
      }
    });
    cleanupRefs.current.clear();
  };

  // Load image with caching
  const loadImage = (src, options = {}) => {
    return new Promise((resolve, reject) => {
      // Check cache first
      if (imageCache.has(src)) {
        resolve(imageCache.get(src));
        return;
      }

      const img = new Image();
      img.crossOrigin = options.crossOrigin || 'anonymous';
      
      img.onload = () => {
        imageCache.set(src, img);
        resolve(img);
      };
      
      img.onerror = () => {
        console.error('Failed to load image:', src);
        reject(new Error(`Failed to load image: ${src}`));
      };
      
      img.src = src;
    });
  };

  // Create object URL with caching and cleanup tracking
  const createObjectURL = (file) => {
    if (!file) return null;
    
    // Check if we already have a URL for this file
    const fileKey = `${file.name}-${file.size}-${file.lastModified}`;
    if (objectUrlCache.has(fileKey)) {
      return objectUrlCache.get(fileKey);
    }

    const url = URL.createObjectURL(file);
    objectUrlCache.set(fileKey, url);
    cleanupRefs.current.add(url);
    return url;
  };

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, []);

  return {
    loadImage,
    createObjectURL,
    cleanup,
    imageCache,
    objectUrlCache
  };
};
