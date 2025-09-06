import React, { useRef } from "react";
import { useDevice } from "../../contexts/DeviceContext";
import { useThrottledCallback } from "../../hooks/useDebounce";
import Slider from "../Slider";

const SNAP_THRESHOLD = 0.03; // Snap within 3% of quarter values
const SNAP_POINTS = [0.25, 0.5, 0.75]; // Quarter values to snap to

const QRSizeInput = ({ scale, onUpdate }) => {
  const { takeSnapshot } = useDevice();
  
  const currentSizeRef = useRef(scale);
  currentSizeRef.current = scale;

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
      min="0.1"
      max="1"
      step="0.01" // Fixed! Was "1" now "0.01" for smooth sliding
      value={scale || 0.5}
      onChange={handleSliderChange}
      onMouseDown={handleSliderMouseDown}
    />
  );
};

export default QRSizeInput;