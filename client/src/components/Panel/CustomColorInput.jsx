import { ColorPicker } from "antd";
import { useState } from "react";

export default function CustomColorInput(colorValue, hasOpacity, opacityValue, preset, onChange, onColorChange, onOpacityChange) {
  const [color, setColor] = useState("#F5F5F5");
  const [opacity, setOpacity] = useState(100);

  return (
<div className="flex items-center border bg-black/5 dark:bg-black/15 px-1 text-[var(--text-secondary)] min-w-0 h-[24px] rounded border-[var(--border-color)]/75">
        {/* Left input (hex text) */}
        <ColorPicker
          value={colorValue}
          placement="bottomRight"
          presets={[
            { label: "Recently Used", colors: preset },
          ]}
          onChange={onChange}
          format="hex"
          size="small"
          showText
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
          placeholder="#F5F5F5"
          className="flex-1 min-w-0 px-2 py-2 bg-transparent outline-none text-sm"
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
            defaultValue={100}
            value={opacityValue}
            onChange={onOpacityChange}
            className="w-5 outline-none"
          />
          <span className="ml-1 ">%</span>
        </div>
        </>}
      </div>
  );
}
