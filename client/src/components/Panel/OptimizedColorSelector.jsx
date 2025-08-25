// components/Panel/OptimizedColorSelector.jsx
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { HexColorPicker } from "react-colorful";
import "./styles.css";
import { Grip } from "lucide-react";
import chroma from "chroma-js";
import { useDevice } from "../../contexts/DeviceContext";
import { useDebounce } from "../../hooks/useDebounce";

const OptimizedColorSelector = ({ panelSize }) => {
  const { device, background, updateBackground, palette } = useDevice();
  const pickerRef = useRef(null);
  
  // Local state for immediate UI updates
  const [localColor, setLocalColor] = useState(background.color);
  const [inputText, setInputText] = useState(background.color);
  
  // Debounce the color updates to reduce re-renders
  const debouncedColor = useDebounce(localColor, 300);

  // Update the global state only when debounced value changes
  useEffect(() => {
    if (debouncedColor !== background.color) {
      updateBackground({ color: debouncedColor });
    }
  }, [debouncedColor, background.color, updateBackground]);

  // Sync local state when background color changes externally
  useEffect(() => {
    setLocalColor(background.color);
    setInputText(background.color);
  }, [background.color]);

  // Optimize color picker styling
  useEffect(() => {
    const pickerElement = pickerRef.current;
    if (!pickerElement) return;

    const colorPicker = pickerElement.querySelector(".react-colorful__saturation");
    if (colorPicker && !colorPicker.classList.contains("styled")) {
      const classesToAdd = [
        "!border-radius-[4px]",
        "!border-[5px]",
        "!border-white",
        "dark:!border-[rgba(38,38,38,1)]",
        "!shadow-[0_0_0_.95px_rgb(215,215,215)]",
        "dark:!shadow-[0_0_0_.95px_rgb(66,66,66)]",
        "styled" // Marker to prevent re-styling
      ];
      colorPicker.classList.add(...classesToAdd);
    }
  }, []);

  // Generate active colors palette
  const colorBoxes = useMemo(() => {
    if (!panelSize?.width) return null;

    // Use the active colors from the palette (excluding current background color)
    const activeColors = device.palette.filter(color => 
      chroma.valid(color) && color !== background.color
    );

    if (activeColors.length === 0) return null;

    return activeColors.map((color, index) => (
      <button
        key={`${color}-${index}`}
        className="flex items-center border bg-black/5 dark:bg-black/15 px-1 text-[var(--text-secondary)] min-w-0 w-full h-[24px] rounded border-[var(--border-color)]/60 hover:opacity-75 transition-opacity cursor-pointer"
        onClick={() => handleColorChange(color)}
        aria-label={`Select color ${color}`}
      >
        <div
          className="w-4 h-4 rounded-xs mr-2"
          style={{ backgroundColor: color }}
        />
        <span className="text-xs truncate">{color}</span>
      </button>
    ));
  }, [device.palette, background.color, panelSize?.width]);

  // Optimized color change handler
  const handleColorChange = useCallback((newColor) => {
    if (!chroma.valid(newColor)) return;
    
    setLocalColor(newColor.toUpperCase());
    setInputText(newColor.toUpperCase());
  }, []);

  // Input change handler - just update the input text
  const handleInputChange = useCallback((e) => {
    let newValue = e.target.value.toUpperCase();
    
    // Add # prefix if missing
    if (newValue && !newValue.startsWith('#')) {
      newValue = '#' + newValue;
    }
    
    // Remove any non-hex characters except #
    newValue = newValue.replace(/[^#0-9A-F]/gi, '');
    
    // Limit to 7 characters (including #)
    if (newValue.length > 7) {
      newValue = newValue.slice(0, 7);
    }
    
    setInputText(newValue);
  }, []);

  // Handle blur - validate and update color if valid
  const handleInputBlur = useCallback(() => {
    if (chroma.valid(inputText)) {
      setLocalColor(inputText.toUpperCase());
    } else {
      // Reset to original value if invalid
      setInputText(background.color.toUpperCase());
    }
  }, [inputText, background.color]);

  // Handle Enter key - validate and update color if valid
  const handleInputKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && chroma.valid(inputText)) {
      setLocalColor(inputText.toUpperCase());
    } else if (e.key === 'Enter') {
      // Reset to original value if invalid
      setInputText(background.color.toUpperCase());
    }
  }, [inputText, background.color]);

  // Toggle grain effect
  const toggleGrain = useCallback(() => {
    updateBackground({ grain: !background.grain });
  }, [background.grain, updateBackground]);

  return (
    <div
      id="ColorSelectPanel"
      ref={pickerRef}
      className="dark:text-white w-full h-[290px] space-y-2.5"
    >
      {/* Color input and grain toggle */}
      <div className="flex flex-row items-center justify-between w-full mb-2">
        <input
          value={inputText}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          className="p-1 border-1 border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-200/75 text-sm rounded-sm px-[15px] w-[95px]"
          placeholder="#ffffff"
          maxLength={7}
        />
        <button
          onClick={toggleGrain}
          className="opacity-75 hover:opacity-100 cursor-pointer transition-opacity"
          aria-label={`${background.grain ? 'Disable' : 'Enable'} grain effect`}
        >
          <Grip size={20} />
        </button>
      </div>

      {/* Color picker */}
      <HexColorPicker
        color={localColor}
        onChange={handleColorChange}
        className="space-y-1 !w-full"
      />

      {/* Active Colors Palette */}
      {colorBoxes && (
        <div className="w-full my-4 space-y-2">
          <h4 className="text-xs text-[var(--text-secondary)]/75">Active Colors</h4>
          <div className="space-y-1">
            {colorBoxes}
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedColorSelector;