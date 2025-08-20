// hooks/useStageCalculations.js
import { useMemo } from 'react';
import { useWindowSize } from './useWindowSize';

const STAGE_PADDING = 0.85;
const HEADER_HEIGHT = 52;

export const useStageCalculations = (deviceSize, panelSize, isOpen) => {
  const windowSize = useWindowSize();

  return useMemo(() => {
    let panelX, panelY;
    
    if (window.innerHeight > 640) {
      panelX = panelSize.width;
      panelY = 0;
    } else {
      panelX = 0;
      panelY = panelSize.height;
    }

    const availableWidth = isOpen 
      ? STAGE_PADDING * window.innerWidth - panelX 
      : STAGE_PADDING * window.innerWidth;
      
    const availableHeight = isOpen 
      ? STAGE_PADDING * (window.innerHeight - panelY - HEADER_HEIGHT)
      : STAGE_PADDING * (window.innerHeight - HEADER_HEIGHT);

    const scaleX = availableWidth / deviceSize.x;
    const scaleY = availableHeight / deviceSize.y;
    
    return Math.min(scaleX, scaleY);
  }, [deviceSize, panelSize, isOpen, windowSize]);
};

