// hooks/useDebounce.js
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Debounce a value - only update after delay of no changes
 * @param {any} value - The value to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {any} - The debounced value
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Debounce a function - only execute after delay of no calls
 * @param {Function} callback - The function to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {Function} - The debounced function
 */
export const useDebouncedCallback = (callback, delay) => {
  const timeoutRef = useRef(null);
  
  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      if (typeof callback === 'function') {
        callback(...args);
      }
    }, delay);
  }, [callback, delay]);

  return debouncedCallback;
};

/**
 * Throttle a function - limit execution frequency
 * @param {Function} callback - The function to throttle
 * @param {number} delay - The minimum delay between executions in milliseconds
 * @returns {Function} - The throttled function
 */
export const useThrottledCallback = (callback, delay) => {
  const lastCallRef = useRef(0);
  const lastCallTimerRef = useRef(null);
  
  const throttledCallback = useCallback((...args) => {
    const now = Date.now();
    
    if (now - lastCallRef.current >= delay) {
      // Enough time has passed, execute immediately
      lastCallRef.current = now;
      if (typeof callback === 'function') {
        callback(...args);
      }
    } else {
      // Schedule execution for later
      if (lastCallTimerRef.current) {
        clearTimeout(lastCallTimerRef.current);
      }
      
      lastCallTimerRef.current = setTimeout(() => {
        lastCallRef.current = Date.now();
        if (typeof callback === 'function') {
          callback(...args);
        }
      }, delay - (now - lastCallRef.current));
    }
  }, [callback, delay]);

  return throttledCallback;
};