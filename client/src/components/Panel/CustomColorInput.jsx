import { ColorPicker } from "antd";
import { useState, useRef } from "react";
import { useDevice } from "../../contexts/DeviceContext";

export default function CustomColorInput({value, colorValue, hasOpacity, opacityValue, preset, onChange, onColorChange, onOpacityChange, onColorBlur, onColorKeyDown, onOpacityBlur, onOpacityKeyDown, onColorPickerOpen, onColorPickerClose}) {
  const {takeSnapshot} = useDevice();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [needsSnapshot, setNeedsSnapshot] = useState(false);
  const timeoutRef = useRef(null);
  
  const handleOpacityKeyDown = (e) => {
    if (onOpacityKeyDown) {
      onOpacityKeyDown(e);
    }
  };

  // Handle color change - snapshot before first change of each interaction
  const handleColorChange = (color) => {
    if (needsSnapshot) {
      takeSnapshot();
      setNeedsSnapshot(false);
    }
    
    onChange(color);
    
    // Set up timeout to mark next change as needing snapshot
    // (indicates start of new interaction after pause)
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setNeedsSnapshot(true);
    }, 500); // 500ms pause = new interaction
  };

  // Handle picker open/close
  const handleOpenChange = (open) => {
    setIsPickerOpen(open);
    
    if (open) {
      // Mark that next change needs snapshot
      setNeedsSnapshot(true);
      onColorPickerOpen?.();
    } else {
      // Clean up when picker closes
      setNeedsSnapshot(false);
      clearTimeout(timeoutRef.current);
      onColorPickerClose?.();
    }
  };

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