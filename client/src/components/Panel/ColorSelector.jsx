import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { HexColorPicker } from "react-colorful";
import "./styles.css";
import { Grip } from "lucide-react";
import chroma from "chroma-js";
import { useDevice } from "../../contexts/DeviceContext";

const ColorSelector = ({ panelSize }) => {
  const { device, background, updateBackground, takeSnapshot, isMobile } =
    useDevice();
  const pickerRef = useRef(null);
  const inputRef = useRef(null);

  const [inputText, setInputText] = useState(background.color);

  const [needsSnapshot, setNeedsSnapshot] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    setInputText(background.color.toUpperCase());
    console.log(device.palette);
  }, [background.color]);

  useEffect(() => {
    const pickerElement = pickerRef.current;
    if (!pickerElement) return;

    const colorPicker = pickerElement.querySelector(
      ".react-colorful__saturation"
    );
    if (colorPicker && !colorPicker.classList.contains("styled")) {
      const classesToAdd = [
        "!border-radius-[4px]",
        "!border-[5px]",
        "!border-white",
        "dark:!border-[rgba(38,38,38,1)]",
        "!shadow-[0_0_0_.95px_rgb(215,215,215)]",
        "dark:!shadow-[0_0_0_.95px_rgb(66,66,66)]",
        "styled",
      ];
      colorPicker.classList.add(...classesToAdd);
    }

    const handleMouseDown = () => {
      setNeedsSnapshot(true);
    };

    const handleMouseUp = () => {
      setNeedsSnapshot(false);
      clearTimeout(timeoutRef.current);
    };

    const handleMouseLeave = () => {
      setNeedsSnapshot(false);
      clearTimeout(timeoutRef.current);
    };

    pickerElement.addEventListener("mousedown", handleMouseDown);
    pickerElement.addEventListener("mouseup", handleMouseUp);
    pickerElement.addEventListener("mouseleave", handleMouseLeave);

    // Add touch event listeners for mobile support
    pickerElement.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    pickerElement.addEventListener("touchend", handleTouchEnd, {
      passive: true,
    });

    return () => {
      pickerElement.removeEventListener("mousedown", handleMouseDown);
      pickerElement.removeEventListener("mouseup", handleMouseUp);
      pickerElement.removeEventListener("mouseleave", handleMouseLeave);
      pickerElement.removeEventListener("touchstart", handleTouchStart);
      pickerElement.removeEventListener("touchend", handleTouchEnd);
      clearTimeout(timeoutRef.current);
    };
  }, []);

  const colorBoxes = useMemo(() => {
    const activeColors = device.palette.filter(
      (color) => chroma.valid(color) && color !== background.color
    );

    if (activeColors.length === 0) {
      return null;
    } else if (isMobile) {
      return activeColors.map((color, index) => (
        <button key={`${color}-${index}`}
        onClick={() => {
          takeSnapshot("Select color");
          setInputText(color.toUpperCase());
          updateBackground({ color: color });
        }} 
        className="h-fit w-fit">
          <div
            className="w-6.5 h-6.5 border border-black/10 rounded-sm mr-2"
            style={{ backgroundColor: color }}
          />
        </button>
      ));
    } else {
      return activeColors.map((color, index) => (
        <button
          key={`${color}-${index}`}
          className="flex items-center border bg-black/5 dark:bg-black/15 px-1 text-[var(--text-secondary)] min-w-0 w-full h-[24px] rounded border-[var(--border-color)]/60 hover:opacity-75 transition-opacity cursor-pointer px-1"
          onClick={() => {
            takeSnapshot("Select color");
            setInputText(color.toUpperCase());
            updateBackground({ color: color });
          }}
          aria-label={`Select color ${color}`}
        >
          <div
            className="w-4 h-4 rounded-xs mr-2"
            style={{ backgroundColor: color }}
          />
          <span className="text-xs truncate">{color}</span>
        </button>
      ));
    }
  }, [device.palette, background.color, panelSize?.width]);

  const handleColorChange = useCallback(
    (newColor) => {
      if (!chroma.valid(newColor)) return;

      if (needsSnapshot) {
        takeSnapshot("Change solid color");
        setNeedsSnapshot(false);
      }

      setInputText(newColor.toUpperCase());
      updateBackground({ color: newColor });

      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setNeedsSnapshot(true);
      }, 500);
    },
    [needsSnapshot, takeSnapshot]
  );

  const handleInputChange = useCallback((e) => {
    let newValue = e.target.value.toUpperCase();

    if (newValue && !newValue?.startsWith("#")) {
      newValue = "#" + newValue;
    }

    newValue = newValue.replace(/[^#0-9A-F]/gi, "");
    setInputText(newValue);
  }, []);

  const handleInputBlur = useCallback(() => {
    takeSnapshot("Change color");

    const input = inputText.slice(0, 7);
    const newColor =
      chroma.valid(input) && inputText.length == 7
        ? inputText.toUpperCase()
        : "#FFFFFF";

    setInputText(newColor);
    updateBackground({ color: newColor });
  }, [inputText, background.color]);

  const handleInputKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        inputRef.current.blur();
      }
    },
    [inputText, background.color]
  );

  const toggleGrain = useCallback(() => {
    takeSnapshot("Toggle grain");
    updateBackground({ grain: !background.grain });
  }, [background.grain, updateBackground]);

  // Touch event handlers for mobile support
  const handleTouchStart = () => {
    console.log("📱 Touch start detected on color picker");
    setNeedsSnapshot(true);
  };

  const handleTouchEnd = () => {
    console.log("📱 Touch end detected on color picker");
    setNeedsSnapshot(false);
    clearTimeout(timeoutRef.current);
  };

  return (
    <div
      id="ColorSelectPanel"
      ref={pickerRef}
      className="dark:text-white w-full h-[290px] space-y-2.5"
    >
      <div className="flex flex-row items-center justify-between w-full mb-2">
        <input
          ref={inputRef}
          value={inputText}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          className={`p-1 border-1 border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-200/75 text-sm rounded-sm px-[15px] w-[95px] px-[15px] py-1 w-[95px]`}
          placeholder="#ffffff"
          maxLength={7}
        />
        <button
          onClick={toggleGrain}
          className="opacity-75 hover:opacity-100 cursor-pointer transition-opacity"
          aria-label={`${background.grain ? "Disable" : "Enable"} grain effect`}
        >
          <Grip
            size={20}
            color={device.grain ? "var(--accent)" : "var(--text-secondary)"}
          />
        </button>
      </div>
      <HexColorPicker
        color={background.color}
        onChange={handleColorChange}
        className={`space-y-1 !w-full`}
      />
      {colorBoxes && (
        <div className="w-full  space-y-2">
          <h4>Active Colors</h4>
          <div className="space-y-1 ">{colorBoxes}</div>
        </div>
      )}
    </div>
  );
};

export default ColorSelector;
