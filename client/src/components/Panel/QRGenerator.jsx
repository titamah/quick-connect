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
    <div id="qr-input-box" className="dark:text-white text-sm">
    <label className="block ">
      QR URL
    </label>
      <input
        id="qr-input"
        type="text"
        className="text-sm !select-all w-full p-[5px] ms-[7.5px] -mx-[0.5px] inline-flex rounded-md bg-black/10 dark:border-neutral-700 dark:text-neutral-400 "
        value={device.qr.url}
        onChange={(e) =>
          updateQRConfig({ 
            url: e.target.value
          })
        }
      />
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
    <label className="block">
      Color
    </label>
      <div className="flex justify-between py-2 text-xs font-medium mb-2 ">
      <div className="min-w-[75px]"> Primary </div>
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
      <div className="flex justify-between py-2 text-xs font-medium mb-2 ">
      <div className="min-w-[75px]"> Secondary </div>
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
    <label className="block">
      Border
    </label>
      <div className="flex justify-between py-2 text-xs font-medium mb-2 ">
      <div className="min-w-[75px]"> Color</div>
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
      <div className="flex justify-between py-2 text-xs font-medium mb-2 ">
      <div className="min-w-[75px]"> Width</div>
        <Slider
          min="0"
          max={qrSize * 2.25}
          step="1"
          value={device.qr.custom.borderSize}
          onChange={(e) => {
            updateQRConfig({
              custom: {
                ...device.qr.custom,
                borderSize: e.target.value,
              }
            });
          }}
        />
      </div>
      <div className="flex justify-between py-2 text-xs font-medium mb-2 ">
      <div className="min-w-[75px]"> Radius</div>
        <Slider
          min="0"
          max={0.75 * qrSize}
          step="1"
          value={device.qr.custom.cornerRadius}
          onChange={(e) => {
            updateQRConfig({
              custom: {
                ...device.qr.custom,
                cornerRadius: e.target.value,
              }
            });
          }}
        />
      </div>
    </div>
  );
}

export default QRGenerator;