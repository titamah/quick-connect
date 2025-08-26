import React, { useState, useEffect } from "react";
import { useDevice } from "../../contexts/DeviceContext";

const PositionInput = () => {
  const { device, updateQRConfig } = useDevice();
  
  // Calculate QR size (same logic as OptimizedWallpaper)
  const QR_SIZE_RATIO = 0.5;
  const qrSize = Math.min(device.size.x, device.size.y) * QR_SIZE_RATIO;
  
  // Calculate boundary constraints
  const minX = qrSize / 2;
  const maxX = device.size.x - qrSize / 2;
  const minY = qrSize / 2;
  const maxY = device.size.y - qrSize / 2;
  
  // Convert percentages to pixel values for display
  const [pos, setPos] = useState({
    x: Math.round(device.qr.positionPercentages.x * device.size.x),
    y: Math.round(device.qr.positionPercentages.y * device.size.y),
  });

  // Update local state when device size changes
  useEffect(() => {
    const rawX = Math.round(device.qr.positionPercentages.x * device.size.x);
    const rawY = Math.round(device.qr.positionPercentages.y * device.size.y);
    
    // Apply boundary constraints
    const constrainedX = Math.max(minX, Math.min(maxX, rawX));
    const constrainedY = Math.max(minY, Math.min(maxY, rawY));
    
    setPos({
      x: constrainedX,
      y: constrainedY,
    });
  }, [device.size.x, device.size.y, device.qr.positionPercentages, minX, maxX, minY, maxY]);

  const handlePositionChange = (axis, value) => {
    // Apply boundary constraints
    let constrainedValue = value;
    
    if (axis === 'x') {
      constrainedValue = Math.max(minX, Math.min(maxX, value));
    } else if (axis === 'y') {
      constrainedValue = Math.max(minY, Math.min(maxY, value));
    }
    
    const newPos = { ...pos, [axis]: constrainedValue };
    setPos(newPos);
  };

  const handlePositionBlur = () => {
    // Apply boundary constraints before converting to percentages
    const constrainedX = Math.max(minX, Math.min(maxX, pos.x));
    const constrainedY = Math.max(minY, Math.min(maxY, pos.y));
    
    // Update local state with constrained values
    setPos({
      x: constrainedX,
      y: constrainedY,
    });
    
    // Convert constrained pixel values back to percentages
    const newPercentages = {
      x: constrainedX / device.size.x,
      y: constrainedY / device.size.y,
    };
    
    updateQRConfig({
      positionPercentages: newPercentages,
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
              px
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
              px
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PositionInput;
