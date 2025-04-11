import React, { useEffect, useRef, useState, useContext, use } from "react";
import { DeviceContext } from "../../App";
import { ColorPicker } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { Button, Dropdown, Space, Tooltip } from "antd";

function GradientSelector() {
  const { device, setDevice } = useContext(DeviceContext);
  const [type, setType] = useState(device.gradient.type);
  const gradientPreview = useRef(null);
  const [angle, setAngle] = useState(180);
  const [anglePercent, setAnglePercent] = useState({
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
  });
  const [pos, setPos] = useState({ x: 50, y: 66 });
  const [posPercent, setPosPercent] = useState({ x: 0.5, y: 0.66 });

useEffect(() => {
    setPosPercent({x: pos.x * 0.01, y: pos.y * 0.01});
}, [pos]);

  const [gradientCSS, setGradientCSS] = useState(null);

  const updateCSS = () => {
    let css = "";
    if (type === "radial") {
      css = `radial-gradient(circle at ${pos.x}% ${pos.y}%,`;
    } else {
      css = `linear-gradient(${angle}deg,`;
    }
    css +=
      processedStops
        .map(({ percent, color }) => `${color} ${percent}%`)
        .join(", ") + ")";
    setGradientCSS(css);
  };

  const [stops, setStops] = useState([
    [0, "rgb(255,170,0)"],
    [0.5, "rgb(228,88,191)"],
    [1, "rgb(177,99,232)"],
  ]);

  const DEFAULT_COLOR = [
    {
      color: "rgb(255,170,0)",
      percent: 0,
    },
    {
      color: "rgb(228, 88, 191)",
      percent: 50,
    },
    {
      color: "rgb(177, 99, 232)",
      percent: 100,
    },
  ];

  const [processedStops, setProcessedStops] = useState(DEFAULT_COLOR);

  useEffect(() => {
    updateCSS();
  }, [processedStops, angle, pos, type]);

  useEffect(() => {
    const updatedStops = stops
      .map(([percent, color]) => ({
        color,
        percent: percent * 100,
      }))
      .sort((a, b) => a.percent - b.percent);
    setProcessedStops(updatedStops);
  }, [stops]);

  const updateStops = (colors) => {
    if (colors instanceof Array) {
      setStops(colors);
    } else {
      const rawArray = colors.split(", ").slice(1);
      const stopsArray = [];
      rawArray.forEach((element) => {
        const [color, percent] = element.split(" ");
        const percentValue = parseFloat(percent.replace("%", "")) / 100;
        stopsArray.push([percentValue, color]);
      });
      setStops(stopsArray);
    }
  };

  useEffect(() => {
    setDevice((prevDevice) => ({
      ...prevDevice,
      gradient: {
        type: type,
        stops: stops.flat(),
        angle: anglePercent,
        pos: posPercent,
      },
    }));
  }, [stops, type, anglePercent, posPercent]);

  const handleMenuClick = (e) => {
    setType(type === "linear" ? "radial" : "linear");
  };

  const menuProps = {
    items: [{ label: type === "linear" ? "Radial" : "Linear", key: "1" }],
    onClick: handleMenuClick,
  };

  return (
    <div className="dark:text-white w-full px-5 space-y-2.5 mb-3.5">
      <div className="react-colorful space-y-1 !w-full">
        <ColorPicker
          ref={gradientPreview}
          value={processedStops}
          size="large"
          placement="bottomRight"
          mode="gradient"
          disabledAlpha
          onChange={(color) => {
            updateStops(color.toCssString());
          }}
        >
          <div
            className="react-colorful__saturation !w-full !border-radius-[4px] !border-[5px] !border-white dark:!border-[rgba(38,38,38,1)] !shadow-[0_0_0_.95px_rgb(215,215,215)] dark:!shadow-[0_0_0_.95px_rgb(66,66,66)]"
            style={{ background: gradientCSS }}
          />
        </ColorPicker>
        <div
          className="w-full h-3 rounded-full cursor-pointer react-colorful__hue"
          style={{
            background: `linear-gradient(90deg, ${processedStops
              .map(({ color, percent }) => `${color} ${percent}%`)
              .join(", ")})`,
          }}
        >
          {stops.map(([percent, color], index) => (
            <React.Fragment key={index}>
              <style>
                {`
            #gradient-slider-${index} {
                pointer-events: none; /* block full-track dragging */
            }

            #gradient-slider-${index}::-webkit-slider-thumb {
                background-color: ${color};
                border: 1.5px solid white;
                border-radius: 50%;
                height: 15px;
                width: 15px;
                cursor: pointer;
                appearance: none;
                pointer-events: all; /* allow thumb to be draggable */
                position: relative;
                z-index: ${998 * index};
                box-shadow: 0 2px 4px rgba(0,0,0,.2);
            }

            #gradient-slider-${index}::-moz-range-thumb {
                background-color: ${color};
                border: 1.5px solid white;
                border-radius: 50%;
                height: 15px;
                width: 15px;
                cursor: pointer;
                pointer-events: all;
                position: relative;
                z-index: ${998 * index};
                box-shadow: 0 2px 4px rgba(0,0,0,.2);
            }
        `}
              </style>
              <input
                id={`gradient-slider-${index}`}
                type="range"
                min="0"
                max="100"
                value={percent * 100}
                onInput={(e) => {
                  const newPercent = Number(e.target.value) / 100;
                  const newStops = [...stops];
                  newStops[index][0] = newPercent;
                  updateStops(newStops);
                }}
                className="absolute top-[1/2] left-0 w-full h-full appearance-none bg-transparent z-[999]"
              />
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="flex flex-col w-full">
        <div className="flex flex-row items-center justify-between w-full mb-2">
          <Dropdown menu={menuProps}>
            <Button>
              <Space>
                {type.charAt(0).toUpperCase() + type.slice(1)}
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
          <span
            className="flex items-center gap-2 pointer-events-auto"
            onClick={() => {
              const reverse = stops.map(([percent, color]) => {
                return [1 - percent, color];
              });
              setStops(reverse.sort((a, b) => a[0] - b[0]));
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-arrow-left-right-icon lucide-arrow-left-right"
            >
              <path d="M8 3 4 7l4 4" />
              <path d="M4 7h16" />
              <path d="m16 21 4-4-4-4" />
              <path d="M20 17H4" />
            </svg>
          </span>
        </div>
        {type === "linear" ? (
          <React.Fragment>
            <style>
          {`
      #gradient-angle-slide::-webkit-slider-thumb {
          background-color: rgb(115,115,115);
          border: 1.5px solid white;
          border-radius: 50%;
          height: 15px;
          width: 15px;
          cursor: pointer;
          appearance: none;
          pointer-events: all; /* allow thumb to be draggable */
          position: relative;
          box-shadow: 0 2px 4px rgba(0,0,0,.2);
      }

      #gradient-angle-slide::-moz-range-thumb {
          background-color: rgb(115,115,115);
          border: 1.5px solid white;
          border-radius: 50%;
          height: 15px;
          width: 15px;
          cursor: pointer;
          pointer-events: all;
          position: relative;
          box-shadow: 0 2px 4px rgba(0,0,0,.2);
      }
  `}
  </style>
  <span className="text-xs">Angle</span>
            <input
            id="gradient-angle-slide"
              type="range"
              min="0"
              max="360"
              value={angle}
              onInput={(e) => {
                setAngle(e.target.value);
                setAnglePercent(() => {
                  const rad = ((angle - 90) * Math.PI) / 180;

                  const dx = Math.cos(rad);
                  const dy = Math.sin(rad);

                  const half = 0.5;

                  return {
                    start: {
                      x: 0.5 - dx * half,
                      y: 0.5 - dy * half,
                    },
                    end: {
                      x: 0.5 + dx * half,
                      y: 0.5 + dy * half,
                    },
                  };
                });
              }}
              
              className="w-full h-3 rounded-full cursor-pointer border-radius-[4px] mt-[7.5px] h-[5px] appearance-none bg-neutral-300 dark:bg-neutral-700"
            />
          </React.Fragment>
        ) : (
          <div className="flex gap-2">
            <input
              type="number"
              value={pos.x}
              onChange={(e) => setPos({ ...pos, x: e.target.value })}
              className="w-full px-2 border rounded dark:bg-neutral-900/50 dark:border-neutral-700/50"
              placeholder="X Position"
            />
            <input
              type="number"
              value={pos.y}
              onChange={(e) => setPos({ ...pos, y: e.target.value })}
              className="w-full px-2 border rounded dark:bg-neutral-900/50 dark:border-neutral-700/50"
              placeholder="Y Position"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default GradientSelector;
