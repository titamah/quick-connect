import { createContext, useContext, useState, useEffect } from 'react';

const PreviewContext = createContext();

export const usePreview = () => {
  const context = useContext(PreviewContext);
  if (!context) {
    throw new Error('usePreview must be used within a PreviewProvider');
  }
  return context;
};

export const PreviewProvider = ({ children }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Detect if we're on mobile
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 768 || 'ontouchstart' in window;
  });

  // Listen for window resize to update mobile state
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement || 
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      
      setIsFullscreen(isCurrentlyFullscreen);
      
      // If user exits fullscreen manually (e.g., ESC key), turn off preview
      if (!isCurrentlyFullscreen && isPreviewVisible && isMobile) {
        setIsPreviewVisible(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [isPreviewVisible, isMobile]);

  // Auto-hide hover state on mobile
  useEffect(() => {
    if (isMobile && isHovered) {
      setIsHovered(false);
    }
  }, [isMobile, isHovered]);

  const setExportState = (exporting) => {
    setIsExporting(exporting);
  };

  const togglePreview = () => {
    setIsPreviewVisible(!isPreviewVisible);
    
    // Clear hover state when toggling
    if (isHovered) {
      setIsHovered(false);
    }
  };

  const setHovered = (hovered) => {
    // Only allow hover states on desktop
    if (!isMobile) {
      setIsHovered(hovered);
    }
  };

  const showPreview = (opacity = 1) => {
    setIsPreviewVisible(true);
  };

  const hidePreview = () => {
    setIsPreviewVisible(false);
    setIsHovered(false);
  };

  // Enhanced preview state that considers both hover and visibility
  const shouldShowPhoneUI = isPreviewVisible || (!isMobile && isHovered);
  const phoneUIOpacity = isPreviewVisible ? 1 : (isHovered ? 0.5 : 0);

  const value = {
    // Export state
    isExporting,
    setExportState,
    
    // Preview visibility
    isPreviewVisible,
    setIsPreviewVisible,
    togglePreview,
    showPreview,
    hidePreview,
    
    // Hover state (desktop only)
    isHovered,
    setHovered,
    
    // Fullscreen state
    isFullscreen,
    setIsFullscreen,
    
    // Device detection
    isMobile,
    
    // Computed states
    shouldShowPhoneUI,
    phoneUIOpacity,
    
    // Utility methods
    enterFullscreen: async (element) => {
      if (!element) return false;
      
      try {
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
          await element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
          await element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
          await element.msRequestFullscreen();
        }
        return true;
      } catch (error) {
        console.error('Failed to enter fullscreen:', error);
        return false;
      }
    },
    
    exitFullscreen: async () => {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          await document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
        return true;
      } catch (error) {
        console.error('Failed to exit fullscreen:', error);
        return false;
      }
    }
  };

  return (
    <PreviewContext.Provider value={value}>
      {children}
    </PreviewContext.Provider>
  );
};