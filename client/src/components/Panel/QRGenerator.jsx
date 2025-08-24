import { useState, useEffect, useRef } from "react";
import "preline/preline";
import { useDevice } from "../../contexts/DeviceContext";
import CustomColorInput from "./CustomColorInput";
import { QRCode, ColorPicker } from "antd";
import Slider from "../Slider";
import chroma from "chroma-js";

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

  function combineHexWithOpacity(color, opacity) {
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
            updateQRConfig({
              custom: {
                ...device.qr.custom,
                primaryColor: combineHexWithOpacity(hex, alpha),
              },
            });
          }}
          onColorChange={(e) => {
            let color = e.target.value;
            if (!color.startsWith("#")) {
              color = "#" + color;
            }
            setPrimaryColorInput(color.toUpperCase());
            if (chroma.valid(color)) {
              updateQRConfig({
                custom: {
                  ...device.qr.custom,
                  primaryColor: combineHexWithOpacity(
                    color,
                    primaryOpacityInput
                  ),
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
            updateQRConfig({
              custom: {
                ...device.qr.custom,
                primaryColor: combineHexWithOpacity(primaryColorInput, opacity),
              },
            });
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
        updateQRConfig({
          custom: {
            ...device.qr.custom,
            secondaryColor: combineHexWithOpacity(hex, alpha),
          },
        });
      }} 
      onColorChange={(e)=>{
        let color = e.target.value;
        if (!color.startsWith("#")) {
          color = "#" + color;
        }
        setSecondaryColorInput(color.toUpperCase());
        if(chroma.valid(color)){
        updateQRConfig({
          custom: {
            ...device.qr.custom,
            secondaryColor: combineHexWithOpacity(color, secondaryOpacityInput),
          },
        });}
      }}
      onOpacityChange={(e)=>{
        let opacity = e.target.value;
        console.log(opacity);
        if (opacity < 0) opacity = 0;
        if (opacity > 100) opacity = 100;
        setSecondaryOpacityInput(opacity);
        updateQRConfig({
          custom: {
            ...device.qr.custom,
            secondaryColor: combineHexWithOpacity(secondaryColorInput, opacity),
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
        updateQRConfig({
          custom: {
            ...device.qr.custom,
            borderColor: combineHexWithOpacity(hex, alpha),
          },
        });
      }} 
      onColorChange={(e)=>{
        let color = e.target.value;
        if (!color.startsWith("#")) {
          color = "#" + color;
        }
        setBorderColorInput(color.toUpperCase());
        if(chroma.valid(color)){
        updateQRConfig({
          custom: {
            ...device.qr.custom,
            borderColor: combineHexWithOpacity(color, borderOpacityInput),
          },
        });}
      }}
      onOpacityChange={(e)=>{
        let opacity = e.target.value;
        console.log(opacity);
        if (opacity < 0) opacity = 0;
        if (opacity > 100) opacity = 100;
        setBorderOpacityInput(opacity);
        updateQRConfig({
          custom: {
            ...device.qr.custom,
            borderColor: combineHexWithOpacity(borderColorInput, opacity),
          },
        });
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
            updateQRConfig({
              custom: {
                ...device.qr.custom,
                borderSizeRatio: parseFloat(e.target.value),
              },
            });
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
            updateQRConfig({
              custom: {
                ...device.qr.custom,
                cornerRadiusRatio: parseFloat(e.target.value),
              },
            });
          }}
        />
      </div>
      <h3 className="block border-b border-[var(--border-color)]/50 pb-1 px-3.5 mb-2.5">
        Icon
      </h3>
      <div className="flex items-center pb-2.5 px-3.5">
        <h4> File Name</h4>
        *** IMAGE UPLOADER ***
      </div>
    </div>
  );
}

export default QRGenerator;
