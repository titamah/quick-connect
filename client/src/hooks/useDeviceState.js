import { useState, useEffect } from "react";
import { useDebouncedCallback } from "./useDebounce";
import { toast } from "react-toastify";
import {
  findNextSlot,
  getDesignCount,
  saveDesign,
  loadDesign,
  getAllDesigns,
  deleteDesign,
  updateDesign,
  MAX_DESIGNS
} from "../utils/indexedDB";

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

  const [libraryInfo, setLibraryInfo] = useState({
    selectedImageId: null,
    originalImageData: null,
    croppedImageData: null,
    crop: null,
  });

  const [past, setPast] = useState([]);
  const [present, setPresent] = useState(null);
  const [future, setFuture] = useState([]);

  // IndexedDB state management
  const [currentSlotId, setCurrentSlotId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [isIndexedDBAvailable, setIsIndexedDBAvailable] = useState(true);

  // Check IndexedDB availability on mount
  useEffect(() => {
    const checkIndexedDB = async () => {
      try {
        // Try to open a test database
        const testDB = indexedDB.open('test', 1);
        testDB.onerror = () => {
          setIsIndexedDBAvailable(false);
          console.warn("IndexedDB not available - auto-save disabled");
        };
        testDB.onsuccess = () => {
          setIsIndexedDBAvailable(true);
          // Clean up test database
          testDB.result.close();
          indexedDB.deleteDatabase('test');
        };
      } catch (error) {
        setIsIndexedDBAvailable(false);
        console.warn("IndexedDB not available - auto-save disabled");
      }
    };
    
    checkIndexedDB();
  }, []);

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
    libraryInfo: structuredClone(libraryInfo),
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
    setLibraryInfo(previousState.state.libraryInfo);

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
    setLibraryInfo(nextState.libraryInfo);

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

  const updateLibraryInfo = (updates) => {
    console.log("🔧 updateLibraryInfo:", updates);
    setLibraryInfo((prev) => deepMerge(prev, updates));
  };

  // IndexedDB functions
  const getCurrentStateForSave = () => ({
    deviceInfo: structuredClone(deviceInfo),
    background: structuredClone(background),
    qrConfig: structuredClone(qrConfig),
    imagePalette: structuredClone(imagePalette),
    uploadInfo: structuredClone(uploadInfo),
    libraryInfo: structuredClone(libraryInfo),
  });

  // Debounc
  // ed save function
  const debouncedSave = useDebouncedCallback(async () => {
    if (!currentSlotId) return;
    
    try {
      const state = getCurrentStateForSave();
      await updateDesign(currentSlotId, state);
      console.log("💾 Auto-saved to slot:", currentSlotId);
    } catch (error) {
      console.error("Failed to auto-save:", error);
      
      // Check if this is an IndexedDB error (private mode, quota exceeded, etc.)
      if (error.name === 'QuotaExceededError' || 
          error.name === 'InvalidStateError' || 
          error.name === 'UnknownError' ||
          error.message.includes('IndexedDB') ||
          error.message.includes('quota')) {
        
        // Disable auto-save for this session
        setIsIndexedDBAvailable(false);
        
        // Show toast notification (you can style this later)
        toast("🛡️ Private mode detected - Auto-save disabled", {
          type: "info",
          autoClose: 4000,
          position: "top-center"
        });
      }
    }
  }, 2000);

  // Save whenever state changes
  useEffect(() => {
    if (currentSlotId && isIndexedDBAvailable) {
      debouncedSave();
    }
  }, [deviceInfo, background, qrConfig, uploadInfo, libraryInfo, currentSlotId, isIndexedDBAvailable]);

  // Find and assign a slot for new designs
  const assignSlot = async () => {
    try {
      const count = await getDesignCount();
      if (count >= MAX_DESIGNS) {
        throw new Error("Maximum designs reached. Please delete one to continue.");
      }
      
      const slotId = await findNextSlot();
      if (!slotId) {
        throw new Error("No available slots found.");
      }
      
      // Create initial design in the slot
      const state = getCurrentStateForSave();
      await saveDesign(slotId, {
        ...state,
        name: "Untitled Design"
      });
      
      setCurrentSlotId(slotId);
      console.log("🎯 Created new design in slot:", slotId);
      return slotId;
    } catch (error) {
      console.error("Failed to assign slot:", error);
      throw error;
    }
  };

  // Save current design to a new slot
  const saveCurrentDesign = async (name = "Untitled Design") => {
    try {
      setIsLoading(true);
      const slotId = await assignSlot();
      const state = getCurrentStateForSave();
      
      await saveDesign(slotId, {
        ...state,
        name
      });
      
      console.log("💾 Saved design to slot:", slotId);
      return slotId;
    } catch (error) {
      console.error("Failed to save design:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Load design from a slot
  const loadDesignFromSlot = async (slotId) => {
    try {
      setIsLoading(true);
      const design = await loadDesign(slotId);
      
      // Restore all state
      setDeviceInfo(design.deviceInfo);
      setBackground(design.background);
      setQRConfig(design.qrConfig);
      setImagePalette(design.imagePalette);
      setUploadInfo(design.uploadInfo);
      setLibraryInfo(design.libraryInfo);
      
      // Set as current slot for auto-save
      setCurrentSlotId(slotId);
      
      // Clear history since we're loading a new state
      setPast([]);
      setFuture([]);
      setPresent(null);
      
      console.log("📂 Loaded design from slot:", slotId);
    } catch (error) {
      console.error("Failed to load design:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get all saved designs
  const loadSavedDesigns = async () => {
    try {
      const designs = await getAllDesigns();
      setSavedDesigns(designs);
      return designs;
    } catch (error) {
      console.error("Failed to load saved designs:", error);
      return [];
    }
  };

  // Delete a design
  const deleteDesignFromSlot = async (slotId) => {
    try {
      await deleteDesign(slotId);
      
      // If we're deleting the current slot, clear it
      if (currentSlotId === slotId) {
        setCurrentSlotId(null);
      }
      
      // Refresh saved designs list
      await loadSavedDesigns();
      
      console.log("🗑️ Deleted design from slot:", slotId);
    } catch (error) {
      console.error("Failed to delete design:", error);
      throw error;
    }
  };

  // Check if we can save more designs
  const canSaveMore = async () => {
    try {
      const count = await getDesignCount();
      return count < MAX_DESIGNS;
    } catch (error) {
      console.error("Failed to check design count:", error);
      return false;
    }
  };

  // Load template data (for starting with templates)
  const loadTemplateData = (templateData) => {
    // Clear current slot since we're loading template data
    setCurrentSlotId(null);
    
    // Load template data into state
    setDeviceInfo(templateData.deviceInfo);
    setBackground(templateData.background);
    setQRConfig(templateData.qrConfig);
    setImagePalette(templateData.imagePalette);
    setUploadInfo(templateData.uploadInfo);
    setLibraryInfo(templateData.libraryInfo);
    
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
    libraryInfo,
    getPaletteExcluding,
    updateDeviceInfo,
    updateBackground,
    updateQRConfig,
    updateQRPositionPercentages,
    updateImagePalette,
    updateUploadInfo,
    updateLibraryInfo,
    takeSnapshot,
    undo,
    redo,
    canUndo,
    canRedo,
    historyDebug,
    // IndexedDB functions
    currentSlotId,
    isLoading,
    savedDesigns,
    assignSlot,
    saveCurrentDesign,
    loadDesignFromSlot,
    loadSavedDesigns,
    deleteDesignFromSlot,
    canSaveMore,
    loadTemplateData,
    isIndexedDBAvailable,
  };
};
