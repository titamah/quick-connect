import { useRef, useCallback, useEffect } from 'react';

export const useWorker = () => {
  const workerRef = useRef(null);
  const callbacksRef = useRef(new Map());

  useEffect(() => {
    // Create worker
    workerRef.current = new Worker(
      new URL('../workers/computeWorker.js', import.meta.url),
      { type: 'module' }
    );

    // Handle worker messages
    workerRef.current.onmessage = (e) => {
      const { type, data, error } = e.data;
      
      if (error) {
        console.error('Worker error:', error);
        return;
      }

      // Find and execute callback
      const callback = callbacksRef.current.get(type);
      if (callback) {
        callback(data);
        callbacksRef.current.delete(type);
      }
    };

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const postMessage = useCallback((type, data, callback) => {
    if (!workerRef.current) return;

    // Store callback for response
    if (callback) {
      callbacksRef.current.set(type, callback);
    }

    // Send message to worker
    workerRef.current.postMessage({ type, data });
  }, []);

  return { postMessage };
};

// Specific worker functions
export const useImageWorker = () => {
  const { postMessage } = useWorker();

  const downscaleImage = useCallback((imageData, maxWidth = 800, maxHeight = 600, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      postMessage('IMAGE_DOWNSCALE', { imageData, maxWidth, maxHeight, quality }, (data) => {
        if (data.error) {
          reject(new Error(data.error));
        } else {
          resolve(data);
        }
      });
    });
  }, [postMessage]);

  return { downscaleImage };
};

export const usePaletteWorker = () => {
  const { postMessage } = useWorker();

  const generatePalette = useCallback((colors, count = 5) => {
    return new Promise((resolve, reject) => {
      postMessage('PALETTE_GENERATION', { colors, count }, (data) => {
        if (data.error) {
          reject(new Error(data.error));
        } else {
          resolve(data.palette);
        }
      });
    });
  }, [postMessage]);

  return { generatePalette };
};

export const useQRWorker = () => {
  const { postMessage } = useWorker();

  const extractPaths = useCallback((svgString) => {
    return new Promise((resolve, reject) => {
      postMessage('QR_PATH_EXTRACTION', { svgString }, (data) => {
        if (data.error) {
          reject(new Error(data.error));
        } else {
          resolve(data.paths);
        }
      });
    });
  }, [postMessage]);

  return { extractPaths };
};
