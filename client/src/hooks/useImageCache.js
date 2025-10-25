// import { useRef, useEffect, useCallback } from "react";

// const imageCache = new Map();
// const objectUrlCache = new Map();

// export const useImageCache = () => {
//   const cleanupRefs = useRef(new Set());

//   // Keep the same cleanup function structure
//   const cleanup = () => {
//     cleanupRefs.current.forEach((url) => {
//       if (objectUrlCache.has(url)) {
//         URL.revokeObjectURL(url);
//         objectUrlCache.delete(url);
//       }
//     });
//     cleanupRefs.current.clear();
//   };

//   // Keep the same loadImage structure
//   const loadImage = useCallback((src, options = {}) => {
//     return new Promise((resolve, reject) => {
//       if (imageCache.has(src)) {
//         resolve(imageCache.get(src));
//         return;
//       }

//       const img = new Image();
//       img.crossOrigin = options.crossOrigin || "anonymous";
      
//       if (options.signal) {
//         options.signal.addEventListener('abort', () => {
//           reject(new DOMException('Aborted', 'AbortError'));
//         });
//         if (options.signal.aborted) {
//           reject(new DOMException('Aborted', 'AbortError'));
//           return;
//         }
//       }

//       img.onload = () => {
//         imageCache.set(src, img);
//         resolve(img);
//       };

//       img.onerror = () => {
//         console.error("Failed to load image:", src);
//         reject(new Error(`Failed to load image: ${src}`));
//       };

//       img.src = src;
//     });
//   }, []);

//   // IMPROVED: Add cleanup for object URLs with timers
//   const createObjectURL = useCallback((file) => {
//     if (!file) return null;
    
//     const fileKey = `${file.name}-${file.size}-${file.lastModified}`;
//     if (objectUrlCache.has(fileKey)) {
//       return objectUrlCache.get(fileKey);
//     }

//     const url = URL.createObjectURL(file);
//     objectUrlCache.set(fileKey, url);
//     cleanupRefs.current.add(url);

//     // Auto cleanup after 10 minutes
//     setTimeout(() => {
//       if (objectUrlCache.has(fileKey)) {
//         URL.revokeObjectURL(url);
//         objectUrlCache.delete(fileKey);
//         cleanupRefs.current.delete(url);
//       }
//     }, 10 * 60 * 1000);

//     return url;
//   }, []);

//   // ADD: Manual cleanup function
//   const clearCache = useCallback(() => {
//     // Clear object URLs
//     cleanupRefs.current.forEach((url) => {
//       URL.revokeObjectURL(url);
//     });
//     cleanupRefs.current.clear();
//     objectUrlCache.clear();
    
//     // Optionally clear image cache too
//     imageCache.clear();
//   }, []);

//   // Keep the same useEffect cleanup
//   useEffect(() => {
//     return cleanup;
//   }, []);

//   return {
//     loadImage,
//     createObjectURL,
//     cleanup,
//     clearCache, // NEW: manual cleanup
//     imageCache,
//     objectUrlCache,
//   };
// };