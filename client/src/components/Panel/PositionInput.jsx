import React, { useState, useEffect, useRef } from "react";
import { useDevice } from "../../contexts/DeviceContext";

const PositionInput = ({
  type = "qr", // "qr" or "gradient"
  position, // current position object
  onUpdate, // update function
  deviceSize, // device size for QR boundary calculations
  units = "px", // "px" for QR, "%" for gradient
}) => {
  const { takeSnapshot } = useDevice();

  // Calculate boundary constraints (only for QR)
  let minX = 0,
    maxX = 100,
    minY = 0,
    maxY = 100;
  if (type === "qr") {
    const QR_SIZE_RATIO = 0.5;
    const qrSize = Math.min(deviceSize.x, deviceSize.y) * QR_SIZE_RATIO;
    minX = qrSize / 2;
    maxX = deviceSize.x - qrSize / 2;
    minY = qrSize / 2;
    maxY = deviceSize.y - qrSize / 2;
  }

  // Convert to display values
  const [pos, setPos] = useState({
    x:
      type === "qr"
        ? Math.round(position.x * deviceSize.x)
        : Math.round(position.x * 100),
    y:
      type === "qr"
        ? Math.round(position.y * deviceSize.y)
        : Math.round(position.y * 100),
  });

  // String states for input values (allows free typing)
  const [inputValues, setInputValues] = useState({
    x: pos.x.toString(),
    y: pos.y.toString(),
  });

  // Refs for interval logic
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const [isArrowKeyActive, setIsArrowKeyActive] = useState(false);

  // Update local state when position or device size changes
  useEffect(() => {
    const rawX =
      type === "qr"
        ? Math.round(position.x * deviceSize.x)
        : Math.round(position.x * 100);
    const rawY =
      type === "qr"
        ? Math.round(position.y * deviceSize.y)
        : Math.round(position.y * 100);

    // Apply boundary constraints (only for QR)
    let constrainedX = rawX,
      constrainedY = rawY;
    if (type === "qr") {
      constrainedX = Math.max(minX, Math.min(maxX, rawX));
      constrainedY = Math.max(minY, Math.min(maxY, rawY));
    }

    setPos({
      x: constrainedX,
      y: constrainedY,
    });
    
    // Also update input values
    setInputValues({
      x: constrainedX.toString(),
      y: constrainedY.toString(),
    });
  }, [
    position.x,
    position.y,
    deviceSize.x,
    deviceSize.y,
    minX,
    maxX,
    minY,
    maxY,
    type,
  ]);

  const updatePosition = (axis, increment) => {
    const newValue = pos[axis] + increment;

    // Apply boundary constraints (only for QR)
    let constrainedValue = newValue;
    if (type === "qr") {
      if (axis === "x") {
        constrainedValue = Math.max(minX, Math.min(maxX, newValue));
      } else if (axis === "y") {
        constrainedValue = Math.max(minY, Math.min(maxY, newValue));
      }
    }

    const newPos = { ...pos, [axis]: constrainedValue };
    setPos(newPos);

    // Update immediately
    const newPosition = {
      x: type === "qr" ? newPos.x / deviceSize.x : newPos.x / 100,
      y: type === "qr" ? newPos.y / deviceSize.y : newPos.y / 100,
    };
    onUpdate(newPosition);
  };

  const handlePositionChange = (axis, value) => {
    // Update input value (allow free typing)
    setInputValues(prev => ({
      ...prev,
      [axis]: value
    }));
    
    // Don't update device immediately - only update local state
    // Device will be updated on blur or Enter key
  };

  const handlePositionBlur = () => {
    // Only take snapshot if not from arrow key interaction
    if (!isArrowKeyActive) {
      takeSnapshot();
    }
    
    // Convert string inputs to numbers
    const numX = parseInt(inputValues.x) || 0;
    const numY = parseInt(inputValues.y) || 0;
    
    // Apply boundary constraints (only for QR)
    let constrainedX = numX,
      constrainedY = numY;
    if (type === "qr") {
      constrainedX = Math.max(minX, Math.min(maxX, numX));
      constrainedY = Math.max(minY, Math.min(maxY, numY));
    }

    // Update local state with constrained values
    setPos({
      x: constrainedX,
      y: constrainedY,
    });
    
    // Update input values to show constrained values
    setInputValues({
      x: constrainedX.toString(),
      y: constrainedY.toString(),
    });

    // Convert to position values
    const newPosition = {
      x: type === "qr" ? constrainedX / deviceSize.x : constrainedX / 100,
      y: type === "qr" ? constrainedY / deviceSize.y : constrainedY / 100,
    };

    onUpdate(newPosition);
  };

  const handlePositionKeyDown = (e) => {
    if (e.key === "Enter") {
      handlePositionBlur();
      e.target.blur(); // Unfocus the input - cursor disappears
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      
      // Take snapshot BEFORE changes on first arrow key press
      if (!isArrowKeyActive) {
        setIsArrowKeyActive(true);
        takeSnapshot(); // Snapshot BEFORE the value changes
      }
      
      const axis = e.target.name === "x-input" ? "x" : "y";
      const increment = e.key === "ArrowUp" ? 1 : -1;
      
      // Clear any existing timeout/interval
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      // Immediate first increment
      updatePosition(axis, increment);
      
      // Start interval after delay for long press
      timeoutRef.current = setTimeout(() => {
        intervalRef.current = setInterval(() => {
          updatePosition(axis, increment);
        }, 50); // 50ms = 20 increments per second
      }, 200); // 200ms delay before starting interval
    }
  };

  return (
    <div className="flex-shrink-1 h-[24px] px-1.5 py-[2.5px] border border-[var(--border-color)]/50 rounded-sm bg-black/5 dark:bg-black/15 w-full items-center justify-center">
        <div className="flex flex-row gap-2 min-w-0 w-full h-[16px] justify-between">
          <span className="flex flex-row gap-1.5 items-center">
            <span className="text-xs flex text-[var(--text-secondary)]/50">
              X
            </span>
            <div className="relative flex-1 min-w-0">
              <input
                type="number"
                placeholder="X"
                name="x-input"
                value={inputValues.x}
                onChange={(e) =>
                  handlePositionChange("x", e.target.value)
                }
                onBlur={handlePositionBlur}
                onKeyDown={handlePositionKeyDown}
                onKeyUp={(e) => {
                  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                    // Clear interval and timeout
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
                className="w-full h-[16px] py-[2px] px-2 text-xs rounded-xs bg-[var(--bg-main)]"
              />
              <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-secondary)]/60">
                {units}
              </span>
            </div>
          </span>
          <span className="flex flex-row gap-1.5 items-center">
            <span className="text-xs flex text-[var(--text-secondary)]/50">
              Y
            </span>
            <div className="relative flex-1 min-w-0">
              <input
                type="number"
                placeholder="Y"
                name="y-input"
                value={inputValues.y}
                onChange={(e) =>
                  handlePositionChange("y", e.target.value)
                }
                onBlur={handlePositionBlur}
                onKeyDown={handlePositionKeyDown}
                onKeyUp={(e) => {
                  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                    // Clear interval and timeout
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
                className="w-full h-[16px] py-[2px] px-2 text-xs rounded-xs bg-[var(--bg-main)]"
              />
              <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-secondary)]/60">
                {units}
              </span>
            </div>
          </span>
        </div>
      </div>
  );
};

export default PositionInput;
