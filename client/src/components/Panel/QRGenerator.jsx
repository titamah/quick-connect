import { useState, useContext, useEffect, useRef } from "react";
import "preline/preline";
import { DeviceContext } from "../../App";
import { QRCode, ColorPicker } from "antd";
import Slider from "../Slider";
import chroma from "chroma-js";

function QRGenerator(panelSize) {
  const { device, setDevice } = useContext(DeviceContext);
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
    const svgElement = qrCodeRef.current.querySelector("svg");
    svgElement.style.width = panelSize.width;
    svgElement.style.height = panelSize.width;
    qrCodeRef.current.style.maxWidth = "250px";
    qrCodeRef.current.style.maxHeight = "250px";
    qrCodeRef.current.style.minWidth = panelSize.width;
    qrCodeRef.current.style.minHeight = panelSize.width;
    const currWidth = qrCodeRef.current.offsetWidth;
    qrCodeRef.current.style.height = `${currWidth}px`;

    // const colorPickers = document.querySelectorAll(".qr-color-picker");
    // colorPickers.forEach((c) => {
    //   c.style.width = "100%";
    //   c.style.display = "flex";
    //   c.style.flexDirection = "row-reverse";
    //   c.style.justifyContent = "space-between";
    //   c.style.backgroundColor = "rgba(0,0,0,.1)";
    //   c.style.border = "0";
    //   c.style.color = "rgb(255,255,255)";
    // });
  }, [panelSize]);

  useEffect(() => {
    const QRImage = document.getElementById("#QRImage");
  }, []);

  const getColorString = (String) => {
    setDevice((prevDevice) => ({
      ...prevDevice,
      qr: { url: prevDevice.qr.url, custom: prevDevice.qr.custom },
    }));
    return typeof String === "string" ? String : String?.toHexString();
  };

  const [color, setColor] = useState("#000");

  const [bgColor, setBGColor] = useState("#fff");
  const [borderColor, setBorderColor] = useState("#fff");
  const [borderSize, setBorderSize] = useState(0);

  const [icon, setIcon] = useState(null);
  const [iconSize, setIconSize] = useState(null);

  return (
    <div id="qr-input-box" className="dark:text-white text-sm px-5">
      <input
        id="qr-input"
        type="text"
        className="text-sm !select-all w-full p-[5px] me-[7.5px] -mx-[0.5px] inline-flex rounded-md bg-black/10 dark:border-neutral-700 dark:text-neutral-400 "
        value={device.qr.url}
        onChange={(e) =>
          setDevice((prevDevice) => ({
            ...prevDevice,
            qr: { url: e.target.value, custom: prevDevice.qr.custom },
          }))
        }
      />
      <div className="w-full flex justify-center py-2" style={{}}>
        <QRCode
          ref={qrCodeRef}
          value={device.qr.url || "www.titamah.com"}
          id="QRCode"
          type="svg"
          bordered={false}
          size={qrSize}
          color={color}
          bgColor={bgColor}
          //    icon={icon}
          //    iconSize={iconSize}
        />
      </div>
      QR Color
      <div className="flex justify-between py-2">
        <ColorPicker
          value={color}
          placement="bottomRight"
          presets={[{label: "Recently Used", colors: buildHexArray('qr')}]}
          className="qr-color-picker"
          onChange={(e) => {
            setColor(getColorString(e));
            setDevice((prevDevice) => ({
              ...prevDevice,
              palette: {
                ...prevDevice.palette,
                qr: e.toHexString(),
              },
            }));
          }}
          format="hex"
          size="small"
          showText
        />
      </div>
      BG Color
      <div className="flex justify-between py-2">
        <ColorPicker
          value={bgColor}
          placement="bottomRight"
          className="qr-color-picker"
          presets={[{label: "Recently Used", colors: buildHexArray('bg')}]}
          onChange={(e) => {
            // setColor(getColorString(e));
            setDevice((prevDevice) => ({
              ...prevDevice,
              palette: {
                ...prevDevice.palette,
                bg: e.toHexString(),
              },
            }));
            setBGColor(getColorString(e));
          }}
          format="hex"
          size="small"
          showText
        />
      </div>
      Border Size
      <div className="flex justify-between py-2">
        <Slider
          min="0"
          max={qrSize * 2.25}
          step="1"
          value={device.qr.custom.borderSize}
          onChange={(e) => {
            setDevice((prevDevice) => ({
              ...prevDevice,
              qr: {
                ...prevDevice.qr,
                custom: {
                  ...prevDevice.qr.custom,
                  borderSize: e.target.value,
                },
              },
            }));
          }}
        />
      </div>
      Border Color
      <div className="flex justify-between py-2">
        <ColorPicker
          value={device.qr.custom.borderColor}
          placement="bottomRight"
          presets={[{label: "Recently Used", colors: buildHexArray('border')}]}
          className="qr-color-picker"
          onChange={(e) => {
            setDevice((prevDevice) => ({
              ...prevDevice,
              qr: {
                ...prevDevice.qr,
                custom: {
                  ...prevDevice.qr.custom,
                  borderColor: e.toHexString(),
                },
              },
              palette: {
                ...prevDevice.palette,
                border: e.toHexString(),
              },
            }));
          }}
          format="hex"
          size="small"
          showText
        />
      </div>
      Corner Radius
      <div className="flex justify-between py-2">
        <Slider
          min="0"
          max={0.75 * qrSize}
          step="1"
          value={device.qr.custom.cornerRadius}
          onChange={(e) => {
            console.log(e)
            setDevice((prevDevice) => ({
              ...prevDevice,
              qr: {
                ...prevDevice.qr,
                custom: {
                  ...prevDevice.qr.custom,
                  cornerRadius: e.target.value,
                },
              },
            }));
          }}
        />
      </div>
    </div>
  );
}

export default QRGenerator;
