import { useState, useEffect, useRef, useCallback } from "react";
import "preline/preline";
import { useDevice } from "../../contexts/DeviceContext";
import CustomColorInput from "./CustomColorInput";
import PositionInput from "./PositionInput";
import AngleInput from "./AngleInput";
import { QRCode, ColorPicker } from "antd";
import Slider from "../Slider";
import chroma from "chroma-js";
import {
  useDebouncedCallback,
  useThrottledCallback,
} from "../../hooks/useDebounce";

function QRGenerator(panelSize) {
  const { device, updateQRConfig, qrConfig, takeSnapshot } = useDevice();
  const qrCodeRef = useRef(null);
  const [qrSize, setQRSize] = useState(
    Math.min(device.size.x, device.size.y) / 2
  );

  // Frozen preset state to prevent flickering during color picking
  const [frozenPreset, setFrozenPreset] = useState(null);

  // Arrow key tracking states (like PositionInput)
  const [isPrimaryColorArrowActive, setIsPrimaryColorArrowActive] = useState(false);
  const [isPrimaryOpacityArrowActive, setIsPrimaryOpacityArrowActive] = useState(false);
  const [isSecondaryColorArrowActive, setIsSecondaryColorArrowActive] = useState(false);
  const [isSecondaryOpacityArrowActive, setIsSecondaryOpacityArrowActive] = useState(false);
  const [isBorderColorArrowActive, setIsBorderColorArrowActive] = useState(false);
  const [isBorderOpacityArrowActive, setIsBorderOpacityArrowActive] = useState(false);

  // Timeout refs for arrow key intervals
  const primaryColorTimeoutRef = useRef(null);
  const primaryOpacityTimeoutRef = useRef(null);
  const secondaryColorTimeoutRef = useRef(null);
  const secondaryOpacityTimeoutRef = useRef(null);
  const borderColorTimeoutRef = useRef(null);
  const borderOpacityTimeoutRef = useRef(null);

  // Interval refs for arrow key intervals
  const primaryColorIntervalRef = useRef(null);
  const primaryOpacityIntervalRef = useRef(null);
  const secondaryColorIntervalRef = useRef(null);
  const secondaryOpacityIntervalRef = useRef(null);
  const borderColorIntervalRef = useRef(null);
  const borderOpacityIntervalRef = useRef(null);

  useEffect(() => {
    setQRSize(Math.min(device.size.x, device.size.y) / 2);
  }, [device.size]);

  // Get current colors from QR config (with fallbacks)
  const primaryColor = qrConfig.custom?.primaryColor || "#000000";
  const secondaryColor = qrConfig.custom?.secondaryColor || "#FFFFFF";
  const borderColor = qrConfig.custom?.borderColor || "#000000";

  // Display states (like inputValues in PositionInput)
  const [primaryColorInput, setPrimaryColorInput] = useState(
    extractHexFromColor(primaryColor)
  );
  const [primaryOpacityInput, setPrimaryOpacityInput] = useState(
    extractOpacityFromColor(primaryColor).toString()
  );

  const [secondaryColorInput, setSecondaryColorInput] = useState(
    extractHexFromColor(secondaryColor)
  );
  const [secondaryOpacityInput, setSecondaryOpacityInput] = useState(
    extractOpacityFromColor(secondaryColor).toString()
  );

  const [borderColorInput, setBorderColorInput] = useState(
    extractHexFromColor(borderColor)
  );
  const [borderOpacityInput, setBorderOpacityInput] = useState(
    extractOpacityFromColor(borderColor).toString()
  );

  // Helper functions to extract hex and opacity
  function extractHexFromColor(color) {
    if (!color) return "#000000";
    return color.slice(0, 7);
  }

  function extractOpacityFromColor(color) {
    if (!color || color.length <= 7) return 100;
    const alphaHex = color.slice(7, 9);
    if (!alphaHex) return 100;
    const alpha = parseInt(alphaHex, 16);
    return Math.round((alpha / 255) * 100);
  }

  // Update display states when device state changes
  useEffect(() => {
    setPrimaryColorInput(extractHexFromColor(primaryColor));
    setPrimaryOpacityInput(extractOpacityFromColor(primaryColor).toString());
  }, [primaryColor]);

  useEffect(() => {
    setSecondaryColorInput(extractHexFromColor(secondaryColor));
    setSecondaryOpacityInput(extractOpacityFromColor(secondaryColor).toString());
  }, [secondaryColor]);

  useEffect(() => {
    setBorderColorInput(extractHexFromColor(borderColor));
    setBorderOpacityInput(extractOpacityFromColor(borderColor).toString());
  }, [borderColor]);

  // Frozen preset logic
  const handleColorPickerOpen = (currentColor) => {
    if (currentColor) {
      let normalizedColor = currentColor;
      if (currentColor.startsWith("rgb")) {
        const match = currentColor.match(/\d+/g);
        if (match) {
          normalizedColor = `#${match
            .map((num) => parseInt(num).toString(16).padStart(2, "0"))
            .join("")}`;
        }
      } else if (!currentColor.startsWith("#")) {
        normalizedColor = `#${currentColor}`;
      }

      const normalizedExclude = normalizedColor.toLowerCase();
      const paletteWithoutCurrent = device.palette.filter(
        (color) => color.toLowerCase() !== normalizedExclude
      );
      setFrozenPreset(paletteWithoutCurrent);
    } else {
      setFrozenPreset([...device.palette]);
    }
  };

  const handleColorPickerClose = () => {
    setFrozenPreset(null);
  };

  const getPaletteForColor = (currentColor) => {
    const paletteToUse = frozenPreset || device.palette;
    if (!currentColor) return paletteToUse;

    let normalizedColor = currentColor;
    if (currentColor.startsWith("rgb")) {
      const match = currentColor.match(/\d+/g);
      if (match) {
        normalizedColor = `#${match
          .map((num) => parseInt(num).toString(16).padStart(2, "0"))
          .join("")}`;
      }
    } else if (!currentColor.startsWith("#")) {
      normalizedColor = `#${currentColor}`;
    }

    const normalizedExclude = normalizedColor.toLowerCase();
    return paletteToUse.filter(
      (color) => color.toLowerCase() !== normalizedExclude
    );
  };

  useEffect(() => {
    const svgElement = qrCodeRef.current?.querySelector("svg");
    if (svgElement && qrCodeRef.current) {
      svgElement.style.width = panelSize.width;
      svgElement.style.height = panelSize.width;
      qrCodeRef.current.style.maxWidth = "250px";
      qrCodeRef.current.style.maxHeight = "250px";
      qrCodeRef.current.style.minWidth = panelSize.width;
      qrCodeRef.current.style.minHeight = panelSize.width;
      const currWidth = qrCodeRef.current.offsetWidth;
      qrCodeRef.current.style.height = `${currWidth}px`;
    }
  }, [panelSize]);

  const getColorString = (colorObj) => {
    return typeof colorObj === "string" ? colorObj : colorObj?.toHexString();
  };

  // Use ref to always get current qrConfig.custom
  const currentQRCustomRef = useRef(qrConfig.custom);
  currentQRCustomRef.current = qrConfig.custom;

  function combineHexWithOpacity(color, opacity) {
    if (!color || opacity === undefined) {
      return "#000000";
    }

    const hex = color.slice(0, 7);
    let safeOpacity = Math.min(100, Math.max(0, opacity));

    if (safeOpacity === 100) {
      return hex;
    }

    const alpha = Math.round((safeOpacity / 100) * 255)
      .toString(16)
      .padStart(2, "0");

    return hex + alpha;
  }

  // Clear arrow key intervals helper
  const clearArrowKeyState = (timeoutRef, intervalRef, setArrowActive) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setArrowActive(false);
  };

  // PRIMARY COLOR HANDLERS
  const handlePrimaryColorChange = (e) => {
    let color = e.target.value;
    if (!color.startsWith("#")) {
      color = "#" + color;
    }
    setPrimaryColorInput(color.toUpperCase());
  };

  const handlePrimaryColorBlur = () => {
    // Only take snapshot if not from arrow key interaction
    if (!isPrimaryColorArrowActive && chroma.valid(primaryColorInput)) {
      takeSnapshot();
    }
    
    if (chroma.valid(primaryColorInput)) {
      const opacity = parseInt(primaryOpacityInput) || 100;
      updateQRConfig({
        custom: {
          ...currentQRCustomRef.current,
          primaryColor: combineHexWithOpacity(primaryColorInput, opacity),
        },
      });
    }
  };

  const handlePrimaryColorKeyDown = (e) => {
    if (e.key === "Enter" && chroma.valid(primaryColorInput)) {
      handlePrimaryColorBlur();
    }
  };

  const handlePrimaryOpacityChange = (e) => {
    setPrimaryOpacityInput(e.target.value);
  };

  const updatePrimaryOpacity = (increment) => {
    const currentOpacity = parseInt(primaryOpacityInput) || 0;
    const newOpacity = Math.max(0, Math.min(100, currentOpacity + increment));
    setPrimaryOpacityInput(newOpacity.toString());
    
    if (chroma.valid(primaryColorInput)) {
      updateQRConfig({
        custom: {
          ...currentQRCustomRef.current,
          primaryColor: combineHexWithOpacity(primaryColorInput, newOpacity),
        },
      });
    }
  };

  const handlePrimaryOpacityBlur = () => {
    // Only take snapshot if not from arrow key interaction
    if (!isPrimaryOpacityArrowActive) {
      takeSnapshot();
    }
    
    const opacity = parseInt(primaryOpacityInput) || 100;
    setPrimaryOpacityInput(opacity.toString());
    
    if (chroma.valid(primaryColorInput)) {
      updateQRConfig({
        custom: {
          ...currentQRCustomRef.current,
          primaryColor: combineHexWithOpacity(primaryColorInput, opacity),
        },
      });
    }
  };

  const handlePrimaryOpacityKeyDown = (e) => {
    if (e.key === "Enter") {
      handlePrimaryOpacityBlur();
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      
      // Take snapshot BEFORE changes on first arrow key press
      if (!isPrimaryOpacityArrowActive) {
        setIsPrimaryOpacityArrowActive(true);
        takeSnapshot();
      }
      
      const increment = e.key === "ArrowUp" ? 1 : -1;
      
      clearArrowKeyState(primaryOpacityTimeoutRef, primaryOpacityIntervalRef, () => {});
      
      updatePrimaryOpacity(increment);
      
      primaryOpacityTimeoutRef.current = setTimeout(() => {
        primaryOpacityIntervalRef.current = setInterval(() => {
          updatePrimaryOpacity(increment);
        }, 50);
      }, 200);
    }
  };

  // SECONDARY COLOR HANDLERS  
  const handleSecondaryColorChange = (e) => {
    let color = e.target.value;
    if (!color.startsWith("#")) {
      color = "#" + color;
    }
    setSecondaryColorInput(color.toUpperCase());
  };

  const handleSecondaryColorBlur = () => {
    if (!isSecondaryColorArrowActive && chroma.valid(secondaryColorInput)) {
      takeSnapshot();
    }
    
    if (chroma.valid(secondaryColorInput)) {
      const opacity = parseInt(secondaryOpacityInput) || 100;
      updateQRConfig({
        custom: {
          ...currentQRCustomRef.current,
          secondaryColor: combineHexWithOpacity(secondaryColorInput, opacity),
        },
      });
    }
  };

  const handleSecondaryColorKeyDown = (e) => {
    if (e.key === "Enter" && chroma.valid(secondaryColorInput)) {
      handleSecondaryColorBlur();
    }
  };

  const handleSecondaryOpacityChange = (e) => {
    setSecondaryOpacityInput(e.target.value);
  };

  const updateSecondaryOpacity = (increment) => {
    const currentOpacity = parseInt(secondaryOpacityInput) || 0;
    const newOpacity = Math.max(0, Math.min(100, currentOpacity + increment));
    setSecondaryOpacityInput(newOpacity.toString());
    
    if (chroma.valid(secondaryColorInput)) {
      updateQRConfig({
        custom: {
          ...currentQRCustomRef.current,
          secondaryColor: combineHexWithOpacity(secondaryColorInput, newOpacity),
        },
      });
    }
  };

  const handleSecondaryOpacityBlur = () => {
    if (!isSecondaryOpacityArrowActive) {
      takeSnapshot();
    }
    
    const opacity = parseInt(secondaryOpacityInput) || 100;
    setSecondaryOpacityInput(opacity.toString());
    
    if (chroma.valid(secondaryColorInput)) {
      updateQRConfig({
        custom: {
          ...currentQRCustomRef.current,
          secondaryColor: combineHexWithOpacity(secondaryColorInput, opacity),
        },
      });
    }
  };

  const handleSecondaryOpacityKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSecondaryOpacityBlur();
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      
      if (!isSecondaryOpacityArrowActive) {
        setIsSecondaryOpacityArrowActive(true);
        takeSnapshot();
      }
      
      const increment = e.key === "ArrowUp" ? 1 : -1;
      
      clearArrowKeyState(secondaryOpacityTimeoutRef, secondaryOpacityIntervalRef, () => {});
      
      updateSecondaryOpacity(increment);
      
      secondaryOpacityTimeoutRef.current = setTimeout(() => {
        secondaryOpacityIntervalRef.current = setInterval(() => {
          updateSecondaryOpacity(increment);
        }, 50);
      }, 200);
    }
  };

  // BORDER COLOR HANDLERS
  const handleBorderColorChange = (e) => {
    let color = e.target.value;
    if (!color.startsWith("#")) {
      color = "#" + color;
    }
    setBorderColorInput(color.toUpperCase());
  };

  const handleBorderColorBlur = () => {
    if (!isBorderColorArrowActive && chroma.valid(borderColorInput)) {
      takeSnapshot();
    }
    
    if (chroma.valid(borderColorInput)) {
      const opacity = parseInt(borderOpacityInput) || 100;
      updateQRConfig({
        custom: {
          ...currentQRCustomRef.current,
          borderColor: combineHexWithOpacity(borderColorInput, opacity),
        },
      });
    }
  };

  const handleBorderColorKeyDown = (e) => {
    if (e.key === "Enter" && chroma.valid(borderColorInput)) {
      handleBorderColorBlur();
    }
  };

  const handleBorderOpacityChange = (e) => {
    setBorderOpacityInput(e.target.value);
  };

  const updateBorderOpacity = (increment) => {
    const currentOpacity = parseInt(borderOpacityInput) || 0;
    const newOpacity = Math.max(0, Math.min(100, currentOpacity + increment));
    setBorderOpacityInput(newOpacity.toString());
    
    if (chroma.valid(borderColorInput)) {
      updateQRConfig({
        custom: {
          ...currentQRCustomRef.current,
          borderColor: combineHexWithOpacity(borderColorInput, newOpacity),
        },
      });
    }
  };

  const handleBorderOpacityBlur = () => {
    if (!isBorderOpacityArrowActive) {
      takeSnapshot();
    }
    
    const opacity = parseInt(borderOpacityInput) || 100;
    setBorderOpacityInput(opacity.toString());
    
    if (chroma.valid(borderColorInput)) {
      updateQRConfig({
        custom: {
          ...currentQRCustomRef.current,
          borderColor: combineHexWithOpacity(borderColorInput, opacity),
        },
      });
    }
  };

  const handleBorderOpacityKeyDown = (e) => {
    if (e.key === "Enter") {
      handleBorderOpacityBlur();
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      
      if (!isBorderOpacityArrowActive) {
        setIsBorderOpacityArrowActive(true);
        takeSnapshot();
      }
      
      const increment = e.key === "ArrowUp" ? 1 : -1;
      
      clearArrowKeyState(borderOpacityTimeoutRef, borderOpacityIntervalRef, () => {});
      
      updateBorderOpacity(increment);
      
      borderOpacityTimeoutRef.current = setTimeout(() => {
        borderOpacityIntervalRef.current = setInterval(() => {
          updateBorderOpacity(increment);
        }, 50);
      }, 200);
    }
  };

  // Throttled update functions for border size and radius (60 FPS)
  const throttledUpdateBorderSize = useThrottledCallback((size) => {
    updateQRConfig({
      custom: {
        ...currentQRCustomRef.current,
        borderSizeRatio: size,
      },
    });
  }, 16);

  const throttledUpdateCornerRadius = useThrottledCallback((radius) => {
    updateQRConfig({
      custom: {
        ...currentQRCustomRef.current,
        cornerRadiusRatio: radius,
      },
    });
  }, 16);

  return (
    <div id="qr-input-box">
      <h2 className=" p-3.5">Customize QR Code</h2>
      <h3 className="block border-b border-[var(--border-color)]/50 pb-1 px-3.5">
        URL
      </h3>
      <div className="p-2 pb-5">
        <input
          id="qr-input"
          type="text"
          className="w-full px-2 py-1 text-xs bg-black/5 dark:bg-black/15 border border-[var(--border-color)]/50 focus:outline-none focus:border-[var(--accent)]/50 rounded-xl"
          value={qrConfig.url}
          onChange={(e) =>
            updateQRConfig({
              url: e.target.value,
            })
          }
        />
      </div>
      <div className="hidden">
        <QRCode
          ref={qrCodeRef}
          value={qrConfig.url || "www.qrki.xyz"}
          id="QRCode"
          type="svg"
          bordered={false}
          size={qrSize}
          color={primaryColor}
          bgColor={secondaryColor}
        />
      </div>
      <h3 className="block border-b border-[var(--border-color)]/50 pb-1 px-3.5 mb-2.5">
        Position
      </h3>
      <div className="px-3.5">
        <div className="flex items-center pb-2.5">
          <h4 className="w-[85px]"> Position </h4>
          <PositionInput
            type="qr"
            position={qrConfig.positionPercentages}
            onUpdate={(newPosition) =>
              updateQRConfig({ positionPercentages: newPosition })
            }
            deviceSize={device.size}
            units="px"
          />
        </div>
        <div className="flex items-center pb-5">
          <h4 className="w-[85px]"> Angle </h4>
          <AngleInput
            type="qr"
            angle={qrConfig.rotation}
            onUpdate={(newAngle) => updateQRConfig({ rotation: newAngle })}
          />
        </div>
      </div>
      <h3 className="block border-b border-[var(--border-color)]/50 pb-1 px-3.5 mb-2.5">
        Color
      </h3>
      <div className="flex items-center pb-2.5 px-3.5">
        <h4> Primary </h4>
        <CustomColorInput
          value={qrConfig.custom.primaryColor}
          colorValue={primaryColorInput}
          hasOpacity
          opacityValue={primaryOpacityInput}
          preset={getPaletteForColor(primaryColorInput)}
          onColorPickerOpen={() => handleColorPickerOpen(primaryColorInput)}
          onColorPickerClose={handleColorPickerClose}
          onChange={(c) => {
            let color = chroma(c.toHexString());
            let hex = color.hex().slice(0, 7).toUpperCase();
            let alpha = Math.round(color.alpha() * 100);
            setPrimaryColorInput(hex);
            setPrimaryOpacityInput(alpha.toString());
            updateQRConfig({
              custom: {
                ...currentQRCustomRef.current,
                primaryColor: combineHexWithOpacity(hex, alpha),
              },
            });
          }}
          submitColor={(hex, alpha, snap) =>{
            snap && takeSnapshot();
            updateQRConfig({
              custom: {
                ...currentQRCustomRef.current,
                primaryColor: combineHexWithOpacity(hex, alpha),
              },
            });}}
          onOpacityChange={handlePrimaryOpacityChange}
          onOpacityBlur={handlePrimaryOpacityBlur}
          onOpacityKeyDown={(e) => {
            handlePrimaryOpacityKeyDown(e);
            
            // Handle keyup to clear arrow key state
            if (e.type === "keyup" && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
              clearArrowKeyState(primaryOpacityTimeoutRef, primaryOpacityIntervalRef, setIsPrimaryOpacityArrowActive);
            }
          }}
        />
      </div>
      <div className="flex items-center pb-5 px-3.5">
        <h4> Secondary </h4>
        <CustomColorInput
        submitColor={(hex, alpha, snap) =>{
          snap && takeSnapshot();
          updateQRConfig({
            custom: {
              ...currentQRCustomRef.current,
              secondaryColor: combineHexWithOpacity(hex, alpha),
            },
          });}}
          value={combineHexWithOpacity(secondaryColorInput, parseInt(secondaryOpacityInput) || 100)}
          colorValue={secondaryColorInput}
          hasOpacity
          opacityValue={secondaryOpacityInput}
          preset={getPaletteForColor(secondaryColorInput)}
          onColorPickerOpen={() => handleColorPickerOpen(secondaryColorInput)}
          onColorPickerClose={handleColorPickerClose}
          onChange={(c) => {
            let color = chroma(c.toHexString());
            let hex = color.hex().slice(0, 7).toUpperCase();
            let alpha = Math.round(color.alpha() * 100);
            setSecondaryColorInput(hex);
            setSecondaryOpacityInput(alpha.toString());
            updateQRConfig({
              custom: {
                ...currentQRCustomRef.current,
                secondaryColor: combineHexWithOpacity(hex, alpha),
              },
            });
          }}
          onOpacityChange={handleSecondaryOpacityChange}
          onOpacityBlur={handleSecondaryOpacityBlur}
          onOpacityKeyDown={(e) => {
            handleSecondaryOpacityKeyDown(e);
            
            if (e.type === "keyup" && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
              clearArrowKeyState(secondaryOpacityTimeoutRef, secondaryOpacityIntervalRef, setIsSecondaryOpacityArrowActive);
            }
          }}
        />
      </div>
      <h3 className="block border-b border-[var(--border-color)]/50 pb-1 px-3.5 mb-2.5">
        Border
      </h3>
      <div className="flex items-center pb-2.5 px-3.5">
        <h4> Color</h4>
        <CustomColorInput
        submitColor={(hex, alpha, snap) =>{
          snap && takeSnapshot();
          updateQRConfig({
            custom: {
              ...currentQRCustomRef.current,
              borderColor: combineHexWithOpacity(hex, alpha),
            },
          });}}
          value={combineHexWithOpacity(borderColorInput, parseInt(borderOpacityInput) || 100)}
          colorValue={borderColorInput}
          hasOpacity
          opacityValue={borderOpacityInput}
          preset={getPaletteForColor(borderColorInput)}
          onColorPickerOpen={() => handleColorPickerOpen(borderColorInput)}
          onColorPickerClose={handleColorPickerClose}
          onChange={(c) => {
            let color = chroma(c.toHexString());
            let hex = color.hex().slice(0, 7).toUpperCase();
            let alpha = Math.round(color.alpha() * 100);
            setBorderColorInput(hex);
            setBorderOpacityInput(alpha.toString());
            updateQRConfig({
              custom: {
                ...currentQRCustomRef.current,
                borderColor: combineHexWithOpacity(hex, alpha),
              },
            });
          }}
          onOpacityChange={handleBorderOpacityChange}
          onOpacityBlur={handleBorderOpacityBlur}
          onOpacityKeyDown={(e) => {
            handleBorderOpacityKeyDown(e);
            
            if (e.type === "keyup" && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
              clearArrowKeyState(borderOpacityTimeoutRef, borderOpacityIntervalRef, setIsBorderOpacityArrowActive);
            }
          }}
        />
      </div>
      <div className="flex items-center pb-1.5 px-3.5">
        <h4> Width</h4>
        <Slider
          min="0"
          max="200"
          step="0.5"
          value={qrConfig.custom.borderSizeRatio}
          onChange={(e) => {
            const newValue = parseFloat(e.target.value);
            throttledUpdateBorderSize(newValue);
          }}
        />
      </div>
      <div className="flex items-center pb-5 px-3.5">
        <h4> Radius</h4>
        <Slider
          min="0"
          max="100"
          step="1"
          value={qrConfig.custom.cornerRadiusRatio}
          onChange={(e) => {
            const newValue = parseFloat(e.target.value);
            throttledUpdateCornerRadius(newValue);
          }}
        />
      </div>
    </div>
  );
}

export default QRGenerator;