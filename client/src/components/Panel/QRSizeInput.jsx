import React, { useRef } from "react";
import { useDevice } from "../../contexts/DeviceContext";
import Slider from "../Slider";

const SNAP_THRESHOLD = 0.03; 
const SNAP_POINTS = [0.25, 0.5, 0.75]; 

const QRSizeInput = ({ scale, onUpdate }) => {
  const { takeSnapshot } = useDevice();
  const currentSizeRef = useRef(scale);
  currentSizeRef.current = scale;

  const applySnapping = (value) => {
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
    onUpdate(snappedValue);
  };

  const handleSliderMouseDown = () => {
    takeSnapshot("Change QR Size");
  };

  const handleSliderTouchStart = () => {
    console.log("📱 Touch start on QR size slider");
    takeSnapshot("Change QR Size");
  };

  return (
    <Slider
      min="0.1"
      max="1"
      step="0.01" 
      value={scale || 0.5}
      onChange={handleSliderChange}
      onMouseDown={handleSliderMouseDown}
      onTouchStart={handleSliderTouchStart}
    />
  );
};

export default QRSizeInput;