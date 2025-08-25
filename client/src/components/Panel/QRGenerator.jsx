import { useState, useEffect, useRef, useCallback } from "react";
import "preline/preline";
import { useDevice } from "../../contexts/DeviceContext";
import CustomColorInput from "./CustomColorInput";
import { QRCode, ColorPicker } from "antd";
import Slider from "../Slider";
import chroma from "chroma-js";
import { useDebouncedCallback, useThrottledCallback } from "../../hooks/useDebounce";

function QRGenerator(panelSize) {
  const { device, updateQRConfig } = useDevice();
  const qrCodeRef = useRef(null);
  const [qrSize, setQRSize] = useState(
    Math.min(device.size.x, device.size.y) / 2
  );

  useEffect(() => {
    setQRSize(Math.min(device.size.x, device.size.y) / 2);
  }, [device.size]);

  function buildHexArray(excludeKey) {
    const items = [];
    for (const key in device.palette) {
      if (key === excludeKey) {
        continue;
      }
      const value = device.palette[key];
      if (Array.isArray(value)) {
        items.push(...value);
      } else {
        items.push(value);
      }
    }
    return [...new Set(items)];
  }

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
          className="w-full px-2 py-1 text-xs bg-[var(--contrast-sheer)]/50 border border-[var(--border-color)]/50 focus:outline-none focus:border-[var(--accent)]/50 rounded-xl"
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
        Color
      </h3>
      <div className="flex items-center pb-2.5 px-3.5">
        <h4> Primary </h4>
        <CustomColorInput
          value={combineHexWithOpacity(primaryColorInput, primaryOpacityInput)}
          colorValue={primaryColorInput}
          hasOpacity
          opacityValue={primaryOpacityInput}
          preset={[buildHexArray("qr")]}
          onChange={(c) => {
            let color = chroma(c.toHexString());
            let hex = color.hex().slice(0, 7).toUpperCase();
            let alpha = Math.round(color.alpha() * 100);
            setPrimaryColorInput(hex);
            setPrimaryOpacityInput(alpha);
            debouncedUpdatePrimaryColor(hex, alpha);
          }}
          onColorChange={(e) => {
            let color = e.target.value;
            if (!color.startsWith("#")) {
              color = "#" + color;
            }
            setPrimaryColorInput(color.toUpperCase());
            if (chroma.valid(color)) {
              debouncedUpdatePrimaryColor(color, primaryOpacityInput);
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
            }
          }}
          onOpacityChange={(e) => {
            let opacity = e.target.value;
            console.log(opacity);
            if (opacity < 0) opacity = 0;
            if (opacity > 100) opacity = 100;
            setPrimaryOpacityInput(opacity);
            debouncedUpdatePrimaryColor(primaryColorInput, opacity);
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
      preset={[buildHexArray("qr")]}
      onChange={(c) => {
        let color = chroma(c.toHexString());
        let hex = color.hex().slice(0,7).toUpperCase();
        let alpha = Math.round(color.alpha() * 100);
        setSecondaryColorInput(hex);
        setSecondaryOpacityInput(alpha);
        debouncedUpdateSecondaryColor(hex, alpha);
      }} 
      onColorChange={(e)=>{
        let color = e.target.value;
        if (!color.startsWith("#")) {
          color = "#" + color;
        }
        setSecondaryColorInput(color.toUpperCase());
        if(chroma.valid(color)){
          debouncedUpdateSecondaryColor(color, secondaryOpacityInput);
        }
      }}
      onOpacityChange={(e)=>{
        let opacity = e.target.value;
        console.log(opacity);
        if (opacity < 0) opacity = 0;
        if (opacity > 100) opacity = 100;
        setSecondaryOpacityInput(opacity);
        debouncedUpdateSecondaryColor(secondaryColorInput, opacity);
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
      preset={[buildHexArray("qr")]}
      onChange={(c) => {
        let color = chroma(c.toHexString());
        let hex = color.hex().slice(0,7).toUpperCase();
        let alpha = Math.round(color.alpha() * 100);
        setBorderColorInput(hex);
        setBorderOpacityInput(alpha);
        debouncedUpdateBorderColor(hex, alpha);
      }} 
      onColorChange={(e)=>{
        let color = e.target.value;
        if (!color.startsWith("#")) {
          color = "#" + color;
        }
        setBorderColorInput(color.toUpperCase());
        if(chroma.valid(color)){
          debouncedUpdateBorderColor(color, borderOpacityInput);
        }
      }}
      onOpacityChange={(e)=>{
        let opacity = e.target.value;
        console.log(opacity);
        if (opacity < 0) opacity = 0;
        if (opacity > 100) opacity = 100;
        setBorderOpacityInput(opacity);
        debouncedUpdateBorderColor(borderColorInput, opacity);
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
