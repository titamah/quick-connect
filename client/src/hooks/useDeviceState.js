// hooks/useDeviceState.js
import { useState, useEffect } from 'react';

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
      angle: 0,
      pos: { x: 0.5, y: 0.5 },
    },
    grain: false,
  });

  // QR Code configuration
  const [qrConfig, setQRConfig] = useState({
    url: "www.qrki.com",
    custom: { 
      primaryColor: "#000000",
      secondaryColor: "#FFFFFF",
      borderSizeRatio: 0,
      borderColor: "#000000", 
      cornerRadiusRatio: 0
    },
    positionPercentages: {
      x: 0.5,
      y: 0.75,
    },
    rotation: 0,
  });

  // Image palette
  const [imagePalette, setImagePalette] = useState([]);

  // SIMPLE HISTORY - just 3 things
  const [past, setPast] = useState([]);
  const [present, setPresent] = useState(null);
  const [future, setFuture] = useState([]);

  // SIMPLE FUNCTIONS - no useCallback bullshit

  // Get current state
  const getCurrentState = () => ({
    deviceInfo,
    background,
    qrConfig,
    imagePalette
  });

  useEffect(() => {
    console.log('past', past);
    console.log('present', present);
    console.log('future', future);
  }, [past, present, future]);

  // Take snapshot
  const takeSnapshot = (description = '') => {
    const currentState = getCurrentState();
    const snapshot = structuredClone(currentState);
    
    // Skip if same as last
    if (past.length > 0 && JSON.stringify(past[past.length - 1].state) === JSON.stringify(snapshot)) {
      console.log('⏭️ Skip duplicate snapshot');
      return;
    }
    
    console.log('📸 Snapshot:', description);
    
    // Add to past, limit to 50
    const newPast = [...past, { state: snapshot, description, timestamp: Date.now() }];
    if (newPast.length > 50) {
      newPast.shift(); // Remove oldest
    }
    
    setPast(newPast);
    setPresent(snapshot);
    setFuture([]); // Clear future
  };

  // Undo
  const undo = () => {
    if (past.length === 0) return false;
    
    const previousState = past[past.length - 1];
    const currentState = getCurrentState();
    
    console.log('↶ Undo:', previousState.description);
    
    // Move current to future
    setFuture([structuredClone(currentState), ...future]);
    
    // Remove from past
    setPast(past.slice(0, -1));
    
    // Apply previous state
    setPresent(previousState.state);
    setDeviceInfo(previousState.state.deviceInfo);
    setBackground(previousState.state.background);
    setQRConfig(previousState.state.qrConfig);
    setImagePalette(previousState.state.imagePalette);
    
    return true;
  };

  // Redo
  const redo = () => {
    if (future.length === 0) return false;
    
    const nextState = future[0];
    const currentState = getCurrentState();
    
    console.log('↷ Redo');
    
    // Move current to past
    setPast([...past, { state: structuredClone(currentState), description: 'Redo point', timestamp: Date.now() }]);
    
    // Remove from future
    setFuture(future.slice(1));
    
    // Apply next state
    setPresent(nextState);
    setDeviceInfo(nextState.deviceInfo);
    setBackground(nextState.background);
    setQRConfig(nextState.qrConfig);
    setImagePalette(nextState.imagePalette);
    
    return true;
  };

  // Simple booleans
  const canUndo = past.length > 0;
  const canRedo = future.length > 0;


  // Debug info
  const historyDebug = {
    pastCount: past.length,
    futureCount: future.length,
    canRedo: canRedo,
    canUndo: canUndo,
    totalSize: past.length + future.length + (present ? 1 : 0),
    lastAction: past.length > 0 ? past[past.length - 1].description : 'No history',
    present: present,
    past: past,
    future: future
  };

  // Helper functions
  const rgbToHex = (rgbString) => {
    if (typeof rgbString !== "string" || !rgbString.startsWith("rgb")) {
      return rgbString;
    }
    const match = rgbString.match(/\d+/g);
    return match ? `#${match.map(num => parseInt(num).toString(16).padStart(2, '0')).join('')}` : rgbString;
  };

  const truncateToHex = (colorString) => {
    if (!colorString || typeof colorString !== "string") {
      return colorString;
    }
    const hexColor = rgbToHex(colorString);
    return hexColor.slice(0, 7);
  };

  // Dynamic palette
  const palette = (() => {
    const activeColors = [];

    if (qrConfig.custom.primaryColor) {
      activeColors.push(truncateToHex(qrConfig.custom.primaryColor));
    }
    if (qrConfig.custom.secondaryColor) {
      activeColors.push(truncateToHex(qrConfig.custom.secondaryColor));
    }
    if (qrConfig.custom.borderColor) {
      activeColors.push(truncateToHex(qrConfig.custom.borderColor));
    }

    if (background.style === "solid" && background.color) {
      activeColors.push(truncateToHex(background.color));
    } else if (background.style === "gradient" && background.gradient.stops) {
      background.gradient.stops
        .filter((_, i) => i % 2 === 1)
        .forEach(color => {
          if (color) {
            activeColors.push(truncateToHex(color));
          }
        });
    } else if (background.style === "image" && imagePalette.length > 0) {
      imagePalette.forEach(color => {
        if (color) {
          activeColors.push(truncateToHex(color));
        }
      });
    }

    return [...new Set(activeColors)];
  })();

  // Get palette excluding a color
  const getPaletteExcluding = (excludeColor) => {
    if (!excludeColor) return palette;
    const excludeHex = truncateToHex(excludeColor).toLowerCase();
    return palette.filter(color => color.toLowerCase() !== excludeHex);
  };

  // Update functions
  const updateDeviceInfo = (updates) => {
    setDeviceInfo(prev => ({ ...prev, ...updates }));
  };

  const updateBackground = (updates) => {
    setBackground(prev => ({ ...prev, ...updates }));
  };

  const updateQRConfig = (updates) => {
    setQRConfig(prev => ({ ...prev, ...updates }));
  };

  const updateQRPositionPercentages = (percentages) => {
    setQRConfig(prev => ({
      ...prev,
      positionPercentages: { ...prev.positionPercentages, ...percentages }
    }));
  };

  const updateImagePalette = (colors) => {
    setImagePalette(colors);
  };

  // Legacy device object
  const device = {
    ...deviceInfo,
    ...background,
    qr: qrConfig,
    palette,
  };

  return {
    device,
    deviceInfo,
    background,
    qrConfig,
    palette,
    getPaletteExcluding,
    updateDeviceInfo,
    updateBackground,
    updateQRConfig,
    updateQRPositionPercentages,
    updateImagePalette,
    
    // UNDO/REDO STUFF
    takeSnapshot,
    undo,
    redo,
    canUndo,
    canRedo,
    historyDebug,
  };
};