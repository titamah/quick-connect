import { useCallback } from 'react';
import { useDeviceStore } from '../store/useDesignStore';

// Snapshot trigger types
export const SNAPSHOT_TRIGGERS = {
  // Take snapshot immediately
  IMMEDIATE: 'immediate',
  
  // Take snapshot after a delay (debounced)
  DEBOUNCED: 'debounced',
  
  // Take snapshot on specific actions
  ON_COLOR_CHANGE: 'on_color_change',
  ON_POSITION_CHANGE: 'on_position_change',
  ON_DEVICE_CHANGE: 'on_device_change',
  ON_QR_CONFIG_CHANGE: 'on_qr_config_change',
  ON_BACKGROUND_CHANGE: 'on_background_change',
  
  // Take snapshot on user interaction end
  ON_MOUSE_UP: 'on_mouse_up',
  ON_BLUR: 'on_blur',
  ON_ENTER: 'on_enter'
};

export const useControlledSnapshots = () => {
  const { takeSnapshot } = useDeviceStore();
  
  console.log('🔍 useControlledSnapshots: takeSnapshot is:', typeof takeSnapshot, takeSnapshot);
  
  // Debounced snapshot with configurable delay
  const debouncedSnapshot = useCallback((delay = 500) => {
    let timeoutId;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        takeSnapshot();
      }, delay);
    };
  }, [takeSnapshot]);

  // Snapshot with specific trigger logic
  const snapshotWithTrigger = useCallback((trigger, options = {}) => {
    switch (trigger) {
      case SNAPSHOT_TRIGGERS.IMMEDIATE:
        return () => takeSnapshot();
        
      case SNAPSHOT_TRIGGERS.DEBOUNCED:
        return debouncedSnapshot(options.delay || 500);
        
      case SNAPSHOT_TRIGGERS.ON_COLOR_CHANGE:
        return (colorValue) => {
          // Only snapshot if color actually changed
          if (colorValue && typeof colorValue === 'string') {
            takeSnapshot();
          }
        };
        
      case SNAPSHOT_TRIGGERS.ON_POSITION_CHANGE:
        return (position) => {
          // Only snapshot if position is valid
          if (position && (position.x !== undefined || position.y !== undefined)) {
            takeSnapshot();
          }
        };
        
      case SNAPSHOT_TRIGGERS.ON_DEVICE_CHANGE:
        return (deviceInfo) => {
          console.log('🔍 ON_DEVICE_CHANGE trigger called with:', deviceInfo);
          // Only snapshot if device type changed
          if (deviceInfo && deviceInfo.name) {
            console.log('✅ Device info valid, calling takeSnapshot');
            takeSnapshot();
          } else {
            console.log('❌ Device info invalid:', deviceInfo);
          }
        };
        
      case SNAPSHOT_TRIGGERS.ON_QR_CONFIG_CHANGE:
        return (qrConfig) => {
          // Snapshot on QR config changes
          if (qrConfig) {
            takeSnapshot();
          }
        };
        
      case SNAPSHOT_TRIGGERS.ON_BACKGROUND_CHANGE:
        return (background) => {
          // Snapshot on background changes
          if (background) {
            takeSnapshot();
          }
        };
        
      case SNAPSHOT_TRIGGERS.ON_MOUSE_UP:
        return () => {
          // Snapshot when user finishes dragging/interacting
          takeSnapshot();
        };
        
      case SNAPSHOT_TRIGGERS.ON_BLUR:
        return () => {
          // Snapshot when input loses focus
          takeSnapshot();
        };
        
      case SNAPSHOT_TRIGGERS.ON_ENTER:
        return () => {
          // Snapshot when user presses Enter
          takeSnapshot();
        };
        
      default:
        return () => takeSnapshot();
    }
  }, [takeSnapshot, debouncedSnapshot]);

  // Batch snapshot - take snapshot after multiple changes
  const batchSnapshot = useCallback((changes = [], delay = 1000) => {
    let timeoutId;
    let changeCount = 0;
    
    return (changeType) => {
      changeCount++;
      
      // Clear existing timeout
      clearTimeout(timeoutId);
      
      // If this is a tracked change type, schedule snapshot
      if (changes.includes(changeType)) {
        timeoutId = setTimeout(() => {
          takeSnapshot();
          changeCount = 0;
        }, delay);
      }
    };
  }, [takeSnapshot]);

  // Snapshot with validation
  const validatedSnapshot = useCallback((validator) => {
    return (data) => {
      if (validator(data)) {
        takeSnapshot();
      }
    };
  }, [takeSnapshot]);

  return {
    takeSnapshot,
    debouncedSnapshot,
    snapshotWithTrigger,
    batchSnapshot,
    validatedSnapshot,
    SNAPSHOT_TRIGGERS
  };
};
