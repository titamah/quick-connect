import { useState, useEffect, useCallback } from "react";
const validateScale = (scale) => {
  if (typeof scale !== 'number' || isNaN(scale)) return 0.5;
  return Math.max(0.1, Math.min(1, scale));
};
const validatePosition = (pos) => ({
  x: Math.max(0, Math.min(1, pos?.x ?? 0.5)),
  y: Math.max(0, Math.min(1, pos?.y ?? 0.5)),
});

const validateRotation = (rotation) => {
  const num = typeof rotation === 'number' ? rotation : 0;
  const normalized = ((num + 180) % 360 + 360) % 360 - 180;
  return normalized;
};

const deepMerge = (target, source) => {
  const result = { ...target };
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (
        source[key] &&
        typeof source[key] === "object" &&
        !Array.isArray(source[key])
      ) {
        result[key] = deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  return result;
};
const isMobile = window.innerWidth <= 768;
const isHighDPI = window.devicePixelRatio > 2;
const isLowPowerDevice = navigator.hardwareConcurrency <= 4;
const PERFORMANCE_MODE = isMobile || isHighDPI || isLowPowerDevice;

// Log performance mode for debugging
if (PERFORMANCE_MODE) {
  console.log('🚀 Performance Mode Enabled:', {
    mobile: isMobile,
    highDPI: isHighDPI,
    lowPower: isLowPowerDevice,
    cores: navigator.hardwareConcurrency,
    pixelRatio: window.devicePixelRatio
  });
}

export const useDeviceState = () => {

  const [deviceInfo, setDeviceInfo] = useState({
    name: "Sample iPhone Wallpaper",
    type: "iPhone 15 Pro Max",
    size: { x: 1290, y: 2796 },
  });
  const [activeImageSource, setActiveImageSource] = useState("Upload");
  const [generationHistory, setGenerationHistory] = useState([]);
  
  // Generate one remix ID per session (using same logic as remixService)
  const [sessionRemixId] = useState(() => {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  });
  const [background, setBackground] = useState({
    style: "solid",
    color: "#FFFFFF",
    bg: "",
    gradient: {
      type: "linear",
      stops: [
        0,
        "rgb(255, 170, 0)",
        0.5,
        "rgb(228,88,191)",
        1,
        "rgb(177,99,232)",
      ],
      angle: 0,
      pos: { x: 0.5, y: 0.5 },
    },
    grain: 0,
  });
  const [qrConfig, setQRConfig] = useState({
    url: "www.qrki.xyz",
    scale: 0.5,
    custom: {
      primaryColor: "#000000",
      secondaryColor: "#FFFFFF",
      borderSizeRatio: -1,
      borderColor: "#000000",
      cornerRadiusRatio: 0,
    },
    positionPercentages: {
      x: 0.5,
      y: 0.75,
    },
    rotation: 0,
  });
  const [imagePalette, setImagePalette] = useState([]);
  const [uploadInfo, setUploadInfo] = useState({
    filename: null,
    originalImageData: null,
    croppedImageData: null,
    crop: null,
  });
  const [generatedInfo, setGeneratedInfo] = useState({
    filename: null,
    originalImageData: null,
    croppedImageData: null,
    crop: null,
  });
  const [past, setPast] = useState([]);
  const [present, setPresent] = useState(null);
  const [future, setFuture] = useState([]);
  const rgbToHex = (rgbString) => {
    if (typeof rgbString !== "string" || !rgbString.startsWith("rgb")) {
      return rgbString;
    }
    const match = rgbString.match(/\d+/g);
    return match
      ? `#${match
          .map((num) => parseInt(num).toString(16).padStart(2, "0"))
          .join("")}`
      : rgbString;
  };
  const truncateToHex = (colorString) => {
    if (!colorString || typeof colorString !== "string") {
      return colorString;
    }
    const hexColor = rgbToHex(colorString);
    return hexColor.slice(0, 7);
  };
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
        .forEach((color) => {
          if (color) {
            activeColors.push(truncateToHex(color));
          }
        });
    } else if (background.style === "image" && imagePalette.length > 0) {
      imagePalette.forEach((color) => {
        if (color) {
          activeColors.push(truncateToHex(color));
        }
      });
    }
    return [...new Set(activeColors)];
  })();
  const getCurrentState = () => ({
    deviceInfo: structuredClone(deviceInfo),
    background: structuredClone(background),
    qrConfig: structuredClone(qrConfig),
    imagePalette: structuredClone(imagePalette),
    uploadInfo: structuredClone(uploadInfo),
    generatedInfo: structuredClone(generatedInfo),
  });
  useEffect(() => {
    console.log("📊 History Debug:", {
      pastCount: past.length,
      futureCount: future.length,
      lastAction: past.length > 0 ? past[past.length - 1].description : "None",
    });
  }, [past, present, future]);
  const takeSnapshot = (description = "") => {
    const currentState = getCurrentState();
    if (past.length > 0) {
      const lastSnapshot = past[past.length - 1].state;
      const currentKey = JSON.stringify(currentState);
      const lastKey = JSON.stringify(lastSnapshot);
      if (currentKey === lastKey) {
        console.log("⏭️ Skip duplicate snapshot:", description);
        return;
      }
    }
    console.log("📸 Taking snapshot:", description);
    const newPast = [
      ...past,
      {
        state: currentState,
        description,
        timestamp: Date.now(),
      },
    ];
    if (newPast.length > 50) {
      newPast.shift();
    }
    setPast(newPast);
    setFuture([]);
  };
  const undo = () => {
    if (past.length === 0) return false;
    const previousState = past[past.length - 1];
    const currentState = getCurrentState();
    console.log("↶ Undo:", previousState.description);
    setFuture([currentState, ...future]);
    setPast(past.slice(0, -1));
    setPresent(previousState.state);
    setDeviceInfo(previousState.state.deviceInfo);
    setBackground(previousState.state.background);
    setQRConfig(previousState.state.qrConfig);
    setImagePalette(previousState.state.imagePalette);
    setUploadInfo(previousState.state.uploadInfo);
    setGeneratedInfo(previousState.state.generatedInfo);
    return true;
  };
  const redo = () => {
    if (future.length === 0) return false;
    const nextState = future[0];
    const currentState = getCurrentState();
    console.log("↷ Redo");
    setPast([
      ...past,
      { state: currentState, description: "Redo point", timestamp: Date.now() },
    ]);
    setFuture(future.slice(1));
    setPresent(nextState);
    setDeviceInfo(nextState.deviceInfo);
    setBackground(nextState.background);
    setQRConfig(nextState.qrConfig);
    setImagePalette(nextState.imagePalette);
    setUploadInfo(nextState.uploadInfo);
    setGeneratedInfo(nextState.generatedInfo);
    return true;
  };
  const canUndo = past.length > 0;
  const canRedo = future.length > 0;
  const historyDebug = {
    pastCount: past.length,
    futureCount: future.length,
    canRedo: canRedo,
    canUndo: canUndo,
    totalSize: past.length + future.length + (present ? 1 : 0),
    lastAction:
      past.length > 0 ? past[past.length - 1].description : "No history",
    present: present,
    past: past,
    future: future,
  };
  const getPaletteExcluding = (excludeColor) => {
    if (!excludeColor) return palette;
    const excludeHex = truncateToHex(excludeColor).toLowerCase();
    return palette.filter((color) => color.toLowerCase() !== excludeHex);
  };
  const updateDeviceInfo = (updates) => {
    console.log("🔧 updateDeviceInfo:", updates);
    setDeviceInfo((prev) => deepMerge(prev, updates));
  };

  const updateBackground = (updates) => {
    console.log("🔧 updateBackground:", updates);
    setBackground((prev) => deepMerge(prev, updates));
  };

  const updateQRConfig = useCallback((updates) => {
    console.log("🔧 updateQRConfig:", updates);
    if (updates.scale !== undefined) {
      updates.scale = validateScale(updates.scale);
      console.log("📏 Validated scale to:", updates.scale);
    }
    if (updates.positionPercentages) {
      updates.positionPercentages = validatePosition(updates.positionPercentages);
      console.log("📍 Validated position to:", updates.positionPercentages);
    }
    if (updates.rotation !== undefined) {
      updates.rotation = validateRotation(updates.rotation);
      console.log("🔄 Validated rotation to:", updates.rotation);
    }
    if (updates.custom?.borderSizeRatio !== undefined) {
      updates.custom.borderSizeRatio = Math.max(-1, Math.min(200, updates.custom.borderSizeRatio));
    }
    if (updates.custom?.cornerRadiusRatio !== undefined) {
      updates.custom.cornerRadiusRatio = Math.max(0, Math.min(100, updates.custom.cornerRadiusRatio));
    }
    setQRConfig((prev) => deepMerge(prev, updates));
  }, []);

  const updateQRPositionPercentages = useCallback((percentages) => {
    console.log("🔧 updateQRPositionPercentages:", percentages);
    const validatedPercentages = validatePosition(percentages);
    
    setQRConfig((prev) =>
      deepMerge(prev, {
        positionPercentages: validatedPercentages,
      })
    );
  }, []);
  const updateImagePalette = (colors) => {
    console.log("🔧 updateImagePalette:", colors.length, "colors");
    setImagePalette(colors);
  };
  const updateUploadInfo = (updates) => {
    console.log("🔧 updateUploadInfo:", updates);
    setUploadInfo((prev) => deepMerge(prev, updates));
  };
  const updateGeneratedInfo = (updates) => {
    console.log("🔧 updateGeneratedInfo:", updates);
    setGeneratedInfo((prev) => deepMerge(prev, updates));
  };

  const updateGrain = () => {
    if (background.grain === 1) background.grain = 0;
    else background.grain += 0.5;
    console.log("🔧 updateGrain:", background.grain);
  };
  
  const loadTemplateData = useCallback((templateData) => {
    console.log("📋 Loading template data with validation...");
    const qrConfigWithDefaults = {
      url: templateData.qrConfig?.url || "www.qrki.com",
      scale: validateScale(templateData.qrConfig?.scale),
      custom: {
        primaryColor: templateData.qrConfig?.custom?.primaryColor || "#000000",
        secondaryColor: templateData.qrConfig?.custom?.secondaryColor || "#FFFFFF",
        borderSizeRatio: Math.max(-1, Math.min(200, templateData.qrConfig?.custom?.borderSizeRatio ?? -1)),
        borderColor: templateData.qrConfig?.custom?.borderColor || "#000000",
        cornerRadiusRatio: Math.max(0, Math.min(100, templateData.qrConfig?.custom?.cornerRadiusRatio ?? 0)),
      },
      positionPercentages: validatePosition(templateData.qrConfig?.positionPercentages),
      rotation: validateRotation(templateData.qrConfig?.rotation),
    };
    setDeviceInfo(templateData.deviceInfo || deviceInfo);
    setBackground(templateData.background || background);
    setQRConfig(qrConfigWithDefaults);
    setImagePalette(templateData.imagePalette || []);
    setUploadInfo(templateData.uploadInfo || uploadInfo);
    setGeneratedInfo(templateData.generatedInfo || generatedInfo);
    setPast([]);
    setFuture([]);
    setPresent(null);
    console.log("✅ Template loaded with validated QR config:", qrConfigWithDefaults);
  }, [deviceInfo, background, uploadInfo, generatedInfo]);
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
    uploadInfo,
    generatedInfo,
    activeImageSource,
    setActiveImageSource,
    generationHistory,
    setGenerationHistory,
    getPaletteExcluding,
    updateDeviceInfo,
    updateBackground,
    updateQRConfig,
    updateQRPositionPercentages,
    updateImagePalette,
    updateUploadInfo,
    updateGeneratedInfo,
    updateGrain,
    takeSnapshot,
    undo,
    redo,
    canUndo,
    canRedo,
    historyDebug,
    loadTemplateData,
    sessionRemixId,
  };
};