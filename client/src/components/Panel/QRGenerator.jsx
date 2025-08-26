import { useState, useEffect, useRef, useCallback } from "react";
import "preline/preline";
import { useDevice } from "../../contexts/DeviceContext";
import CustomColorInput from "./CustomColorInput";
import PositionInput from "./PositionInput";
import AngleInput from "./AngleInput";
import { QRCode, ColorPicker } from "antd";
import Slider from "../Slider";
import chroma from "chroma-js";
import { useDebouncedCallback, useThrottledCallback } from "../../hooks/useDebounce";

function QRGenerator(panelSize) {
  const { device, updateQRConfig, getPaletteExcluding } = useDevice();
  const qrCodeRef = useRef(null);
  const [qrSize, setQRSize] = useState(
    Math.min(device.size.x, device.size.y) / 2
  );
  
  // Frozen preset state to prevent flickering during color picking
  const [frozenPreset, setFrozenPreset] = useState(null);

  useEffect(() => {
    setQRSize(Math.min(device.size.x, device.size.y) / 2);
  }, [device.size]);

  // Frozen preset logic to prevent flickering during color picking
  const handleColorPickerOpen = (currentColor) => {
    // Freeze palette without the current color
    if (currentColor) {
      let normalizedColor = currentColor;
      if (currentColor.startsWith("rgb")) {
        const match = currentColor.match(/\d+/g);
        if (match) {
          normalizedColor = `#${match.map(num => parseInt(num).toString(16).padStart(2, '0')).join('')}`;
        }
      } else if (!currentColor.startsWith("#")) {
        normalizedColor = `#${currentColor}`;
      }
      
      const normalizedExclude = normalizedColor.toLowerCase();
      const paletteWithoutCurrent = device.palette.filter(color => color.toLowerCase() !== normalizedExclude);
      setFrozenPreset(paletteWithoutCurrent);
    } else {
      setFrozenPreset([...device.palette]);
    }
  };

  const handleColorPickerClose = () => {
    setFrozenPreset(null); // Unfreeze
  };

  // Get palette colors excluding the current color being edited
  const getPaletteForColor = (currentColor) => {
    // Use frozen preset if available, otherwise use current palette
    const paletteToUse = frozenPreset || device.palette;
    
    // Ensure we have a valid hex color for comparison
    if (!currentColor) return paletteToUse;
    
    // Normalize the color format
    let normalizedColor = currentColor;
    if (currentColor.startsWith("rgb")) {
      const match = currentColor.match(/\d+/g);
      if (match) {
        normalizedColor = `#${match.map(num => parseInt(num).toString(16).padStart(2, '0')).join('')}`;
      }
    } else if (!currentColor.startsWith("#")) {
      normalizedColor = `#${currentColor}`;
    }
    
    const normalizedExclude = normalizedColor.toLowerCase();
    return paletteToUse.filter(color => color.toLowerCase() !== normalizedExclude);
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

  // Get current colors from QR config (with fallbacks)
  const primaryColor = device.qr.custom?.primaryColor || "#000000";
  const secondaryColor = device.qr.custom?.secondaryColor || "#FFFFFF";

  const [primaryColorInput, setPrimaryColorInput] = useState(primaryColor);
  const [primaryOpacityInput, setPrimaryOpacityInput] = useState(100);

  const [secondaryColorInput, setSecondaryColorInput] =
    useState(secondaryColor);
  const [secondaryOpacityInput, setSecondaryOpacityInput] = useState(100);

  const [borderColorInput, setBorderColorInput] = useState(
    device.qr.custom?.borderColor || "#000000"
  );
  const [borderOpacityInput, setBorderOpacityInput] = useState(100);



  // Use ref to always get current device.qr.custom
  const currentQRCustomRef = useRef(device.qr.custom);
  currentQRCustomRef.current = device.qr.custom;

  // Immediate update functions for arrow key usage
  const immediateUpdatePrimaryColor = (color, opacity) => {
    if (color && opacity !== undefined) {
      updateQRConfig({
        custom: {
          ...currentQRCustomRef.current,
          primaryColor: combineHexWithOpacity(color, opacity),
        },
      });
    }
  };

  const immediateUpdateSecondaryColor = (color, opacity) => {
    if (color && opacity !== undefined) {
      updateQRConfig({
        custom: {
          ...currentQRCustomRef.current,
          secondaryColor: combineHexWithOpacity(color, opacity),
        },
      });
    }
  };

  const immediateUpdateBorderColor = (color, opacity) => {
    if (color && opacity !== undefined) {
      updateQRConfig({
        custom: {
          ...currentQRCustomRef.current,
          borderColor: combineHexWithOpacity(color, opacity),
        },
      });
    }
  };

  // Debounced update functions to prevent excessive re-renders
  const debouncedUpdatePrimaryColor = useDebouncedCallback((color, opacity) => {
    if (color && opacity !== undefined) {
      updateQRConfig({
        custom: {
          ...currentQRCustomRef.current,
          primaryColor: combineHexWithOpacity(color, opacity),
        },
      });
    }
  }, 300);

  const debouncedUpdateSecondaryColor = useDebouncedCallback((color, opacity) => {
    if (color && opacity !== undefined) {
      updateQRConfig({
        custom: {
          ...currentQRCustomRef.current,
          secondaryColor: combineHexWithOpacity(color, opacity),
        },
      });
    }
  }, 300);

  const debouncedUpdateBorderColor = useDebouncedCallback((color, opacity) => {
    if (color && opacity !== undefined) {
      updateQRConfig({
        custom: {
          ...currentQRCustomRef.current,
          borderColor: combineHexWithOpacity(color, opacity),
        },
      });
    }
  }, 300);

  // Throttled update functions for border size and radius (60 FPS)
  const throttledUpdateBorderSize = useThrottledCallback((size) => {
    updateQRConfig({
      custom: {
        ...currentQRCustomRef.current,
        borderSizeRatio: size,
      },
    });
  }, 16); // 1000ms / 60fps = 16.67ms

  const throttledUpdateCornerRadius = useThrottledCallback((radius) => {
    updateQRConfig({
      custom: {
        ...currentQRCustomRef.current,
        cornerRadiusRatio: radius,
      },
    });
  }, 16); // 1000ms / 60fps = 16.67ms

  function combineHexWithOpacity(color, opacity) {
    // Safety checks for undefined values
    if (!color || opacity === undefined) {
      return "#000000";
    }
    
    // Ensure color is 7 chars (#RRGGBB)
    const hex = color.slice(0, 7);

    // Clamp opacity between 0–100
    let safeOpacity = Math.min(100, Math.max(0, opacity));

    // If opacity is 100, just return the color
    if (safeOpacity === 100) {
      return hex;
    }

    // Convert 0–100 -> 0–255, then to 2-digit hex
    const alpha = Math.round((safeOpacity / 100) * 255)
      .toString(16)
      .padStart(2, "0");

    return hex + alpha; // => "#RRGGBBAA"
  }

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
          value={device.qr.url}
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
          value={device.qr.url || "www.qrki.xyz"}
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
        <PositionInput 
          type="qr"
          position={device.qr.positionPercentages}
          onUpdate={(newPosition) => updateQRConfig({ positionPercentages: newPosition })}
          deviceSize={device.size}
          units="px"
        />
        <AngleInput 
          type="qr"
          angle={device.qr.rotation}
          onUpdate={(newAngle) => updateQRConfig({ rotation: newAngle })}
          max={360}
        />
      </div>
      <h3 className="block border-b border-[var(--border-color)]/50 pb-1 px-3.5 mb-2.5">
        Color
      </h3>
      <div className="flex items-center pb-2.5 px-3.5">
        <h4> Primary </h4>
        <CustomColorInput
          value={combineHexWithOpacity(primaryColorInput, primaryOpacityInput)}
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
            setPrimaryOpacityInput(alpha);
            immediateUpdatePrimaryColor(hex, alpha);
          }}
          onColorChange={(e) => {
            let color = e.target.value;
            if (!color.startsWith("#")) {
              color = "#" + color;
            }
            setPrimaryColorInput(color.toUpperCase());
            if (chroma.valid(color)) {
              immediateUpdatePrimaryColor(color, primaryOpacityInput);
            }
          }}
          onColorBlur={() => {
            if (chroma.valid(primaryColorInput)) {
              updateQRConfig({
                custom: {
                  ...device.qr.custom,
                  primaryColor: combineHexWithOpacity(primaryColorInput, primaryOpacityInput),
                },
              });
            }
          }}
          onColorKeyDown={(e) => {
            if (e.key === 'Enter' && chroma.valid(primaryColorInput)) {
              updateQRConfig({
                custom: {
                  ...device.qr.custom,
                  primaryColor: combineHexWithOpacity(primaryColorInput, primaryOpacityInput),
                },
              });
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
              e.preventDefault();
              // For color inputs, we could cycle through preset colors or adjust brightness
              // For now, let's just update immediately with current value
              immediateUpdatePrimaryColor(primaryColorInput, primaryOpacityInput);
            }
          }}
          onOpacityChange={(e) => {
            let opacity = e.target.value;
            console.log(opacity);
            if (opacity < 0) opacity = 0;
            if (opacity > 100) opacity = 100;
            setPrimaryOpacityInput(opacity);
            immediateUpdatePrimaryColor(primaryColorInput, opacity);
          }}
          onOpacityBlur={() => {
            updateQRConfig({
              custom: {
                ...device.qr.custom,
                primaryColor: combineHexWithOpacity(primaryColorInput, primaryOpacityInput),
              },
            });
          }}
          onOpacityKeyDown={(e) => {
            if (e.key === 'Enter') {
              updateQRConfig({
                custom: {
                  ...device.qr.custom,
                  primaryColor: combineHexWithOpacity(primaryColorInput, primaryOpacityInput),
                },
              });
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
              e.preventDefault();
              const increment = e.key === 'ArrowUp' ? 1 : -1;
              const newOpacity = Math.max(0, Math.min(100, primaryOpacityInput + increment));
              setPrimaryOpacityInput(newOpacity);
              immediateUpdatePrimaryColor(primaryColorInput, newOpacity);
            }
          }}
        />
      </div>
      <div className="flex items-center pb-5 px-3.5">
        <h4> Secondary </h4>
      <CustomColorInput
      value={combineHexWithOpacity(secondaryColorInput, secondaryOpacityInput)} 
      colorValue={secondaryColorInput} 
      hasOpacity
      opacityValue={secondaryOpacityInput}
      preset={getPaletteForColor(secondaryColorInput)}
      onColorPickerOpen={() => handleColorPickerOpen(secondaryColorInput)}
      onColorPickerClose={handleColorPickerClose}
      onChange={(c) => {
        let color = chroma(c.toHexString());
        let hex = color.hex().slice(0,7).toUpperCase();
        let alpha = Math.round(color.alpha() * 100);
        setSecondaryColorInput(hex);
        setSecondaryOpacityInput(alpha);
        immediateUpdateSecondaryColor(hex, alpha);
      }} 
      onColorChange={(e)=>{
        let color = e.target.value;
        if (!color.startsWith("#")) {
          color = "#" + color;
        }
        setSecondaryColorInput(color.toUpperCase());
        if(chroma.valid(color)){
          immediateUpdateSecondaryColor(color, secondaryOpacityInput);
        }
      }}
      onOpacityChange={(e)=>{
        let opacity = e.target.value;
        console.log(opacity);
        if (opacity < 0) opacity = 0;
        if (opacity > 100) opacity = 100;
        setSecondaryOpacityInput(opacity);
        immediateUpdateSecondaryColor(secondaryColorInput, opacity);
      }}
      onColorBlur={() => {
        if (chroma.valid(secondaryColorInput)) {
          updateQRConfig({
            custom: {
              ...device.qr.custom,
              secondaryColor: combineHexWithOpacity(secondaryColorInput, secondaryOpacityInput),
            },
          });
        }
      }}
      onColorKeyDown={(e) => {
        if (e.key === 'Enter' && chroma.valid(secondaryColorInput)) {
          updateQRConfig({
            custom: {
              ...device.qr.custom,
              secondaryColor: combineHexWithOpacity(secondaryColorInput, secondaryOpacityInput),
            },
          });
        }
      }}
      onOpacityBlur={() => {
        updateQRConfig({
          custom: {
            ...device.qr.custom,
            secondaryColor: combineHexWithOpacity(secondaryColorInput, secondaryOpacityInput),
          },
        });
      }}
      onOpacityKeyDown={(e) => {
        if (e.key === 'Enter') {
          updateQRConfig({
            custom: {
              ...device.qr.custom,
              secondaryColor: combineHexWithOpacity(secondaryColorInput, secondaryOpacityInput),
            },
          });
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
          const increment = e.key === 'ArrowUp' ? 1 : -1;
          const newOpacity = Math.max(0, Math.min(100, secondaryOpacityInput + increment));
          setSecondaryOpacityInput(newOpacity);
          immediateUpdateSecondaryColor(secondaryColorInput, newOpacity);
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
      value={combineHexWithOpacity(borderColorInput, borderOpacityInput)} 
      colorValue={borderColorInput} 
      hasOpacity
      opacityValue={borderOpacityInput}
      preset={getPaletteForColor(borderColorInput)}
      onColorPickerOpen={() => handleColorPickerOpen(borderColorInput)}
      onColorPickerClose={handleColorPickerClose}
      onChange={(c) => {
        let color = chroma(c.toHexString());
        let hex = color.hex().slice(0,7).toUpperCase();
        let alpha = Math.round(color.alpha() * 100);
        setBorderColorInput(hex);
        setBorderOpacityInput(alpha);
        immediateUpdateBorderColor(hex, alpha);
      }} 
      onColorChange={(e)=>{
        let color = e.target.value;
        if (!color.startsWith("#")) {
          color = "#" + color;
        }
        setBorderColorInput(color.toUpperCase());
        if(chroma.valid(color)){
          immediateUpdateBorderColor(color, borderOpacityInput);
        }
      }}
      onOpacityChange={(e)=>{
        let opacity = e.target.value;
        console.log(opacity);
        if (opacity < 0) opacity = 0;
        if (opacity > 100) opacity = 100;
        setBorderOpacityInput(opacity);
        immediateUpdateBorderColor(borderColorInput, opacity);
      }}
      onColorBlur={() => {
        if (chroma.valid(borderColorInput)) {
          updateQRConfig({
            custom: {
              ...device.qr.custom,
              borderColor: combineHexWithOpacity(borderColorInput, borderOpacityInput),
            },
          });
        }
      }}
      onColorKeyDown={(e) => {
        if (e.key === 'Enter' && chroma.valid(borderColorInput)) {
          updateQRConfig({
            custom: {
              ...device.qr.custom,
              borderColor: combineHexWithOpacity(borderColorInput, borderOpacityInput),
            },
          });
        }
      }}
      onOpacityBlur={() => {
        updateQRConfig({
          custom: {
            ...device.qr.custom,
            borderColor: combineHexWithOpacity(borderColorInput, borderOpacityInput),
          },
        });
      }}
      onOpacityKeyDown={(e) => {
        if (e.key === 'Enter') {
          updateQRConfig({
            custom: {
              ...device.qr.custom,
              borderColor: combineHexWithOpacity(borderColorInput, borderOpacityInput),
            },
          });
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
          const increment = e.key === 'ArrowUp' ? 1 : -1;
          const newOpacity = Math.max(0, Math.min(100, borderOpacityInput + increment));
          setBorderOpacityInput(newOpacity);
          immediateUpdateBorderColor(borderColorInput, newOpacity);
        }
      }}
      />
      </div>
      <div className="flex items-center pb-1.5 px-3.5">
        <h4> Width</h4>
        <Slider
          min="0"
          max="200" // 0-20% of QR size
          step="0.5"
          value={device.qr.custom.borderSizeRatio}
          onChange={(e) => {
            const newValue = parseFloat(e.target.value);
            // Throttled update for smooth 60 FPS performance
            throttledUpdateBorderSize(newValue);
          }}
        />
      </div>
      <div className="flex items-center pb-5 px-3.5">
        <h4> Radius</h4>
        <Slider
          min="0"
          max="100" // 0-50% of border size
          step="1"
          value={device.qr.custom.cornerRadiusRatio}
          onChange={(e) => {
            const newValue = parseFloat(e.target.value);
            // Throttled update for smooth 60 FPS performance
            throttledUpdateCornerRadius(newValue);
          }}
        />
      </div>
    </div>
  );
}

export default QRGenerator;
