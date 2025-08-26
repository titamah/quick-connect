import React, { useState, useEffect } from "react";
import { useDevice } from "../../contexts/DeviceContext";

const PositionInput = ({
  type = "qr", // "qr" or "gradient"
  position, // current position object
  onUpdate, // update function
  deviceSize, // device size for QR boundary calculations
  units = "px", // "px" for QR, "%" for gradient
}) => {
  const { device } = useDevice();

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

  const handlePositionChange = (axis, value) => {
    // Apply boundary constraints (only for QR)
    let constrainedValue = value;
    if (type === "qr") {
      if (axis === "x") {
        constrainedValue = Math.max(minX, Math.min(maxX, value));
      } else if (axis === "y") {
        constrainedValue = Math.max(minY, Math.min(maxY, value));
      }
    }

    const newPos = { ...pos, [axis]: constrainedValue };
    setPos(newPos);

    // Update immediately for real-time feedback
    const newPosition = {
      x: type === "qr" ? newPos.x / deviceSize.x : newPos.x / 100,
      y: type === "qr" ? newPos.y / deviceSize.y : newPos.y / 100,
    };
    onUpdate(newPosition);
  };

  const handlePositionBlur = () => {
    // Apply boundary constraints (only for QR)
    let constrainedX = pos.x,
      constrainedY = pos.y;
    if (type === "qr") {
      constrainedX = Math.max(minX, Math.min(maxX, pos.x));
      constrainedY = Math.max(minY, Math.min(maxY, pos.y));
    }

    // Update local state with constrained values
    setPos({
      x: constrainedX,
      y: constrainedY,
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
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const axis = e.target.name === "x-input" ? "x" : "y";
      const increment = e.key === "ArrowUp" ? 1 : -1;
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
                value={pos.x}
                onChange={(e) =>
                  handlePositionChange("x", parseInt(e.target.value) || 0)
                }
                onBlur={handlePositionBlur}
                onKeyDown={handlePositionKeyDown}
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
                value={pos.y}
                onChange={(e) =>
                  handlePositionChange("y", parseInt(e.target.value) || 0)
                }
                onBlur={handlePositionBlur}
                onKeyDown={handlePositionKeyDown}
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
