import { useState, useEffect } from "react";

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

export const useDeviceState = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    name: "Sample iPhone Wallpaper",
    type: "iPhone 15 Pro Max",
    size: { x: 1290, y: 2796 },
  });

  const [background, setBackground] = useState({
    style: "solid",
    color: "#FFFFFF",
    bg: null,
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
    grain: false,
  });

  const [qrConfig, setQRConfig] = useState({
    url: "www.qrki.com",
    custom: {
      primaryColor: "#000000",
      secondaryColor: "#FFFFFF",
      borderSizeRatio: 0,
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
      } else {
        console.log("🔍 States different:");
        console.log("  Current QR rotation:", currentState.qrConfig.rotation);
        console.log("  Last QR rotation:", lastSnapshot.qrConfig.rotation);
        console.log("  Current device type:", currentState.deviceInfo.type);
        console.log("  Last device type:", lastSnapshot.deviceInfo.type);
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

  const updateQRConfig = (updates) => {
    console.log("🔧 updateQRConfig:", updates);
    setQRConfig((prev) => deepMerge(prev, updates));
  };

  const updateQRPositionPercentages = (percentages) => {
    console.log("🔧 updateQRPositionPercentages:", percentages);
    setQRConfig((prev) =>
      deepMerge(prev, {
        positionPercentages: deepMerge(
          prev.positionPercentages || {},
          percentages
        ),
      })
    );
  };

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

  // Load template data (for starting with templates)
  const loadTemplateData = (templateData) => {
    // Load template data into state
    setDeviceInfo(templateData.deviceInfo);
    setBackground(templateData.background);
    setQRConfig(templateData.qrConfig);
    setImagePalette(templateData.imagePalette);
    setUploadInfo(templateData.uploadInfo);
    setGeneratedInfo(templateData.generatedInfo);
    
    // Clear history since we're loading new data
    setPast([]);
    setFuture([]);
    setPresent(null);
    
    console.log("📋 Loaded template data:", templateData.name);
  };

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
    getPaletteExcluding,
    updateDeviceInfo,
    updateBackground,
    updateQRConfig,
    updateQRPositionPercentages,
    updateImagePalette,
    updateUploadInfo,
    updateGeneratedInfo,
    takeSnapshot,
    undo,
    redo,
    canUndo,
    canRedo,
    historyDebug,
    loadTemplateData,
  };
};
