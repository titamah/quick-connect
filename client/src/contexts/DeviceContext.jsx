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
  const { isMobile } = useWindowSize(); 
  
  const [isQRSelected, setIsQRSelected] = useState(false);

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
    isQRSelected,
    selectQR,
    deselectAll,
  };

  return (
    <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>
  );
};