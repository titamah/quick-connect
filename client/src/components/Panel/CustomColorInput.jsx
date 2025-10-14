import ColorPicker from "../ColorPicker";
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
  const { takeSnapshot, isMobile } = useDevice();
  const hexInputRef = useRef(null);
  const alphaInputRef = useRef(null);
  const [localHex, setLocalHex] = useState(value.slice(0, 7).toUpperCase());
  const [localAlpha, setLocalAlpha] = useState(
    Math.round(chroma(value).alpha() * 100)
  );
  useEffect(() => {
    setLocalHex(value.slice(0, 7).toUpperCase());
    setLocalAlpha(Math.round(chroma(value).alpha() * 100));
  }, [value]);
  const [needsSnapshot, setNeedsSnapshot] = useState(false);
  const timeoutRef = useRef(null);
  const handleColorChange = (color) => {

    const hexString = typeof color === 'string' ? color : chroma(color).hex();
    setLocalHex(hexString.slice(0, 7).toUpperCase());
    if (needsSnapshot) {
      takeSnapshot();
      setNeedsSnapshot(false);
    }
    onChange(color);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setNeedsSnapshot(true);
    }, 500);
  };
  const handleOpenChange = (open) => {
    if (open) {
      setNeedsSnapshot(true);
      onColorPickerOpen?.();
    } else {
      setNeedsSnapshot(false);
      clearTimeout(timeoutRef.current);
      onColorPickerClose?.();
    }
  };
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
    console.log("🔍 BEFORE keydown:", {
      key: e.key,
      isPressing: isPressing.current,
    });
    if (e.key === "Enter") {
      e.preventDefault();
      alphaInputRef.current.blur();
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      console.log(
        "�� Arrow key pressed, isPressing before:",
        isPressing.current
      );
      setLocalAlpha(e.target.value);
      submitColor(localHex, e.target.value, !isPressing.current);
      isPressing.current = true;
      console.log(
        "�� Arrow key pressed, isPressing after:",
        isPressing.current
      );
    }
  };
  const handleAlphaKeyUp = () => {
    console.log("🔍 BEFORE keyup, isPressing:", isPressing.current);
    isPressing.current = false;
    console.log("🔍 AFTER keyup, isPressing:", isPressing.current);
  };
  return (
    <div className="flex items-center border bg-black/5 dark:bg-black/15 px-1 text-[var(--text-secondary)] min-w-0 w-full h-[24px] rounded border-[var(--border-color)]/75">
      <ColorPicker
        value={value}
        onChange={handleColorChange}
        onOpenChange={handleOpenChange}
        presets={preset || []}
        hasAlpha={hasOpacity}
        placement="bottomRight"
        mode="popover"
        trigger={
          <div
            className="w-4 h-4 rounded-xs cursor-pointer hover:scale-110 transition-transform"
            style={{ backgroundColor: value.slice(0, 7) }}
          />
        }
      />
      <input
        ref={hexInputRef}
        type="text"
        value={localHex}
        onChange={(e) => {
          setLocalHex(e.target.value);
        }}
        onBlur={handleHexBlur}
        onKeyDown={handleHexEnter}
        className={`flex-1 min-w-0 ${isMobile ? "px-1 py-1" : "px-2 py-2"} bg-transparent outline-none text-xs`}
      />
      {hasOpacity && (
        <>
          <div className="w-px h-5 bg-[var(--border-color)]" />
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
