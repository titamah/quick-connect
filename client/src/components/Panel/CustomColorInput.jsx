import { ColorPicker } from "antd";
import { useState, useEffect, useRef } from "react";
import { useDevice } from "../../contexts/DeviceContext";

export default function CustomColorInput({value, colorValue, hasOpacity, opacityValue, preset, onChange, onColorChange, onOpacityChange, onColorBlur, onColorKeyDown, onOpacityBlur, onOpacityKeyDown, onColorPickerOpen, onColorPickerClose}) {
  const {takeSnapshot} = useDevice();
  // State for drag detection
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const pickerRef = useRef(null);
  
  const handleOpacityKeyDown = (e) => {
    if (onOpacityKeyDown) {
      onOpacityKeyDown(e);
    }
  };

  // Handle color change with drag detection
  const handleColorChange = (color) => {
    console.log('🎨 Color change:', { color, isDragging });
    onChange(color); // Immediate update
    setIsDragging(true); // Mark as dragging
    console.log('🔄 Set isDragging to true');
  };

  // Handle picker open/close
  const handleOpenChange = (open) => {
    // takeSnapshot();
    setIsPickerOpen(open);
    if (open) {
      onColorPickerOpen?.();
    } else {
      onColorPickerClose?.();
      // If picker closes while dragging, take snapshot
      if (isDragging) {
        setIsDragging(false);
        // takeSnapshot?.();
      }
    }
  };

  // Add mouse event listeners to detect drag end
  useEffect(() => {
    if (!isPickerOpen) return;

    const handleMouseUp = () => {
      if (isDragging) {
        console.log('✅ Taking snapshot on mouse up');
        setIsDragging(false);
        // Small delay to ensure color picker has processed the final color
        setTimeout(() => {
          takeSnapshot?.();
        }, 50);
      }
    };

    // Listen for mouseup anywhere on document while picker is open
    console.log('📌 Adding document mouseup listener');
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      console.log('🧹 Cleaning up document mouseup listener');
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPickerOpen, isDragging, takeSnapshot]);

  return (
<div className="flex items-center border bg-black/5 dark:bg-black/15 px-1 text-[var(--text-secondary)] min-w-0 w-full h-[24px] rounded border-[var(--border-color)]/75">
        {/* Left input (hex text) */}
        <ColorPicker
          value={value}
          placement="bottomRight"
          presets={[
            { label: "Active Colors", colors: preset },
          ]}
          onChange={handleColorChange}
          format="hex"
          size="small"
          showText
          onOpenChange={handleOpenChange}
        >
          <div
            className={`w-4 h-4 rounded-xs`}
            style={{ backgroundColor: colorValue }}
          />
        </ColorPicker>
        <input
          type="text"
          value={colorValue}
          onChange={onColorChange}
          onBlur={onColorBlur}
          onKeyDown={onColorKeyDown}
          className="flex-1 min-w-0 px-2 py-2 bg-transparent outline-none text-xs"
        />

        {/* Divider */}
        {hasOpacity && <>
        <div className="w-px h-5 bg-[var(--border-color)]" />

        {/* Right input (number with % suffix) */}
        <div className="flex items-center px-2 font-light text-xs">
          <input
            type="number"
            min="0"
            max="100"
            value={opacityValue}
            onChange={onOpacityChange}
            onBlur={onOpacityBlur}
            onKeyDown={handleOpacityKeyDown}
            className="w-5 outline-none"
          />
          <span className="ml-1 ">%</span>
        </div>
        </>}
      </div>
  );
}
