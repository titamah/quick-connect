// hooks/useDebounce.js
import { useCallback, useRef } from 'react';

/**
 * Custom hook for debouncing function calls
 * @param {Function} callback - The function to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {Function} - The debounced function
 */
export const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);

  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (typeof callback === 'function') {
        callback(...args);
      } else {
        console.warn('useDebounce: callback is not a function', callback);
      }
    }, delay);
  }, [callback, delay]);

  return debouncedCallback;
};