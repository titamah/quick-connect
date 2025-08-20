// hooks/useImageLoader.js
import { useState, useEffect, useMemo } from 'react';

export const useImageLoader = (background) => {
  const [patternImage, setPatternImage] = useState(null);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Load image when background changes
  useEffect(() => {
    if (background.style !== "image" || !background.bg) {
      setPatternImage(null);
      setIsImageLoaded(false);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      setPatternImage(img);
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      setIsImageLoaded(true);
    };
    
    img.onerror = () => {
      console.error('Failed to load image:', background.bg);
      setIsImageLoaded(false);
    };
    
    img.src = background.bg;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [background.style, background.bg]);

  // Calculate image scaling and positioning
  const imageSize = useMemo(() => {
    if (!naturalSize.width || !naturalSize.height) {
      return {
        scaleFactors: { x: 1, y: 1 },
        scaledWidth: 0,
        scaledHeight: 0,
        offsetX: 0,
        offsetY: 0,
      };
    }

    // Calculate scale to cover the entire device area
    const scaleX = background.deviceSize?.x / naturalSize.width || 1;
    const scaleY = background.deviceSize?.y / naturalSize.height || 1;
    const scale = Math.max(scaleX, scaleY);

    const scaledWidth = naturalSize.width * scale;
    const scaledHeight = naturalSize.height * scale;
    
    // Center the image
    const offsetX = background.deviceSize ? (background.deviceSize.x - scaledWidth) / 2 : 0;
    const offsetY = background.deviceSize ? (background.deviceSize.y - scaledHeight) / 2 : 0;

    return {
      scaleFactors: { x: scale, y: scale },
      scaledWidth,
      scaledHeight,
      offsetX,
      offsetY,
    };
  }, [naturalSize, background.deviceSize]);

  return {
    patternImage,
    imageSize,
    isImageLoaded,
  };
};