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
      c.style.backgroundColor = "rgba(255,255,255,.05)";
      c.style.border = "0";
    });
  }, [panelSize]);

  const getColorString = (String) => {
    setDevice((prevDevice) => ({
      ...prevDevice,
      qr: { url: prevDevice.qr.url, custom: true },
    }));
    return typeof String === "string" ? String : String?.toHexString();
  };

  const [color, setColor] = useState("#000");

  const [bgColor, setBGColor] = useState("#fff");
  const [borderColor, setBorderColor] = useState("#fff");

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
            qr: { url: e.target.value, custom: false },
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
      Border Color
      <div className="flex justify-between py-2">
        <ColorPicker
          value={borderColor}
          className="qr-color-picker"
          onChange={(e) => {
            setBorderColor(getColorString(e));
          }}
          format="hex"
          size="small"
          showText
        />
      </div>
      Border Color
      <div className="flex justify-between py-2">
        <ColorPicker
          value={borderColor}
          className="qr-color-picker"
          onChange={(e) => {
            setBorderColor(getColorString(e));
          }}
          format="hex"
          size="small"
          showText
        />
      </div>
    </div>
  );
}

export default QRGenerator;

// import React from 'react';
// import { Input, QRCode, Space } from 'antd';
// const App = () => {
//   const [text, setText] = React.useState('https://ant.design/');
//   return (
//     <Space direction="vertical" align="center">
//       <QRCode value={text || '-'} />
//       <Input
//         placeholder="-"
//         maxLength={60}
//         value={text}
//         onChange={(e) => setText(e.target.value)}
//       />
//     </Space>
//   );
// };
// export default App;
