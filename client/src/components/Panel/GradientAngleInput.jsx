import React, { useState, useEffect, useRef } from "react";
import { useDevice } from "../../contexts/DeviceContext";
import Slider from "../Slider";
import { RotateCcw, RotateCw } from "lucide-react";

const GradientAngleInput = () => {
  const { device, updateBackground } = useDevice();
  const [angle, setAngle] = useState(device.gradient.angle || 180);
  const intervalRef = useRef(null);

  // Update local state when gradient angle changes
  useEffect(() => {
    setAngle(device.gradient.angle || 180);
  }, [device.gradient.angle]);

  const handleAngleChange = (e) => {
    let value = parseInt(e.target.value, 10);

    // Snap if within 5 degrees of target
    const snapThreshold = 5;
    const snapPoints = Array.from({ length: 9 }, (_, i) => i * 45);

    for (let point of snapPoints) {
      if (Math.abs(value - point) <= snapThreshold) {
        value = point;
        break;
      }
    }

    setAngle(value);
  };

  const handleMouseDown = (val, lim) => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      setAngle((prevAngle) => {
        if (prevAngle === lim) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          return lim;
        }
        return prevAngle + val;
      });
    }, 20);
  };

  const handleMouseUp = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  const handleAngleBlur = () => {
    updateBackground({
      gradient: {
        ...device.gradient,
        angle: angle,
      }
    });
  };

  return (
    <div className="flex flex-row w-full my-4 items-center gap-2">
      <h4 className="text-[var(--text-primary)]/75 p-1 h-full !min-w-[50px]">
        Angle
      </h4>
      <div className="flex flex-row items-center w-full gap-1">
        <RotateCcw
          className="opacity-75 hover:opacity-100 cursor-pointer"
          size={20}
          onMouseDown={() => {
            handleMouseDown(-1, 0);
          }}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        <Slider
          id="gradient-angle-slide"
          color={"var(--accent)"}
          min="0"
          max="360"
          value={angle}
          onChange={handleAngleChange}
          onBlur={handleAngleBlur}
        />
        <RotateCw
          className="opacity-75 hover:opacity-100 cursor-pointer"
          size={20}
          onMouseDown={() => {
            handleMouseDown(1, 360);
          }}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
    </div>
  );
};

export default GradientAngleInput;
