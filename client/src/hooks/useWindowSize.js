import { useState, useEffect } from "react";

// Detect if we're on mobile (window size never changes)
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  
  useEffect(() => {
    // On mobile, don't set up resize listeners - window size never changes
    if (isMobile) {
      return; // No cleanup needed
    }
    
    // Only set up resize listeners on desktop
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    const debounce = (func, delay) => {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
      };
    };
    
    const debouncedHandleResize = debounce(handleResize, 1);
    window.addEventListener("resize", debouncedHandleResize);
    
    return () => {
      window.removeEventListener("resize", debouncedHandleResize);
    };
  }, []);
  
  return windowSize;
}

export default useWindowSize;
