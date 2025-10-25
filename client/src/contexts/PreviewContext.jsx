import { createContext, useContext, useState, useEffect } from 'react';
import useWindowSize from '../hooks/useWindowSize';

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

  const { isMobile } = useWindowSize();

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement || 
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      
      setIsFullscreen(isCurrentlyFullscreen);
      
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
    
    if (isHovered) {
      setIsHovered(false);
    }
  };

  const setHovered = (hovered) => {
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

  const shouldShowPhoneUI = isPreviewVisible || (!isMobile && isHovered);
  const phoneUIOpacity = isPreviewVisible ? 1 : (isHovered ? 0.5 : 0);

  const value = {
    isExporting,
    setExportState,
    
    isPreviewVisible,
    setIsPreviewVisible,
    togglePreview,
    showPreview,
    hidePreview,
    
    isHovered,
    setHovered,
    
    isFullscreen,
    setIsFullscreen,
    
    isMobile,
    
    shouldShowPhoneUI,
    phoneUIOpacity,
    
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