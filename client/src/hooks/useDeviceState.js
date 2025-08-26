// hooks/useDeviceState.js
import { useState, useCallback, useMemo } from 'react';

// Split the massive device state into logical pieces
export const useDeviceState = () => {
  // Basic device info
  const [deviceInfo, setDeviceInfo] = useState({
    name: "Sample iPhone Wallpaper",
    type: "iPhone 15 Pro Max",
    size: { x: 1290, y: 2796 },
  });

  // Background configuration
  const [background, setBackground] = useState({
    style: "solid",
    color: "#7ED03B",
    bg: "https://wallpapers.com/images/featured/iphone-12-pro-max-hknmpjtf3rmp9egv.jpg",
    gradient: {
      type: "linear",
      stops: [0, "rgb(255, 170, 0)", 0.5, "rgb(228,88,191)", 1, "rgb(177,99,232)"],
      angle: 180,
      pos: { x: 0.5, y: 0.5 },
    },
    grain: false,
  });

// QR Code configuration
const [qrConfig, setQRConfig] = useState({
    url: "www.qrki.xyz",
    custom: { 
      primaryColor: "#000000",
      secondaryColor: "#FFFFFF",
      borderSizeRatio: 0,        // 0-20% of QR size
      borderColor: "#000000", 
      cornerRadiusRatio: 0       // 0-50% of border size
    },
    // QR position percentages (0-1) for consistent positioning across device sizes
    positionPercentages: {
      x: 0.25,  // 25% from left (default center-left position)
      y: 0.57,  // 57% from top (default center-bottom position)
    },
    // QR rotation in degrees (0-360)
    rotation: 0,
  });

  // Helper function to convert RGB to hex
  const rgbToHex = (rgbString) => {
    if (typeof rgbString !== "string" || !rgbString.startsWith("rgb")) {
      return rgbString; // Return as-is if not RGB
    }
    const match = rgbString.match(/\d+/g);
    return match ? `#${match.map(num => parseInt(num).toString(16).padStart(2, '0')).join('')}` : rgbString;
  };

  // Helper function to truncate color to 7 characters (hex only, no opacity)
  const truncateToHex = (colorString) => {
    if (!colorString || typeof colorString !== "string") {
      return colorString;
    }
    // Convert RGB to hex first if needed
    const hexColor = rgbToHex(colorString);
    // Truncate to 7 characters (including #)
    return hexColor.slice(0, 7);
  };

  // Dynamic palette that only includes active/in-use colors
  const palette = useMemo(() => {
    const activeColors = [];

    // Add QR colors if they exist (truncated to hex only)
    if (qrConfig.custom.primaryColor) {
      activeColors.push(truncateToHex(qrConfig.custom.primaryColor));
    }
    if (qrConfig.custom.secondaryColor) {
      activeColors.push(truncateToHex(qrConfig.custom.secondaryColor));
    }
    if (qrConfig.custom.borderColor) {
      activeColors.push(truncateToHex(qrConfig.custom.borderColor));
    }

    // Add background colors based on style (truncated to hex only)
    if (background.style === "solid" && background.color) {
      activeColors.push(truncateToHex(background.color));
    } else if (background.style === "gradient" && background.gradient.stops) {
      // Extract colors from gradient stops (every odd index is a color)
      background.gradient.stops
        .filter((_, i) => i % 2 === 1) // Only color values, not positions
        .forEach(color => {
          if (color) {
            activeColors.push(truncateToHex(color));
          }
        });
    }
    // Note: Image colors will be added when image processing is implemented

    // Remove duplicates and return
    return [...new Set(activeColors)];
  }, [background.style, background.color, background.gradient.stops, qrConfig.custom.primaryColor, qrConfig.custom.secondaryColor, qrConfig.custom.borderColor]);

  // Helper function to get palette colors excluding a specific color
  const getPaletteExcluding = useCallback((excludeColor) => {
    if (!excludeColor) return palette;
    
    const excludeHex = truncateToHex(excludeColor);
    // Normalize both colors for comparison
    const normalizedExclude = excludeHex.toLowerCase();
    return palette.filter(color => color.toLowerCase() !== normalizedExclude);
  }, [palette]);

  // Optimized update functions
  const updateDeviceInfo = useCallback((updates) => {
    setDeviceInfo(prev => ({ ...prev, ...updates }));
  }, []);

  const updateBackground = useCallback((updates) => {
    setBackground(prev => ({ ...prev, ...updates }));
  }, []);

  const updateQRConfig = useCallback((updates) => {
    setQRConfig(prev => ({ ...prev, ...updates }));
  }, []);

  // Update QR position percentages (for device switching consistency)
  const updateQRPositionPercentages = useCallback((percentages) => {
    setQRConfig(prev => ({
      ...prev,
      positionPercentages: { ...prev.positionPercentages, ...percentages }
    }));
  }, []);

  // Legacy compatibility - reconstruct the old device object when needed
  const device = useMemo(() => ({
    ...deviceInfo,
    ...background,
    qr: qrConfig,
    palette,
  }), [deviceInfo, background, qrConfig, palette]);

  return {
    device, // For backward compatibility
    deviceInfo,
    background,
    qrConfig,
    palette,
    getPaletteExcluding, // New helper function
    updateDeviceInfo,
    updateBackground,
    updateQRConfig,
    updateQRPositionPercentages, // New function for position percentages
  };
};