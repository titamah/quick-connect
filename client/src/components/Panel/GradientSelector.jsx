import React, { useEffect, useRef, useState, useContext, use } from "react";
import { DeviceContext } from "../../App";
import { ColorPicker } from "antd";
import { DownOutlined } from '@ant-design/icons';
import { Button, Dropdown, Space, Tooltip } from 'antd';

function GradientSelector() {
  const { device, setDevice } = useContext(DeviceContext);
  const [type, setType] = useState(device.gradient.type);
  const gradientPreview = useRef(null);
  const [angle, setAngle] = useState(90);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [anglePercent, setAnglePercent] = useState({start:{ x: 0.5, y: 0 }, end:{ x: 0.5, y: 1 }});
  const [posPercent, setPosPercent] = useState({ x: 0.5, y: 0.5 });
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


const handleMenuClick = e => {
    setType(type === "linear" ? "radial" : "linear");
  };

const menuProps = {
    items: [{ label: type === "linear" ? "Radial" : "Linear", key: "1" }],
    onClick: handleMenuClick,
};

return (
    <div className="space-y-2 dark:text-white w-full px-5 gap-[10px] flex flex-wrap">
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
            <div className="react-colorful !flex-7 min-w-[150px] w-full !max-w-full !h-[200px]">
                <div
                    className="react-colorful__saturation"
                    style={{ background: gradientCSS }}
                ></div>
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
        </ColorPicker>
        <div className="flex flex-col w-full gap-2">
            <div
                className="flex flex-row items-center justify-between flex-5 w-full"
            >
                <Dropdown menu={menuProps}>
                    <Button>
        <Space>
        {type.charAt(0).toUpperCase() + type.slice(1)}
          <DownOutlined />
        </Space>
      </Button>
    </Dropdown>
                <span className="flex items-center gap-2 pointer-events-auto">
                    <button>
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
                    </button>
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
                        class="lucide lucide-rotate-cw-icon lucide-rotate-cw"
                    >
                        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                        <path d="M21 3v5h-5" />
                    </svg>
                </span>
            </div>
            {type === "linear" ? (
                <div>
                    <input
                        type="range"
                        min="0"
                        max="360"
                        value={angle}
                        onInput={(e) => {
                            setAngle(e.target.value);
                            setAnglePercent(() => {
                                const rad = (angle * Math.PI) / 180;

                                // Direction vector
                                const dx = Math.cos(rad);
                                const dy = Math.sin(rad);

                                // Half-length vector from center in direction of angle
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
                        className="w-full h-3 bg-gray-200 rounded-lg cursor-pointer appearance-none dark:bg-gray-700"
                    />
                </div>
            ) : (
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={pos.x}
                        onChange={(e) => setPos({ ...pos, x: e.target.value })}
                        className="w-full h-8 px-2 border rounded dark:bg-gray-800 dark:border-gray-600"
                        placeholder="X Position"
                    />
                    <input
                        type="text"
                        value={pos.y}
                        onChange={(e) => setPos({ ...pos, y: e.target.value })}
                        className="w-full h-8 px-2 border rounded dark:bg-gray-800 dark:border-gray-600"
                        placeholder="Y Position"
                    />
                </div>
            )}
        </div>
    </div>
);
}

export default GradientSelector;
