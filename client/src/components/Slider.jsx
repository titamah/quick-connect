import ColorPicker from "./ColorPicker";
import React, { useState, useRef, useEffect } from "react";
import { useDevice } from "../contexts/DeviceContext";
const Slider = ({
  id,
  presets,
  stacked,
  deleteStop,
  value,
  onChange,
  changeColor,
  color,
  min = 0,
  max = 100,
  step = 1,
  onColorPickerOpen,
  onColorPickerClose,
  onBlur,
  isGradient = false,
}) => {
  const { takeSnapshot } = useDevice();
  const [showTooltip, setShowTooltip] = useState(false);
  const [thumbLeft, setThumbLeft] = useState(0);
  const [drag, setDrag] = useState(false);
  const containerRef = useRef(null);
  const sliderRef = useRef(null);
  const colorPickerRef = useRef(null);
  const updateThumbPosition = () => {
    if (!sliderRef.current) return;
    const slider = sliderRef.current;
    const percent = (value - min) / (max - min);
    const thumbOffset = percent * slider.offsetWidth;
    setThumbLeft(thumbOffset);
  };
  useEffect(() => {
    updateThumbPosition();
  }, [value]);
  const [needsSnapshot, setNeedsSnapshot] = useState(false);
  const timeoutRef = useRef(null);
  const handleColorChange = (color) => {
    if (needsSnapshot) {
      takeSnapshot();
      setNeedsSnapshot(false);
    }
    changeColor(color);
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

  // Function to trigger ColorPicker when click is detected (no drag)
  const triggerColorPicker = () => {
    if (!drag && colorPickerRef.current) {
      colorPickerRef.current.open();
    }
  };
  const formatTooltipValue = (val) => {
    if (max <= 1) {
      return `${Math.round(val * 100)}%`;
    } else {
      return `${Math.round(val)}%`;
    }
  };
  return (
    <div
      className={`${
        stacked ? "absolute pointer-events-none" : "pointer-events-auto"
      } w-full h-full`}
      onMouseDown={() => setShowTooltip(true)}
      onMouseUp={(e) => {
        setShowTooltip(false);
      }}
      onTouchStart={() => setShowTooltip(true)}
      onTouchEnd={(e) => {
        setShowTooltip(false);
      }}
      onKeyDownCapture={(e) => {
        if (e.key === "Backspace") {
          deleteStop?.();
        }
      }}
    >
      {showTooltip && (
        <div
          className="absolute -top-8 text-xs px-2 py-1 rounded bg-[var(--contrast)]"
          style={{
            left: thumbLeft,
            transform: "translateX(-50%)",
            color: "var(--bg-main)",
          }}
        >
          {formatTooltipValue(value)}
        </div>
      )}
      <div ref={containerRef} className={`relative`}>
        {stacked ? (
          <div className="relative">
            <input
              ref={sliderRef}
              id={id ? `${id}-input` : null}
              type="range"
              value={value}
              min={min}
              max={max}
              step={step}
              onChangeCapture={(e) => {
                setDrag(true);
              }}
              onMouseDown={() => {
                takeSnapshot();
                setDrag(false);
              }}
              onMouseUp={() => {
                // Use your original logic: trigger ColorPicker if no drag detected
                setTimeout(() => {
                  if (!drag) {
                    triggerColorPicker();
                  }
                }, 50); // Small delay to ensure drag state is set
              }}
              onChange={onChange}
              onBlur={onBlur}
              onTouchStart={() => {
                console.log("📱 Touch start detected on stacked slider", { stacked });
                takeSnapshot();
                setDrag(false);
              }}
              onTouchEnd={() => {
                // Same logic for touch
                setTimeout(() => {
                  if (!drag) {
                    triggerColorPicker();
                  }
                }, 50);
              }}
              className="appearance-none w-full absolute -translate-y-[2px]"
            />
            
            {/* ColorPicker without trigger - controlled remotely */}
            <div style={{ display: 'none' }}>
              <ColorPicker
                ref={colorPickerRef}
                value={color}
                onChange={handleColorChange}
                onOpenChange={handleOpenChange}
                presets={presets}
                mode="popover"
                placement="top"
                customPosition={{
                  x: (sliderRef.current?.getBoundingClientRect().left || 0) + thumbLeft,
                  y: sliderRef.current?.getBoundingClientRect().top || 0
                }}
                isGradient={isGradient}
                onDelete={deleteStop}
              />
            </div>
          </div>
        ) : (
          <input
            ref={sliderRef}
            id={id ? `${id}-input` : null}
            type="range"
            value={value}
            min={min}
            max={max}
            step={step}
            onChangeCapture={(e) => {
              setDrag(true);
            }}
            onMouseDown={() => {
              takeSnapshot();
              setDrag(false);
            }}
            onChange={onChange}
            onBlur={onBlur}
            onTouchStart={() => {
              console.log("📱 Touch start detected on slider");
              takeSnapshot();
              setDrag(false);
            }}
            className={`appearance-none w-full absolute -translate-y-[2px] ${
              stacked
                ? ""
                : "rounded-full relative mt-[7.5px] h-[8px] bg-[var(--contrast-sheer)]"
            }`}
          />
        )}
      </div>
    </div>
  );
};
export default Slider;