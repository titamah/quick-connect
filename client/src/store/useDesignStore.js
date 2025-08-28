import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { produce } from 'immer';

// Initial state matching your current device state structure
const initialState = {
  deviceInfo: {
    name: "Sample iPhone Wallpaper",
    type: "iPhone 15 Pro Max",
    size: { x: 1290, y: 2796 },
  },
  background: {
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
  },
  imagePalette: [],
  qrConfig: {
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
  },
  // Undo/Redo history
  history: {
    past: [],
    future: []
  }
};

// Helper function to create a snapshot of current state
const createSnapshot = (state) => ({
  deviceInfo: { ...state.deviceInfo },
  background: { ...state.background },
  imagePalette: [...state.imagePalette],
  qrConfig: { ...state.qrConfig }
});

// Helper function to restore state from snapshot
const restoreFromSnapshot = (snapshot) => ({
  deviceInfo: { ...snapshot.deviceInfo },
  background: { ...snapshot.background },
  imagePalette: [...snapshot.imagePalette],
  qrConfig: { ...snapshot.qrConfig }
});

export const useDeviceStore = create(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // ===== CONTROLLED SNAPSHOT FUNCTIONS =====
    
    // Take a snapshot manually - call this when you want to save state
    takeSnapshot: () => {
      console.log('🚀 takeSnapshot called!');
      const currentState = get();
      const snapshot = createSnapshot(currentState);
      
      set(produce((state) => {
        state.history.past.push(snapshot);
        state.history.future = []; // Clear future when new action is taken
      }));
      
      // Update the reactive canUndo/canRedo values
      get().updateHistoryState();
      
      // Debug: Print history after taking snapshot
      const newState = get();
      console.log('📸 Snapshot taken! History state:', {
        pastCount: newState.history.past.length,
        futureCount: newState.history.future.length,
        canUndo: newState.history.past.length > 0,
        canRedo: newState.history.future.length > 0,
        past: newState.history.past.map((snapshot, index) => ({
          index,
          deviceType: snapshot.deviceInfo.type,
          deviceSize: snapshot.deviceInfo.size
        })),
        future: newState.history.future.map((snapshot, index) => ({
          index,
          deviceType: snapshot.deviceInfo.type,
          deviceSize: snapshot.deviceInfo.size
        }))
      });
    },

    // Undo to previous snapshot
    undo: () => {
      const { history } = get();
      console.log('⏪ Undo called! Current history:', {
        pastCount: history.past.length,
        futureCount: history.future.length,
        canUndo: history.past.length > 0
      });
      
      if (history.past.length === 0) return false;
      
      const currentState = get();
      const previousSnapshot = history.past[history.past.length - 1];
      const newPast = history.past.slice(0, -1);
      
      set(produce((state) => {
        // Restore state from snapshot
        Object.assign(state, restoreFromSnapshot(previousSnapshot));
        
        // Update history
        state.history.past = newPast;
        state.history.future.unshift(createSnapshot(currentState));
      }));
      
      // Debug: Print history after undo
      const newState = get();
      console.log('⏪ Undo completed! New history:', {
        pastCount: newState.history.past.length,
        futureCount: newState.history.future.length,
        canUndo: newState.history.past.length > 0,
        canRedo: newState.history.future.length > 0,
        currentDevice: newState.deviceInfo.type
      });
      
      // Update the reactive canUndo/canRedo values
      get().updateHistoryState();
      
      return true;
    },

    // Redo to next snapshot
    redo: () => {
      const { history } = get();
      console.log('⏩ Redo called! Current history:', {
        pastCount: history.past.length,
        futureCount: history.future.length,
        canRedo: history.future.length > 0
      });
      
      if (history.future.length === 0) return false;
      
      const currentState = get();
      const nextSnapshot = history.future[0];
      const newFuture = history.future.slice(1);
      
      set(produce((state) => {
        // Restore state from snapshot
        Object.assign(state, restoreFromSnapshot(nextSnapshot));
        
        // Update history
        state.history.past.push(createSnapshot(currentState));
        state.history.future = newFuture;
      }));
      
      // Debug: Print history after redo
      const newState = get();
      console.log('⏩ Redo completed! New history:', {
        pastCount: newState.history.past.length,
        futureCount: newState.history.future.length,
        canUndo: newState.history.past.length > 0,
        canRedo: newState.history.future.length > 0,
        currentDevice: newState.deviceInfo.type
      });
      
      // Update the reactive canUndo/canRedo values
      get().updateHistoryState();
      
      return true;
    },

    // Clear all history
    clearHistory: () => {
      set(produce((state) => {
        state.history.past = [];
        state.history.future = [];
      }));
    },

    // ===== STATE UPDATE FUNCTIONS =====
    
    // Update device info
    updateDeviceInfo: (updates) => {
      set(produce((state) => {
        Object.assign(state.deviceInfo, updates);
      }));
    },

    // Update background
    updateBackground: (updates) => {
      set(produce((state) => {
        Object.assign(state.background, updates);
      }));
    },

    // Update QR config
    updateQRConfig: (updates) => {
      set(produce((state) => {
        Object.assign(state.qrConfig, updates);
      }));
    },

    // Update QR position percentages
    updateQRPositionPercentages: (percentages) => {
      set(produce((state) => {
        Object.assign(state.qrConfig.positionPercentages, percentages);
      }));
    },

    // Update image palette
    updateImagePalette: (colors) => {
      set(produce((state) => {
        state.imagePalette = colors;
      }));
    },

    // ===== COMPUTED VALUES =====
    
    // Get computed palette (same logic as your original)
    getPalette: () => {
      const state = get();
      const activeColors = [];

      // Add QR colors
      if (state.qrConfig.custom.primaryColor) {
        activeColors.push(state.qrConfig.custom.primaryColor.slice(0, 7));
      }
      if (state.qrConfig.custom.secondaryColor) {
        activeColors.push(state.qrConfig.custom.secondaryColor.slice(0, 7));
      }
      if (state.qrConfig.custom.borderColor) {
        activeColors.push(state.qrConfig.custom.borderColor.slice(0, 7));
      }

      // Add background colors
      if (state.background.style === "solid" && state.background.color) {
        activeColors.push(state.background.color.slice(0, 7));
      } else if (state.background.style === "gradient" && state.background.gradient.stops) {
        state.background.gradient.stops
          .filter((_, i) => i % 2 === 1)
          .forEach(color => {
            if (color) {
              activeColors.push(color.slice(0, 7));
            }
          });
      } else if (state.background.style === "image" && state.imagePalette.length > 0) {
        state.imagePalette.forEach(color => {
          if (color) {
            activeColors.push(color.slice(0, 7));
          }
        });
      }

      return [...new Set(activeColors)];
    },

    // Get palette excluding a color
    getPaletteExcluding: (excludeColor) => {
      const palette = get().getPalette();
      if (!excludeColor) return palette;
      
      const excludeHex = excludeColor.slice(0, 7);
      const normalizedExclude = excludeHex.toLowerCase();
      return palette.filter(color => color.toLowerCase() !== normalizedExclude);
    },

    // Legacy device object for backward compatibility
    getDevice: () => {
      const state = get();
      return {
        ...state.deviceInfo,
        ...state.background,
        qr: state.qrConfig,
        palette: state.getPalette(),
      };
    },

    // ===== HISTORY STATE GETTERS =====
    
    // These are reactive values that get updated when history changes
    canUndo: false,
    canRedo: false,

    // Update the canUndo/canRedo values whenever history changes
    updateHistoryState: () => {
      const state = get();
      const canUndo = state.history.past.length > 0;
      const canRedo = state.history.future.length > 0;
      
      set(produce((state) => {
        state.canUndo = canUndo;
        state.canRedo = canRedo;
      }));
      
      console.log('🔄 Updated history state - canUndo:', canUndo, 'canRedo:', canRedo);
      
      // Log detailed state information
      console.log('📊 History State Details:');
      console.log('Past states:', state.history.past.map((snapshot, index) => ({
        index,
        deviceType: snapshot.deviceInfo.type,
        deviceSize: snapshot.deviceInfo.size,
        backgroundStyle: snapshot.background.style,
        qrUrl: snapshot.qrConfig.url
      })));
      
      console.log('Present state:', {
        deviceType: state.deviceInfo.type,
        deviceSize: state.deviceInfo.size,
        backgroundStyle: state.background.style,
        qrUrl: state.qrConfig.url
      });
      
      console.log('Future states:', state.history.future.map((snapshot, index) => ({
        index,
        deviceType: snapshot.deviceInfo.type,
        deviceSize: snapshot.deviceInfo.size,
        backgroundStyle: snapshot.background.style,
        qrUrl: snapshot.qrConfig.url
      })));
    },

    getHistoryInfo: () => {
      const { history } = get();
      return {
        pastCount: history.past.length,
        futureCount: history.future.length,
        canUndo: history.past.length > 0,
        canRedo: history.future.length > 0
      };
    }
  }))
);
