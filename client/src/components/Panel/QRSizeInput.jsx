import React, { useRef } from "react";
import { useDevice } from "../../contexts/DeviceContext";
import { useThrottledCallback } from "../../hooks/useDebounce";
import Slider from "../Slider";

const SNAP_THRESHOLD = 3; // Snap within 3% of quarter values
const SNAP_POINTS = [25, 50, 75]; // Quarter values to snap to

const QRSizeInput = ({ sizePercentage, onUpdate }) => {
  const { takeSnapshot } = useDevice();
  
  const currentSizeRef = useRef(sizePercentage);
  currentSizeRef.current = sizePercentage;

  const throttledUpdateSize = useThrottledCallback((size) => {
    onUpdate(size);
  }, 16);

  const applySnapping = (value) => {
    // Check if we're close to any snap points
    for (const snapPoint of SNAP_POINTS) {
      if (Math.abs(value - snapPoint) <= SNAP_THRESHOLD) {
        return snapPoint;
      }
    }
    
    return value;
  };

  const handleSliderChange = (e) => {
    const rawValue = parseFloat(e.target.value);
    const snappedValue = applySnapping(rawValue);
    throttledUpdateSize(snappedValue);
  };

  const handleSliderMouseDown = () => {
    takeSnapshot("Change QR Size");
  };

  return (
    <Slider
      min="10"
      max="100"
      step="1"
      value={sizePercentage || 50}
      onChange={handleSliderChange}
      onMouseDown={handleSliderMouseDown}
    />
  );
};

export default QRSizeInput;
