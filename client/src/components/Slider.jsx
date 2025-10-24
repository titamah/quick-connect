import ColorPicker from "./ColorPicker";
import React, { useState, useRef, useEffect, useCallback } from "react";
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
  const rafRef = useRef(null);
  const isChangingRef = useRef(false);
  
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

  useEffect(() => {
    if (!id || !color ) return;

    const styleId = `slider-thumb-${id}`;
    let styleEl = document.getElementById(styleId);
    
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    styleEl.textContent = `
      #${id}-input::-webkit-slider-thumb {
        background-color: ${color} !important;
      }
      #${id}-input::-moz-range-thumb {
        background-color: ${color} !important;
      }
    `;

    return () => {
      const el = document.getElementById(styleId);
      if (el) {
        el.remove();
      }
    };
  }, [id, color]);

  const [needsSnapshot, setNeedsSnapshot] = useState(false);
  const timeoutRef = useRef(null);

  const onChangeRaf = useCallback((e) => {
    const value = e.target.value;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(() => {
      // Create a minimal event-like object for compatibility
      onChange?.({ target: { value } });
      rafRef.current = null;
    });
  }, [onChange]);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  
const handleColorChange = (color) => {
  isChangingRef.current = true; 
  
  if (needsSnapshot) {
    takeSnapshot();
    setNeedsSnapshot(false);
  }
  changeColor(color);
  clearTimeout(timeoutRef.current);
  timeoutRef.current = setTimeout(() => {
    setNeedsSnapshot(true);
    isChangingRef.current = false;
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

  const triggerColorPicker = () => {
    if (!drag && colorPickerRef.current) {
      colorPickerRef.current.open();
    }
  };
  // const formatTooltipValue = (val) => {
  //   if (max <= 1) {
  //     return `${Math.round(val * 100)}%`;
  //   } else {
  //     return `${Math.round(val)}%`;
  //   }
  // };

  return (
    <div
      className={`${
        stacked ? "absolute pointer-events-none" : "pointer-events-auto"
      } w-full h-full`}
      // onMouseDown={() => setShowTooltip(true)}
      // onMouseUp={(e) => {
      //   setShowTooltip(false);
      // }}
      // onTouchStart={() => setShowTooltip(true)}
      // onTouchEnd={(e) => {
      //   setShowTooltip(false);
      // }}
      onKeyDownCapture={(e) => {
        if (e.key === "Backspace") {
          deleteStop?.();
        }
      }}
    >
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
                setTimeout(() => {
                  if (!drag) {
                    triggerColorPicker();
                  }
                }, 50);
              }}
              onChange={onChangeRaf}
              onBlur={onBlur}
              onTouchStart={() => {
                console.log("📱 Touch start detected on stacked slider", { stacked });
                takeSnapshot();
                setDrag(false);
              }}
              onTouchEnd={() => {
                setTimeout(() => {
                  if (!drag) {
                    triggerColorPicker();
                  }
                }, 50);
              }}
              className="appearance-none w-full absolute -translate-y-[3px]"
            />
            
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
                isChanging={isChangingRef}
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
            onChange={onChangeRaf}
            onBlur={onBlur}
            onTouchStart={() => {
              console.log("📱 Touch start detected on slider");
              takeSnapshot();
              setDrag(false);
            }}
            className={`appearance-none w-full absolute -translate-y-[2px] rounded-full relative mt-[7.5px] h-[8px] bg-[var(--contrast-sheer)]`}
          />
        )}
      </div>
    </div>
  );
};
export default Slider;