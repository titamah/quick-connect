import { useState, useEffect, useRef } from "react";
import "preline/preline";
import { useDevice } from "../../contexts/DeviceContext";
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
  const primaryColor = device.qr.custom?.primaryColor || "#000";
  const secondaryColor = device.qr.custom?.secondaryColor || "#fff";

  return (
    <div id="qr-input-box">
      <h2 className=" p-3.5">
        QR Code
      </h2>
    <h3 className="block border-b border-[var(--border-color)]/50 pb-1 px-3.5">
      QR URL
    </h3>
    <div className="p-2 pb-5">
      <input
        id="qr-input"
        type="text"
        className="w-full px-2 py-1 text-xs bg-[var(--contrast-sheer)]/50 border border-[var(--border-color)]/50 focus:outline-none focus:border-[var(--accent)]/50 rounded-xl"
        value={device.qr.url}
        onChange={(e) =>
          updateQRConfig({ 
            url: e.target.value
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
        <ColorPicker
          value={primaryColor}
          placement="bottomRight"
          presets={[{label: "Recently Used", colors: buildHexArray('qr')}]}
          className="qr-color-picker"
          onChange={(color) => {
            updateQRConfig({
              custom: {
                ...device.qr.custom,
                primaryColor: getColorString(color),
              }
            });
          }}
          format="hex"
          size="small"
          showText
        />
      </div>
      <div className="flex items-center pb-5 px-3.5">
      <h4> Secondary </h4>
        <ColorPicker
          value={secondaryColor}
          placement="bottomRight"
          className="qr-color-picker"
          presets={[{label: "Recently Used", colors: buildHexArray('bg')}]}
          onChange={(color) => {
            updateQRConfig({
              custom: {
                ...device.qr.custom,
                secondaryColor: getColorString(color),
              }
            });
          }}
          format="hex"
          size="small"
          showText
        />
      </div>
    <h3 className="block border-b border-[var(--border-color)]/50 pb-1 px-3.5 mb-2.5">
      Border
    </h3>
      <div className="flex items-center pb-2.5 px-3.5">
      <h4> Color</h4>
        <ColorPicker
          value={device.qr.custom.borderColor}
          placement="bottomRight"
          presets={[{label: "Recently Used", colors: buildHexArray('border')}]}
          className="qr-color-picker"
          onChange={(color) => {
            updateQRConfig({
              custom: {
                ...device.qr.custom,
                borderColor: color.toHexString(),
              }
            });
          }}
          format="hex"
          size="small"
          showText
        />
      </div>
      <div className="flex items-center pb-1.5 px-3.5">
<h4> Width</h4>
  <Slider
    min="0"
    max="200"  // 0-20% of QR size
    step="0.5"
    value={device.qr.custom.borderSizeRatio}
    onChange={(e) => {
      updateQRConfig({
        custom: {
          ...device.qr.custom,
          borderSizeRatio: parseFloat(e.target.value),
        }
      });
    }}
  />
</div>
<div className="flex items-center pb-5 px-3.5">
<h4> Radius</h4>
  <Slider
    min="0"
    max="100"  // 0-50% of border size
    step="1"
    value={device.qr.custom.cornerRadiusRatio}
    onChange={(e) => {
      updateQRConfig({
        custom: {
          ...device.qr.custom,
          cornerRadiusRatio: parseFloat(e.target.value),
        }
      });
    }}
  />
</div>
    </div>
  );
}

export default QRGenerator;