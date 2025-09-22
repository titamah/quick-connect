import React, { useEffect, useRef, useState } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { usePreview } from '../../contexts/PreviewContext';
import { useDevice } from '../../contexts/DeviceContext';
import PhoneUI from './PhoneUI';

const FullscreenPreview = ({ children, wallpaperRef }) => {
  const { 
    isPreviewVisible, 
    isFullscreen, 
    isMobile, 
    hidePreview, 
    exitFullscreen 
  } = usePreview();
  const { deviceInfo } = useDevice();
  
  const overlayRef = useRef(null);
  const [orientation, setOrientation] = useState('portrait');
  const [isLandscape, setIsLandscape] = useState(false);
  const [browserUIHeight, setBrowserUIHeight] = useState(0);
  const [totalOffset, setTotalOffset] = useState(0);

  // Handle orientation changes
  useEffect(() => {
    const handleOrientationChange = () => {
      const isCurrentlyLandscape = window.innerHeight < window.innerWidth;
      setIsLandscape(isCurrentlyLandscape);
      setOrientation(isCurrentlyLandscape ? 'landscape' : 'portrait');
    };

    handleOrientationChange(); // Initial check
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  // Handle escape key to exit preview
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isPreviewVisible) {
        handleExitPreview();
      }
    };

    if (isPreviewVisible) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isPreviewVisible]);

  // Handle touch gestures for mobile
  useEffect(() => {
    if (!isMobile || !isPreviewVisible) return;

    let touchStartY = 0;
    let touchStartX = 0;

    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
      // Prevent default scrolling behavior
      e.preventDefault();
    };

    const handleTouchEnd = (e) => {
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndX = e.changedTouches[0].clientX;
      const deltaY = touchStartY - touchEndY;
      const deltaX = touchStartX - touchEndX;

      // Swipe down to exit (portrait)
      if (!isLandscape && deltaY < -100 && Math.abs(deltaX) < 50) {
        handleExitPreview();
      }
      
      // Swipe right to exit (landscape)
      if (isLandscape && deltaX < -100 && Math.abs(deltaY) < 50) {
        handleExitPreview();
      }
    };

    const overlay = overlayRef.current;
    if (overlay) {
      overlay.addEventListener('touchstart', handleTouchStart, { passive: false });
      overlay.addEventListener('touchmove', handleTouchMove, { passive: false });
      overlay.addEventListener('touchend', handleTouchEnd, { passive: false });

      return () => {
        overlay.removeEventListener('touchstart', handleTouchStart);
        overlay.removeEventListener('touchmove', handleTouchMove);
        overlay.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isMobile, isPreviewVisible, isLandscape]);

  const handleExitPreview = async () => {
    if (isFullscreen) {
      await exitFullscreen();
    }
    hidePreview();
  };

  // Capture wallpaper image when preview opens
  const [wallpaperImgSrc, setWallpaperImgSrc] = useState(null);
  const objectUrlRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const getWallpaperImage = async () => {
      if (!isPreviewVisible) {
        // Clean up previous image
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
          objectUrlRef.current = null;
        }
        setWallpaperImgSrc(null);
        return;
      }

      // Check if wallpaper is ready, similar to Thumbnail component
      if (!wallpaperRef?.current?.exportImage) {
        console.log('Wallpaper not ready, retrying in 100ms...');
        setTimeout(() => {
          if (!cancelled) getWallpaperImage();
        }, 100);
        return;
      }

      try {
        const blob = await wallpaperRef.current.exportImage({
          format: 'png',
          quality: 0.9,
          scale: 1,
          includePhoneUI: false
        });

        if (!cancelled && blob) {
          // Clean up previous URL
          if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
          }
          
          const url = URL.createObjectURL(blob);
          objectUrlRef.current = url;
          setWallpaperImgSrc(url);
        }
      } catch (error) {
        console.error('Failed to export wallpaper image:', error);
        // Retry once after a short delay like Thumbnail does
        setTimeout(() => {
          if (!cancelled) getWallpaperImage();
        }, 200);
      }
    };

    getWallpaperImage();

    return () => {
      cancelled = true;
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [isPreviewVisible, wallpaperRef]);

  useEffect(() => {
    const detectOffsets = () => {
      const visualViewport = window.visualViewport;
      if (visualViewport) {
        const browserUIHeight = window.innerHeight - visualViewport.height;
        const safeAreaTop = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sai') || '0');
        const totalOffset = browserUIHeight + safeAreaTop;
        setTotalOffset(totalOffset);
      }
    };
    
    detectOffsets();
    window.addEventListener('resize', detectOffsets);
    return () => window.removeEventListener('resize', detectOffsets);
  }, []);

  const calculateWallpaperDimensions = () => {
    if (!isPreviewVisible) return {};

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const deviceRatio = deviceInfo.size.x / deviceInfo.size.y;
    const screenRatio = screenWidth / screenHeight;

    let width, height, scale;

    // if (isLandscape) {
      // In landscape, fit to screen height
      width = screenWidth;
      height = screenHeight * deviceRatio;
      
      // If width exceeds screen width, scale down
      if (width > screenWidth * 0.9) {
        width = screenWidth * 0.9;
        height = width / deviceRatio;
      }
    // } else {
      // In portrait, fit to screen width
    //   width = screenWidth * 0.9; // Leave some margin
    //   height = width / deviceRatio;
      
    //   // If height exceeds screen height, scale down
    //   if (height > screenHeight * 0.85) { // Leave space for controls
    //     height = screenHeight * 0.85;
    //     width = height * deviceRatio;
    //   }
    // }

    scale = 1;

    return { width, height, scale };
  };

  if (!isPreviewVisible || !isMobile) {
    return children;
  }

  const { width, height, scale } = calculateWallpaperDimensions();

  return (
    <>
      {children}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
        style={{
          touchAction: 'none',
        }}
      >
        {/* Exit Instructions */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
          {/* Close button */}
          <button
            onClick={handleExitPreview}
            className="p-2 rounded-full bg-neutral-900/33 backdrop-blur-sm text-white/70  hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Wallpaper Image at 100% width */}
        {wallpaperImgSrc && (
            <div className="w-full h-full">
            <PhoneUI fullscreen={true}/>
          <div 
            className="fixed flex items-center justify-center bg-black"
            style={{
              top: `-${totalOffset}px`, // Offset for both browser UI AND notch
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: `${window.innerHeight}px` // Use full screen height
            }}
          >
            <img
              src={wallpaperImgSrc}
              alt="Wallpaper preview"
              className="w-full h-auto max-w-full"
              style={{
                aspectRatio: `${deviceInfo.size.x} / ${deviceInfo.size.y}`
              }}
            />
            </div>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-4 px-4 py-2 bg-neutral-900/33 backdrop-blur-sm rounded-full text-white/70 text-sm">
            Swipe down to exit
          </div>
        </div>

      </div>
    </>
  );
};

export default FullscreenPreview;