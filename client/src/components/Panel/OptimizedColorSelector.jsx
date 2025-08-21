// components/Panel/OptimizedColorSelector.jsx
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { HexColorPicker } from "react-colorful";
import "./styles.css";
import { Grip } from "lucide-react";
import chroma from "chroma-js";
import { useDevice } from "../../contexts/DeviceContext";
import { useDebounce } from "../../hooks/useDebounce";

const OptimizedColorSelector = ({ panelSize }) => {
  const { background, updateBackground, palette } = useDevice();
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

  // Generate color palette efficiently
  const colorCircles = useMemo(() => {
    if (!panelSize?.width) return null;

    const num = Math.round((panelSize.width - 20) / 40);
    const validColors = [
      palette.qr, 
      palette.bg, 
      palette.border
    ].filter(color => chroma.valid(color));

    if (validColors.length === 0) return null;

    try {
      const chromaScale = chroma.scale(validColors).mode("lch").colors(num);
      
      return chromaScale.map((color, index) => (
        <button
          key={`${color}-${index}`}
          className="recent-color my-auto border-black/25 dark:border-black/75 hover:opacity-50 transition-opacity"
          style={{ backgroundColor: color }}
          onClick={() => handleColorChange(color)}
          aria-label={`Select color ${color}`}
        />
      ));
    } catch (error) {
      console.warn('Error generating color palette:', error);
      return null;
    }
  }, [palette.qr, palette.bg, palette.border, panelSize?.width]);

  // Optimized color change handler
  const handleColorChange = useCallback((newColor) => {
    if (!chroma.valid(newColor)) return;
    
    setLocalColor(newColor);
    setInputText(newColor);
  }, []);

  // Optimized input change handler
  const handleInputChange = useCallback((e) => {
    const newValue = e.target.value;
    setInputText(newValue);
    
    if (chroma.valid(newValue)) {
      setLocalColor(newValue);
    }
  }, []);

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

      {/* Color palette */}
      {colorCircles && (
        <div className="w-full mb-3">
          <div className="flex flex-row flex-nowrap overflow-hidden w-full my-3 gap-2.5">
            {colorCircles}
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedColorSelector;