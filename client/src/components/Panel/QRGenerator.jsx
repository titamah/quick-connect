import { useState, useContext, useEffect, useRef } from "react";
import "preline/preline";
import { DeviceContext } from "../../App";
import { QRCode, ColorPicker } from "antd";

function QRGenerator(panelSize) {
  const { device, setDevice } = useContext(DeviceContext);
  const qrCodeRef = useRef(null);
  const [qrSize, setQRSize] = useState(
    Math.min(device.size.x, device.size.y) / 2
  );
  useEffect(() => {
    qrCodeRef.current.style.width = "100%";
    qrCodeRef.current.style.maxWidth = "250px";
    const currWidth = qrCodeRef.current.offsetWidth;
    qrCodeRef.current.style.height = `${currWidth}px`;

    const colorPickers = document.querySelectorAll(".qr-color-picker");
    colorPickers.forEach((c) => {
      c.style.width = "100%";
      c.style.display = "flex";
      c.style.flexDirection = "row-reverse";
      c.style.justifyContent = "space-between";
      c.style.backgroundColor = "rgba(0,0,0,.1)";
      c.style.border = "0";
      c.style.color = "rgb(255,255,255)";
    });
  }, [panelSize]);

  useEffect(()=>{
    const QRImage = document.getElementById("#QRImage");
    console.log(QRImage)
    // QRImage.stroke = "red";
  },[])

  const getColorString = (String) => {
    setDevice((prevDevice) => ({
      ...prevDevice,
      qr: {url: prevDevice.qr.url, custom: prevDevice.qr.custom}

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
    <div id="qr-input-box" className="dark:text-white text-sm">
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
          value={device.qr.url || "-"}
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
          className="qr-color-picker"
          onChange={(e) => {
            setColor(getColorString(e));
          }}
          format="hex"
          size="small"
          showText
        />
      </div>
      Background Color
      <div className="flex justify-between py-2">
        <ColorPicker
          value={bgColor}
          className="qr-color-picker"
          onChange={(e) => {
            setBGColor(getColorString(e));
          }}
          format="hex"
          size="small"
          showText
        />
      </div>
      Border Size
      <div className="flex justify-between py-2">
              <input
                type="range"
                className="w-full bg-transparent cursor-pointer appearance-none disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden
  [&::-webkit-slider-thumb]:w-2.5
  [&::-webkit-slider-thumb]:h-2.5
  [&::-webkit-slider-thumb]:-mt-0.5
  [&::-webkit-slider-thumb]:appearance-none
  [&::-webkit-slider-thumb]:bg-white
  [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(37,99,235,1)]
  [&::-webkit-slider-thumb]:rounded-full
  [&::-webkit-slider-thumb]:transition-all
  [&::-webkit-slider-thumb]:duration-150
  [&::-webkit-slider-thumb]:ease-in-out
  dark:[&::-webkit-slider-thumb]:bg-neutral-700

  [&::-moz-range-thumb]:w-2.5
  [&::-moz-range-thumb]:h-2.5
  [&::-moz-range-thumb]:appearance-none
  [&::-moz-range-thumb]:bg-white
  [&::-moz-range-thumb]:border-4
  [&::-moz-range-thumb]:border-blue-600
  [&::-moz-range-thumb]:rounded-full
  [&::-moz-range-thumb]:transition-all
  [&::-moz-range-thumb]:duration-150
  [&::-moz-range-thumb]:ease-in-out

  [&::-webkit-slider-runnable-track]:w-full
  [&::-webkit-slider-runnable-track]:h-2
  [&::-webkit-slider-runnable-track]:bg-gray-100
  [&::-webkit-slider-runnable-track]:rounded-full
  dark:[&::-webkit-slider-runnable-track]:bg-neutral-700

  [&::-moz-range-track]:w-full
  [&::-moz-range-track]:h-2
  [&::-moz-range-track]:bg-gray-100
  [&::-moz-range-track]:rounded-full"
                id="steps-range-slider-usage"
                aria-orientation="horizontal"
                min="0"
                max={qrSize/3}
                step="1"
                // When border size is changes, transformer tweaks
                // try to switch from StrokeWidth to actual canvas size
                onChange={(e) => {
                    console.log(e.target)
                    setDevice((prevDevice) => ({
                      ...prevDevice,
                      qr: { url: prevDevice.qr.url, custom: {borderSize:e.target.value, borderColor: prevDevice.qr.custom.borderColor, cornerRadius: prevDevice.qr.custom.cornerRadius} },
                    }))}
                }
              ></input>
      </div>
      Border Color
      <div className="flex justify-between py-2">
        <ColorPicker
        //   value={device.qr.custom.borderColor}
          className="qr-color-picker"
          onChange={(e) => {
            console.log(e.toHexString())
            setDevice((prevDevice) => ({
              ...prevDevice,
              qr: { url: prevDevice.qr.url, custom: {borderSize: prevDevice.qr.custom.borderSize, borderColor: e.toHexString(), cornerRadius: prevDevice.qr.custom.cornerRadius} },
            }))
          }}
          format="hex"
          size="small"
          showText
        />
      </div>
      Corner Radius
      <div className="flex justify-between py-2">
              <input
                type="range"
                className="w-full bg-transparent cursor-pointer appearance-none disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden
  [&::-webkit-slider-thumb]:w-2.5
  [&::-webkit-slider-thumb]:h-2.5
  [&::-webkit-slider-thumb]:-mt-0.5
  [&::-webkit-slider-thumb]:appearance-none
  [&::-webkit-slider-thumb]:bg-white
  [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(37,99,235,1)]
  [&::-webkit-slider-thumb]:rounded-full
  [&::-webkit-slider-thumb]:transition-all
  [&::-webkit-slider-thumb]:duration-150
  [&::-webkit-slider-thumb]:ease-in-out
  dark:[&::-webkit-slider-thumb]:bg-neutral-700

  [&::-moz-range-thumb]:w-2.5
  [&::-moz-range-thumb]:h-2.5
  [&::-moz-range-thumb]:appearance-none
  [&::-moz-range-thumb]:bg-white
  [&::-moz-range-thumb]:border-4
  [&::-moz-range-thumb]:border-blue-600
  [&::-moz-range-thumb]:rounded-full
  [&::-moz-range-thumb]:transition-all
  [&::-moz-range-thumb]:duration-150
  [&::-moz-range-thumb]:ease-in-out

  [&::-webkit-slider-runnable-track]:w-full
  [&::-webkit-slider-runnable-track]:h-2
  [&::-webkit-slider-runnable-track]:bg-gray-100
  [&::-webkit-slider-runnable-track]:rounded-full
  dark:[&::-webkit-slider-runnable-track]:bg-neutral-700

  [&::-moz-range-track]:w-full
  [&::-moz-range-track]:h-2
  [&::-moz-range-track]:bg-gray-100
  [&::-moz-range-track]:rounded-full"
                id="steps-range-slider-usage"
                aria-orientation="horizontal"
                min="0"
                max={qrSize/2}
                step="1"
                // value={0}
                onChange={(e) => {
                    console.log(e.target.value)
                    setDevice((prevDevice) => ({
                      ...prevDevice,
                      qr: { url: prevDevice.qr.url, custom: {borderSize: prevDevice.qr.custom.borderSize, borderColor: prevDevice.qr.custom.borderColor, cornerRadius:e.target.value} },
                    }))}
                }
              ></input>
      </div>
    </div>
  );
}

export default QRGenerator;