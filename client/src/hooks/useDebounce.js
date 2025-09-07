import { useState, useEffect, useCallback, useRef } from "react";
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
export const useDebouncedCallback = (callback, delay) => {
  const timeoutRef = useRef(null);
  const debouncedCallback = useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        if (typeof callback === "function") {
          callback(...args);
        }
      }, delay);
    },
    [callback, delay]
  );
  return debouncedCallback;
};
export const useThrottledCallback = (callback, delay) => {
  const lastCallRef = useRef(0);
  const lastCallTimerRef = useRef(null);
  const throttledCallback = useCallback(
    (...args) => {
      const now = Date.now();
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        if (typeof callback === "function") {
          callback(...args);
        }
      } else {
        if (lastCallTimerRef.current) {
          clearTimeout(lastCallTimerRef.current);
        }
        lastCallTimerRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          if (typeof callback === "function") {
            callback(...args);
          }
        }, delay - (now - lastCallRef.current));
      }
    },
    [callback, delay]
  );
  return throttledCallback;
};
