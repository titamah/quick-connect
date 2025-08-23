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
    color: "#ffad6c",
    bg: "https://wallpapers.com/images/featured/iphone-12-pro-max-hknmpjtf3rmp9egv.jpg",
    gradient: {
      type: "linear",
      stops: [0, "rgb(255, 170, 0)", 0.5, "rgb(228,88,191)", 1, "rgb(177,99,232)"],
      angle: { x: 0, y: 0 },
      pos: { x: 0, y: 0 },
    },
    grain: false,
  });

// QR Code configuration - UPDATED to use ratios
const [qrConfig, setQRConfig] = useState({
    url: "www.qrki.xyz",
    custom: { 
      primaryColor: "#000000",
      secondaryColor: "#ffffff",
      borderSizeRatio: 0,        // 0-20% of QR size
      borderColor: "#000000", 
      cornerRadiusRatio: 0       // 0-50% of border size
    },
  });

  // Color palette (derived state)
  const palette = useMemo(() => ({
    qr: qrConfig.custom.primaryColor || "#000000",
    bg: qrConfig.custom.secondaryColor || "#FFFFFF", 
    border: qrConfig.custom.borderColor || "#000000",
    solid: background.color,
    gradient: background.gradient.stops
      .filter((_, i) => i % 2 === 1)
      .map(color => {
        if (typeof color === "string" && color.startsWith("rgb")) {
          const match = color.match(/\d+/g);
          return match ? `#${match.map(num => parseInt(num).toString(16).padStart(2, '0')).join('')}` : color;
        }
        return color;
      }),
    image: [], // Will be updated when image is processed
  }), [background.color, background.gradient.stops, qrConfig.custom.primaryColor, qrConfig.custom.secondaryColor, qrConfig.custom.borderColor]);

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
    updateDeviceInfo,
    updateBackground,
    updateQRConfig,
  };
};