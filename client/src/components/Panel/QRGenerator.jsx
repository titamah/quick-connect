import { useState, useEffect, useRef } from "react";
import { useDevice } from "../../contexts/DeviceContext";
import CustomColorInput from "./CustomColorInput";
import QRSizeInput from "./QRSizeInput";
import PositionInput from "./PositionInput";
import AngleInput from "./AngleInput";
import Slider from "../Slider";
import chroma from "chroma-js";
import { useThrottledCallback } from "../../hooks/useDebounce";
function QRGenerator(panelSize) {
  const { device, updateQRConfig, qrConfig, takeSnapshot, isMobile } =
    useDevice();
  const qrCodeRef = useRef(null);
  const [frozenPreset, setFrozenPreset] = useState(null);
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
  const [url, setUrl] = useState(qrConfig.url);
  useEffect(() => {
    setUrl(qrConfig.url);
  }, [qrConfig.url]);
  return (
    <div
      id={`qr-input-box`}
      className={` w-full${
        isMobile ? "rounded-t-2xl h-full" : ""
      } flex-1 overflow-y-scroll min-h-0`}
    >
      <div
        className={`flex-shrink-0 bg-[#f2f2f2] dark:bg-[#1a1818] ${
          isMobile
            ? "pb-2 pt-5 px-2 mb-3 rounded-t-2xl sticky top-0 z-100"
            : "px-2.5 pt-3.5 pb-2"
        }`}
      >
        <h3 className={`${isMobile ? "mb-1.5 px-1" : "px-1 mb-2"}`}>
          Current URL
        </h3>
        <input
          id="qr-input"
          type="text"
          className={`w-full px-2 py-1 text-xs bg-[var(--bg-main)] border border-[var(--border-color)]/50 focus:outline-none focus:border-[var(--accent)]/50 rounded-xl`}
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.target.blur();
            }
          }}
          onBlur={(e) => {
            takeSnapshot("Change URL");
            updateQRConfig({
              url: url,
            });
          }}
        />
      </div>
      <div className="overflow-y-scroll flex flex-col min-h-0">
        <h2 className={`${isMobile ? "hidden" : ""} p-3.5`}>
          Customize QR Code
        </h2>
        <h3
          className={`block border-b border-[var(--border-color)]/50 pb-1 px-3.5 mb-2.5`}
        >
          Position
        </h3>
        <div className="px-3.5">
          <div className="flex items-center pb-2.5">
            <h4 className="w-[85px]"> Size </h4>
            <QRSizeInput
              scale={qrConfig.scale || 0.5}
              onUpdate={(newScale) => updateQRConfig({ scale: newScale })}
            />
          </div>
          <div className="flex items-center pb-2.5">
            <h4 className="w-[85px]"> Position </h4>
            <PositionInput
              type="qr"
              position={qrConfig.positionPercentages}
              onUpdate={(newPosition) =>
                updateQRConfig({ positionPercentages: newPosition })
              }
              deviceSize={device.size}
              qrScale={qrConfig.scale || 0.5}
              units="px"
            />
          </div>
          <div className={`flex items-center pb-5`}>
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
            hasOpacity
            preset={getPaletteForColor(qrConfig.custom.primaryColor)}
            onColorPickerOpen={() =>
              handleColorPickerOpen(qrConfig.custom.primaryColor)
            }
            onColorPickerClose={handleColorPickerClose}
            onChange={(c) => {
              // c is now a plain hex string from react-colorful, just like ColorSelector
              let color = chroma(c);
              let hex = color.hex().slice(0, 7).toUpperCase();
              let alpha = Math.round(color.alpha() * 100);
              updateQRConfig({
                custom: {
                  ...currentQRCustomRef.current,
                  primaryColor: combineHexWithOpacity(hex, alpha),
                },
              });
            }}
            submitColor={(hex, alpha, snap = true) => {
              snap && takeSnapshot();
              updateQRConfig({
                custom: {
                  ...currentQRCustomRef.current,
                  primaryColor: combineHexWithOpacity(hex, alpha),
                },
              });
            }}
          />
        </div>
        <div
          className={`flex items-center  pb-5 px-3.5`}
        >
          <h4> Secondary </h4>
          <CustomColorInput
            submitColor={(hex, alpha, snap = true) => {
              snap && takeSnapshot();
              updateQRConfig({
                custom: {
                  ...currentQRCustomRef.current,
                  secondaryColor: combineHexWithOpacity(hex, alpha),
                },
              });
            }}
            value={qrConfig.custom.secondaryColor}
            hasOpacity
            preset={getPaletteForColor(qrConfig.custom.secondaryColor)}
            onColorPickerOpen={() =>
              handleColorPickerOpen(qrConfig.custom.secondaryColor)
            }
            onColorPickerClose={handleColorPickerClose}
            onChange={(c) => {
              // c is now a plain hex string from react-colorful, just like ColorSelector
              let color = chroma(c);
              let hex = color.hex().slice(0, 7).toUpperCase();
              let alpha = Math.round(color.alpha() * 100);
              updateQRConfig({
                custom: {
                  ...currentQRCustomRef.current,
                  secondaryColor: combineHexWithOpacity(hex, alpha),
                },
              });
            }}
          />
        </div>
        <h3 className="block border-b border-[var(--border-color)]/50 pb-1 px-3.5 mb-2.5">
          Border
        </h3>
        <div className="flex items-center pb-2.5 px-3.5">
          <h4> Color</h4>
          <CustomColorInput
            submitColor={(hex, alpha, snap = true) => {
              snap && takeSnapshot();
              updateQRConfig({
                custom: {
                  ...currentQRCustomRef.current,
                  borderColor: combineHexWithOpacity(hex, alpha),
                },
              });
            }}
            value={qrConfig.custom.borderColor}
            hasOpacity
            preset={getPaletteForColor(qrConfig.custom.borderColor)}
            onColorPickerOpen={() =>
              handleColorPickerOpen(qrConfig.custom.borderColor)
            }
            onColorPickerClose={handleColorPickerClose}
            onChange={(c) => {
              // c is now a plain hex string from react-colorful, just like ColorSelector
              let color = chroma(c);
              let hex = color.hex().slice(0, 7).toUpperCase();
              let alpha = Math.round(color.alpha() * 100);
              updateQRConfig({
                custom: {
                  ...currentQRCustomRef.current,
                  borderColor: combineHexWithOpacity(hex, alpha),
                },
              });
            }}
          />
        </div>
        <div className="flex items-center pb-1.5 px-3.5">
          <h4> Width</h4>
          <Slider
            min="-1"
            max="200"
            step="0.5"
            value={qrConfig.custom.borderSizeRatio}
            onChange={(e) => {
              const newValue = parseFloat(e.target.value);
              throttledUpdateBorderSize(newValue);
            }}
          />
        </div>
        <div className="flex items-center pb-7.5 px-3.5">
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
    </div>
  );
}
export default QRGenerator;
