import React, { useState, useEffect, useRef } from "react";
import { useDevice } from "../../contexts/DeviceContext";
import Slider from "../Slider";
import { RotateCcw, RotateCw } from "lucide-react";
const AngleInput = ({ type = "qr", angle: currentAngle, onUpdate }) => {
  const { takeSnapshot } = useDevice();
  const [angle, setAngle] = useState(currentAngle || 0);
  const intervalRef = useRef(null);
  useEffect(() => {
    setAngle(currentAngle || 0);
  }, [currentAngle]);
  const handleAngleChange = (e) => {
    let value = parseInt(e.target.value, 10);
    const snapThreshold = 5;
    const snapPoints = [-180, -135, -90, -45, 0, 45, 90, 135, 180];
    for (let point of snapPoints) {
      if (Math.abs(value - point) <= snapThreshold) {
        value = point;
        break;
      }
    }
    setAngle(value);
    onUpdate(value);
  };
  const handleMouseDown = (val, lim) => {
    takeSnapshot();
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      setAngle((prevAngle) => {
        const newAngle = prevAngle === lim ? lim : prevAngle + val;
        if (newAngle === lim) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        onUpdate(newAngle);
        return newAngle;
      });
    }, 20);
  };
  const handleMouseUp = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  };
  const handleAngleBlur = () => {
    onUpdate(angle);
  };
  return (
    <div className="flex flex-row w-full items-center gap-2">
      <div className="flex flex-row items-center w-full gap-1">
        <RotateCcw
          className="opacity-75 hover:opacity-100  text-[var(--text-secondary)] cursor-pointer"
          size={20}
          onMouseDown={() => {
            handleMouseDown(-1, -180);
          }}
          onMouseUp={() => {
            handleMouseUp();
          }}
          onMouseLeave={handleMouseUp}
          onTouchStart={() => {
            handleMouseDown(-1, -180);
          }}
          onTouchEnd={() => {
            handleMouseUp();
          }}
        />
        <Slider
          id={`${type}-angle-slide`}
          min="-180"
          max="180"
          value={angle}
          onChange={handleAngleChange}
          onBlur={handleAngleBlur}
        />
        <RotateCw
          className="opacity-75 hover:opacity-100  text-[var(--text-secondary)] cursor-pointer"
          size={20}
          onMouseDown={() => {
            handleMouseDown(1, 180);
          }}
          onMouseUp={() => {
            handleMouseUp();
          }}
          onMouseLeave={handleMouseUp}
          onTouchStart={() => {
            handleMouseDown(1, 180);
          }}
          onTouchEnd={() => {
            handleMouseUp();
          }}
        />
      </div>
    </div>
  );
};
export default AngleInput;
