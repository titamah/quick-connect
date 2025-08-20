// hooks/useColorPalette.js
import { useMemo } from 'react';
import chroma from 'chroma-js';

export const useColorPalette = (background, qrConfig) => {
  return useMemo(() => {
    const rgbToHex = (rgb) => {
      if (typeof rgb !== 'string' || !rgb.startsWith('rgb')) return rgb;
      
      const match = rgb.match(/\d+/g);
      if (!match) return rgb;
      
      return `#${match.map(num => parseInt(num).toString(16).padStart(2, '0')).join('')}`;
    };

    const gradientColors = background.gradient?.stops
      ?.filter((_, i) => i % 2 === 1) // Get color values, skip percentages
      ?.map(rgbToHex)
      ?.filter(Boolean) || [];

    return {
      qr: qrConfig.custom?.borderColor || "#000000",
      bg: "#FFFFFF",
      border: qrConfig.custom?.borderColor || "#000000",
      solid: background.color,
      gradient: gradientColors,
      image: [], // This will be populated by ColorThief when image loads
    };
  }, [background.color, background.gradient, qrConfig.custom]);
};