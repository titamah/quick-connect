import { createContext, useContext } from 'react';
import { useDeviceState } from '../hooks/useDeviceState';

const DeviceContext = createContext();

export const DeviceProvider = ({ children }) => {
  const deviceState = useDeviceState();
  
  return (
    <DeviceContext.Provider value={deviceState}>
      {children}
    </DeviceContext.Provider>
  );
};

export const useDevice = () => {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDevice must be used within DeviceProvider');
  }
  return context;
};