import React, { useRef } from "react";
import { useDevice } from "../../contexts/DeviceContext";
import { useThrottledCallback } from "../../hooks/useDebounce";
import Slider from "../Slider";

const SNAP_THRESHOLD = 3; // Snap within 3% of 10% increments

const QRSizeInput = ({ sizePercentage, onUpdate }) => {
  const { takeSnapshot } = useDevice();
  
  const currentSizeRef = useRef(sizePercentage);
  currentSizeRef.current = sizePercentage;

  const throttledUpdateSize = useThrottledCallback((size) => {
    onUpdate(size);
  }, 16);

  const applySnapping = (value) => {
    // Find the nearest 10% increment
    const nearestTen = Math.round(value / 10) * 10;
    
    // If we're within the snap threshold, snap to the nearest 10%
    if (Math.abs(value - nearestTen) <= SNAP_THRESHOLD) {
      return Math.max(10, Math.min(100, nearestTen));
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
