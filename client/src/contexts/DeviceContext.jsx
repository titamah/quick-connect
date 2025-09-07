import React, { createContext, useContext, useState, useEffect } from "react";
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
  useEffect(() => {
    setIsMobile(windowSize.width < 768);
  }, [windowSize.width]);
  const value = {
    ...deviceState,
    isMobile,
  };
  return (
    <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>
  );
};
