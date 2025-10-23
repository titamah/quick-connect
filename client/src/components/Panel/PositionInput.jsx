import React, { useState, useEffect, useRef } from "react";
import { useDevice } from "../../contexts/DeviceContext";

const PositionInput = ({
  type = "",
  position,
  onUpdate,
  deviceSize,
  units = "px",
  qrScale = 0.5,
}) => {
  const { takeSnapshot, isMobile } = useDevice();
  
  let minX = 0, maxX = 100, minY = 0, maxY = 100;
  
  const [pos, setPos] = useState({
    x: Math.round(position.x * 100),
    y: Math.round(position.y * 100),
  });

  const [inputValues, setInputValues] = useState({
    x: pos.x.toString(),
    y: pos.y.toString(),
  });

  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const [isArrowKeyActive, setIsArrowKeyActive] = useState(false);

  useEffect(() => {
    const rawX = Math.round(position.x * 100);
    const rawY = Math.round(position.y * 100);
    
    let constrainedX = rawX, constrainedY = rawY;
    

    setPos({ x: constrainedX, y: constrainedY });
    setInputValues({ x: constrainedX.toString(), y: constrainedY.toString() });
  }, [position.x, position.y, deviceSize.x, deviceSize.y, minX, maxX, minY, maxY, type, qrScale]);

  const updatePosition = (axis, increment) => {
    const newValue = pos[axis] + increment;
    let constrainedValue = newValue;

    const newPos = { ...pos, [axis]: constrainedValue };
    setPos(newPos);

    const newPosition = {
      x: newPos.x / 100,
      y: newPos.y / 100,
    };
    onUpdate(newPosition);
  };

  const handlePositionChange = (axis, value) => {
    setInputValues((prev) => ({ ...prev, [axis]: value }));
  };

  const handlePositionBlur = () => {
    takeSnapshot("Change position");
    
    const numX = parseInt(inputValues.x) || 0;
    const numY = parseInt(inputValues.y) || 0;
    
    let constrainedX = numX, constrainedY = numY;

    setPos({ x: constrainedX, y: constrainedY });
    setInputValues({ x: constrainedX.toString(), y: constrainedY.toString() });

    const newPosition = {
      x: constrainedX / 100,
      y: constrainedY / 100,
    };
    onUpdate(newPosition);
  };

  const handlePositionKeyDown = (e) => {
    if (e.key === "Enter") {
      handlePositionBlur();
      e.target.blur();
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      
      if (!isArrowKeyActive) {
        setIsArrowKeyActive(true);
        takeSnapshot("Change position with arrows");
      }

      const axis = e.target.name === "x-input" ? "x" : "y";
      const increment = e.key === "ArrowUp" ? 1 : -1;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      updatePosition(axis, increment);

      timeoutRef.current = setTimeout(() => {
        intervalRef.current = setInterval(() => {
          updatePosition(axis, increment);
        }, 50);
      }, 200);
    }
  };

  return (
    <div className={`flex-shrink-1 px-1.5 py-[2.5px] border border-[var(--border-color)]/50 rounded-sm bg-black/5 dark:bg-black/15 w-full items-center justify-center ${isMobile ? "h-[28px]" : "h-[24px]"}`}>
      <div className="flex flex-row gap-2 min-w-0 w-full h-full justify-between">
        <span className="relative flex flex-row gap-1.5 items-center h-full w-full">
          <span className="text-xs flex text-[var(--text-secondary)]/50">X</span>
          <input
            type="number"
            placeholder="X"
            name="x-input"
            value={inputValues.x}
            onChange={(e) => handlePositionChange("x", e.target.value)}
            onBlur={handlePositionBlur}
            onKeyDown={handlePositionKeyDown}
            onKeyUp={(e) => {
              if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                if (timeoutRef.current) {
                  clearTimeout(timeoutRef.current);
                  timeoutRef.current = null;
                }
                if (intervalRef.current) {
                  clearInterval(intervalRef.current);
                  intervalRef.current = null;
                }
                setIsArrowKeyActive(false);
              }
            }}
            className={`w-full h-[95%] py-[2px] px-2 rounded-xs bg-[var(--bg-main)]
                      ${ isMobile ? "text-sm" : "text-xs"}`}
          />
          <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-secondary)]/60">
            {units}
          </span>
        </span>
        <span className="relative flex flex-row gap-1.5 items-center h-full w-full">
          <span className="text-xs flex text-[var(--text-secondary)]/50">Y</span>
          <input
            type="number"
            placeholder="Y"
            name="y-input"
            value={inputValues.y}
            onChange={(e) => handlePositionChange("y", e.target.value)}
            onBlur={handlePositionBlur}
            onKeyDown={handlePositionKeyDown}
            onKeyUp={(e) => {
              if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                if (timeoutRef.current) {
                  clearTimeout(timeoutRef.current);
                  timeoutRef.current = null;
                }
                if (intervalRef.current) {
                  clearInterval(intervalRef.current);
                  intervalRef.current = null;
                }
                setIsArrowKeyActive(false);
              }
            }}
            className={`w-full h-[95%] py-[2px] px-2 rounded-xs bg-[var(--bg-main)]
                      ${ isMobile ? "text-sm" : "text-xs"}`}
          />
          <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-secondary)]/60">
            {units}
          </span>
        </span>
      </div>
    </div>
  );
};

export default PositionInput;