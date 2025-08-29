import { ColorPicker } from "antd";
import { useState, useRef, useEffect } from "react";
import { useDevice } from "../../contexts/DeviceContext";
import chroma from "chroma-js";

export default function CustomColorInput({
  value,
  hasOpacity,
  preset,
  onChange,
  onColorPickerOpen,
  onColorPickerClose,
  submitColor,
}) {
  const { takeSnapshot } = useDevice();
  const [needsSnapshot, setNeedsSnapshot] = useState(false);
  const timeoutRef = useRef(null);
  const hexInputRef = useRef(null);
  const alphaInputRef = useRef(null);

  const [localHex, setLocalHex] = useState(value.slice(0, 7).toUpperCase());
  const [localAlpha, setLocalAlpha] = useState(Math.round(chroma(value).alpha() * 100));

  useEffect(() => {
    setLocalHex(value.slice(0, 7).toUpperCase());
    setLocalAlpha(Math.round(chroma(value).alpha() * 100));
  }, [value]);


  const handleHexBlur = () => {
    console.log("BLURRRRRRR");
    let hex = localHex.slice(0, 7).toUpperCase();
    if (!chroma.valid(hex) || hex.length !== 7) {
      setLocalHex("#FFFFFF");
        submitColor("#FFFFFF", localAlpha);
    } else {
      setLocalHex(hex);
        submitColor(hex, localAlpha);
    }
  };

  const handleHexEnter = (e) => {
    if (e.key === "Enter") {
      handleHexBlur();
    }
  };

  const handleAlphaBlur = () => {
    submitColor(localHex, localAlpha);
  };

  const isPressing = useRef(false);

  const handleAlphaKeyDown = (e) => {
    console.log("🔍 BEFORE keydown:", { key: e.key, isPressing: isPressing.current });
    
    if (e.key === "Enter") {
      e.preventDefault();
      alphaInputRef.current.blur();
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      console.log("�� Arrow key pressed, isPressing before:", isPressing.current);
      setLocalAlpha(e.target.value);
      submitColor(localHex, e.target.value, !isPressing.current);
      isPressing.current = true;
      console.log("�� Arrow key pressed, isPressing after:", isPressing.current);
    }
  };
  
  const handleAlphaKeyUp = () => {
    console.log("🔍 BEFORE keyup, isPressing:", isPressing.current);
    isPressing.current = false;
    console.log("🔍 AFTER keyup, isPressing:", isPressing.current);
  };

  // Handle color change - snapshot before first change of each interaction
  const handleColorChange = (color) => {
    setLocalHex(color.toHexString().slice(0, 7).toUpperCase());

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
        presets={[{ label: "Active Colors", colors: preset }]}
        onChange={handleColorChange}
        format="hex"
        size="small"
        showText
        onOpenChange={handleOpenChange}
      >
        <div
          className={`w-4 h-4 rounded-xs`}
          style={{ backgroundColor: value.slice(0, 7) }}
        />
      </ColorPicker>
      <input
        ref={hexInputRef}
        type="text"
        value={localHex}
        onChange={(e) => {
          setLocalHex(e.target.value);
        }}
        onBlur={handleHexBlur}
        onKeyDown={handleHexEnter}
        className="flex-1 min-w-0 px-2 py-2 bg-transparent outline-none text-xs"
      />

      {/* Divider */}
      {hasOpacity && (
        <>
          <div className="w-px h-5 bg-[var(--border-color)]" />

          {/* Right input (number with % suffix) */}
          <div className="flex items-center px-2 font-light text-xs">
            <input
              ref={alphaInputRef}
              type="number"
              min="0"
              max="100"
              value={localAlpha}
              onChange={(e) => {
                setLocalAlpha(e.target.value);
              }}
              onClick={() => {
                isPressing.current = false;
              }}
              onBlur={handleAlphaBlur}
              onKeyDown={handleAlphaKeyDown}
              onKeyUp={handleAlphaKeyUp}
              className="w-5 outline-none"
            />
            <span className="ml-1 ">%</span>
          </div>
        </>
      )}
    </div>
  );
}
