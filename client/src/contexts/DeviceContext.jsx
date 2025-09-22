import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useDeviceState } from "../hooks/useDeviceState";
import useWindowSize from "../hooks/useWindowSize";

const DeviceContext = createContext();

export const useDevice = () => {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error("useDevice must be used within a DeviceProvider");
  }
  return context;
};

export const DeviceProvider = ({ children }) => {
  const deviceState = useDeviceState();
  const windowSize = useWindowSize();
  const [isMobile, setIsMobile] = useState(false);
  
  // SIMPLE: Just track if QR is selected
  const [isQRSelected, setIsQRSelected] = useState(false);

  useEffect(() => {
    setIsMobile(windowSize.width < 768);
  }, [windowSize.width]);

  // SIMPLE: Just two functions
  const selectQR = useCallback(() => {
    console.log('🟢 SELECTING QR - called from:', new Error().stack);
    setIsQRSelected(true);
  }, []);
  
  const deselectAll = useCallback(() => {
    console.log('🔴 DESELECTING QR');
    setIsQRSelected(false);
  }, []);

  const value = {
    ...deviceState,
    isMobile,
    // Selection state
    isQRSelected,
    selectQR,
    deselectAll,
  };

  return (
    <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>
  );
};