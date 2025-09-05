import { useRef, useEffect, useCallback } from "react";

const imageCache = new Map();
const objectUrlCache = new Map();

export const useImageCache = () => {
  const cleanupRefs = useRef(new Set());

  const cleanup = () => {
    cleanupRefs.current.forEach((url) => {
      if (objectUrlCache.has(url)) {
        URL.revokeObjectURL(url);
        objectUrlCache.delete(url);
      }
    });
    cleanupRefs.current.clear();
  };

  const loadImage = useCallback((src, options = {}) => {
    return new Promise((resolve, reject) => {
      if (imageCache.has(src)) {
        resolve(imageCache.get(src));
        return;
      }

      const img = new Image();
      img.crossOrigin = options.crossOrigin || "anonymous";

      // Handle abort signal
      if (options.signal) {
        options.signal.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        });
        
        if (options.signal.aborted) {
          reject(new DOMException('Aborted', 'AbortError'));
          return;
        }
      }

      img.onload = () => {
        imageCache.set(src, img);
        resolve(img);
      };

      img.onerror = () => {
        console.error("Failed to load image:", src);
        reject(new Error(`Failed to load image: ${src}`));
      };

      img.src = src;
    });
  }, []);

  const createObjectURL = (file) => {
    if (!file) return null;

    const fileKey = `${file.name}-${file.size}-${file.lastModified}`;
    if (objectUrlCache.has(fileKey)) {
      return objectUrlCache.get(fileKey);
    }

    const url = URL.createObjectURL(file);
    objectUrlCache.set(fileKey, url);
    cleanupRefs.current.add(url);
    return url;
  };

  useEffect(() => {
    return cleanup;
  }, []);

  return {
    loadImage,
    createObjectURL,
    cleanup,
    imageCache,
    objectUrlCache,
  };
};