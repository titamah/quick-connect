import React, { useState, useEffect } from "react";
import { useDevice } from "../../contexts/DeviceContext";

const GradientPositionInput = () => {
  const { device, updateBackground } = useDevice();
  
  // Convert percentages to display values (0-100)
  const [pos, setPos] = useState({
    x: Math.round(device.gradient.pos.x * 100),
    y: Math.round(device.gradient.pos.y * 100),
  });

  // Update local state when gradient position changes
  useEffect(() => {
    setPos({
      x: Math.round(device.gradient.pos.x * 100),
      y: Math.round(device.gradient.pos.y * 100),
    });
  }, [device.gradient.pos]);

  const handlePositionChange = (axis, value) => {
    const newPos = { ...pos, [axis]: value };
    setPos(newPos);
  };

  const handlePositionBlur = () => {
    // Convert display values back to percentages
    const newPosPercent = {
      x: pos.x / 100,
      y: pos.y / 100,
    };
    
    updateBackground({
      gradient: {
        ...device.gradient,
        pos: newPosPercent,
      }
    });
  };

  const handlePositionKeyDown = (e) => {
    if (e.key === 'Enter') {
      handlePositionBlur();
    }
  };

  return (
    <div className="flex-shrink-0 mx-2.5 border border-[var(--border-color)]/50 rounded-lg bg-black/5 dark:bg-black/15 w-full my-5">
      <div className="flex flex-row gap-1 items-center">
        <h4 className="text-[var(--text-primary)]/75 p-2 h-full">
          Position
        </h4>
        <div className="flex gap-2 items-center min-w-0 p-1 w-full">
          <span className="text-xs flex items-center text-[var(--text-secondary)]/50">X</span>
          <div className="relative flex-1 min-w-0">
            <input
              type="number"
              placeholder="X"
              value={pos.x}
              onChange={(e) => handlePositionChange('x', parseInt(e.target.value) || 0)}
              onBlur={handlePositionBlur}
              onKeyDown={handlePositionKeyDown}
              className="w-full py-[2px] px-2 text-xs border border-[var(--border-color)]/25 rounded bg-[var(--bg-main)]"
            />
            <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-secondary)]/60">
              %
            </span>
          </div>
    
          <span className="text-xs flex items-center text-[var(--text-secondary)]/50">Y</span>
          <div className="relative flex-1 min-w-0">
            <input
              type="number"
              placeholder="Y"
              value={pos.y}
              onChange={(e) => handlePositionChange('y', parseInt(e.target.value) || 0)}
              onBlur={handlePositionBlur}
              onKeyDown={handlePositionKeyDown}
              className="w-full py-[2px] px-2 text-xs border border-[var(--border-color)]/25 rounded bg-[var(--bg-main)]"
            />
            <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-secondary)]/60">
              %
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradientPositionInput;
