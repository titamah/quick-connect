import { useState, useEffect } from "react";

function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.matchMedia("(max-width: 768px)").matches,
  });

  useEffect(() => {
    // Use matchMedia for mobile detection - much more reliable! ✨
    const mobileQuery = window.matchMedia("(max-width: 768px)");
    
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: mobileQuery.matches,
      });
    };

    // matchMedia listener for breakpoint changes
    const handleMediaChange = (e) => {
      setWindowSize(prev => ({
        ...prev,
        isMobile: e.matches,
      }));
    };

    // Add matchMedia listener (this is the magic!)
    mobileQuery.addEventListener('change', handleMediaChange);
    
    // Still listen to resize for dimension changes
    window.addEventListener("resize", handleResize);
    window.addEventListener('orientationchange', handleResize);
    document.addEventListener('fullscreenchange', handleResize);
    
    // Initial check
    handleResize();

    return () => {
      mobileQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener('orientationchange', handleResize);
      document.removeEventListener('fullscreenchange', handleResize);
    };
  }, []);

  return windowSize;
}

export default useWindowSize;