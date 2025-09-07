import { createContext, useContext, useState } from 'react';
const PreviewContext = createContext();
export const usePreview = () => {
  const context = useContext(PreviewContext);
  if (!context) {
    throw new Error('usePreview must be used within a PreviewProvider');
  }
  return context;
};
export const PreviewProvider = ({ children }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const setExportState = (exporting) => {
    setIsExporting(exporting);
  };
  const togglePreview = () => {
    setIsPreviewVisible(!isPreviewVisible);
  };
  const setHovered = (hovered) => {
    setIsHovered(hovered);
  };
  const value = {
    isExporting,
    setExportState,
    isPreviewVisible,
    isHovered,
    togglePreview,
    setHovered,
    setIsPreviewVisible,
  };
  return (
    <PreviewContext.Provider value={value}>
      {children}
    </PreviewContext.Provider>
  );
};
