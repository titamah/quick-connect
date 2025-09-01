import { useMemo } from "react";
import useWindowSize from "./useWindowSize";

const STAGE_PADDING = 0.85;
const HEADER_HEIGHT = 52;

export const useStageCalculations = (deviceSize, panelSize, isOpen) => {
  const windowSize = useWindowSize();

  return useMemo(() => {
    let panelX = windowSize.width > 768 ? panelSize.width : 0;
    let panelY = 0;

    const availableWidth = isOpen
      ? STAGE_PADDING * windowSize.width - panelX
      : STAGE_PADDING * windowSize.width;

    const availableHeight = STAGE_PADDING * (windowSize.height - panelY - HEADER_HEIGHT)

    const scaleX = availableWidth / deviceSize.x;
    const scaleY = availableHeight / deviceSize.y;

    return Math.min(scaleX, scaleY);
  }, [deviceSize, panelSize, isOpen, windowSize]);
};
