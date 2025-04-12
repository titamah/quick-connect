import React, { useEffect, useRef, useState, useContext, use } from "react";
import { DeviceContext } from "../../App";
import Slider from "../Slider";
import Dropdown from "./Dropdown";
import { ColorPicker, Button, Space, Tooltip } from "antd";
import {
  BetweenVerticalEnd,
  ArrowLeftRight,
  RotateCcw,
  RotateCw,
  Grip,
  Waves,
} from "lucide-react";

function GradientSelector() {
  const { device, setDevice } = useContext(DeviceContext);
  const [type, setType] = useState(device.gradient.type);
  const gradientPreview = useRef(null);
  const [angle, setAngle] = useState(180);
  const [anglePercent, setAnglePercent] = useState({
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
  });
  const intervalRef = useRef(null);

  const handleAngleChange = (e) => {
    let value = parseInt(e.target.value, 10);

    // Snap if within 3 degrees of target
    const snapThreshold = 5;
    const snapPoints = Array.from({ length: 9 }, (_, i) => i * 45);

    for (let point of snapPoints) {
      if (Math.abs(value - point) <= snapThreshold) {
        value = point;
        break;
      }
    }

    setAngle(value);
  };

  const handleMouseDown = (val) => {
    if (intervalRef.current) return; // Prevent multiple intervals

    intervalRef.current = setInterval(() => {
      setAngle((prevAngle) => {
        if (prevAngle >= 360) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          return 360;
        }
        return prevAngle + val;
      });
    }, 20); // use ~10ms for smooth increments
  };
  const handleMouseUp = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  const [pos, setPos] = useState({ x: 50, y: 66 });
  const [posPercent, setPosPercent] = useState({ x: 0.5, y: 0.66 });

  useEffect(() => {
    setPosPercent({ x: pos.x * 0.01, y: pos.y * 0.01 });
  }, [pos]);

  useEffect(() => {
    const rad = ((angle - 90) * Math.PI) / 180;

    const dx = Math.cos(rad);
    const dy = Math.sin(rad);

    const cx = device.size.x / 2;
    const cy = device.size.y / 2;

    const gradientLength =
      (Math.abs(dx) * device.size.x + Math.abs(dy) * device.size.y) / 2;

    setAnglePercent({
      start: {
        x: cx - dx * gradientLength,
        y: cy - dy * gradientLength,
      },
      end: {
        x: cx + dx * gradientLength,
        y: cy + dy * gradientLength,
      },
    });
  }, [angle, device.size.x, device.size.y]);

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
      palette: [
        ...prevDevice.palette.slice(0,3),
        stops.map(([, color]) => color),
        prevDevice.palette[4],
        prevDevice.palette[5],
      ],
    }));
    console.log(device.palette);
  }, [stops, type, anglePercent, posPercent]);

  const handleMenuClick = (e) => {
    setType(type === "linear" ? "radial" : "linear");
  };

  const menuOptions = type === "linear" ? ["Radial"] : ["Linear"];

  return (
    <div className="dark:text-white w-full px-5">
      <div className="flex flex-row items-center justify-between w-full mb-2">
        <Dropdown
          options={menuOptions}
          value={type}
          onChange={handleMenuClick}
        />
        <span className="flex items-center gap-2 pointer-events-auto">
          <Grip
            className="opacity-75 hover:opacity-100 cursor-pointer"
            size={20}
            onClick={() => {
                const curr = device.grain;
                setDevice((prevDevice) => ({
              ...prevDevice,
              grain: !curr
            }));
            }}/>
          <BetweenVerticalEnd
            className="opacity-75 hover:opacity-100 cursor-pointer"
            size={20}
            onClick={() => {
              const stopsInterval = 1 / (stops.length - 1);
              let val = -stopsInterval;
              const spaced = stops
                .sort((a, b) => a[0] - b[0])
                .map(([percent, color]) => {
                  val += stopsInterval;
                  return [val, color];
                });
              setStops(spaced);
            }}
          />
          <ArrowLeftRight
            className="opacity-75 hover:opacity-100 cursor-pointer"
            size={20}
            onClick={() => {
              const reverse = stops.map(([percent, color]) => {
                return [1 - percent, color];
              });
              setStops(reverse.sort((a, b) => a[0] - b[0]));
            }}
          />
        </span>
      </div>
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
          {stops.map(
            ([percent, color], index) => (
              (
                <Slider
                  id={`gradient-slider-${index}`}
                  index={index + 1}
                  min="0"
                  max="100"
                  color={color}
                  value={percent * 100}
                  onChange={(e) => {
                    const newPercent = Number(e.target.value) / 100;
                    const newStops = [...stops];
                    newStops[index][0] = newPercent;
                    updateStops(newStops);
                  }}
                />
              )
            )
          )}
        </div>
      </div>
      <div className="flex flex-row items-center justify-center w-full space-x-1">
        {type === "linear" ? (
          <React.Fragment>
            <RotateCcw
            className="my-4 opacity-75 hover:opacity-100 cursor-pointer"
              size={20}
              onMouseDown={() => {
                handleMouseDown(-1);
              }}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
            <Slider
              id="gradient-angle-slide"
              color={"var(--accent)"}
              min="0"
              max="360"
              value={angle}
              onChange={handleAngleChange}
            />
            <RotateCw
            className="my-4 opacity-75 hover:opacity-100 cursor-pointer"
              size={20}
              onMouseDown={() => {
                handleMouseDown(1);
              }}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </React.Fragment>
        ) : (
          <div className="flex flex-row gap-2 h-[28px] p-1 text-sm my-3 justify-between w-full bg-neutral-200/50 dark:bg-neutral-900/50 rounded">
            Position
            <span className="flex flex-row gap-1">
              <input
                type="number"
                value={pos.x}
                onChange={(e) => setPos({ ...pos, x: e.target.value })}
                className="pl-2 border w-[51px] rounded bg-white border-neutral-300/50 dark:bg-neutral-900/50 dark:border-neutral-700/50"
                placeholder="X"
              />
              <input
                type="number"
                value={pos.y}
                onChange={(e) => setPos({ ...pos, y: e.target.value })}
                className="pl-2 w-[51px] border rounded bg-white border-neutral-300/50 dark:bg-neutral-900/50 dark:border-neutral-700/50"
                placeholder="Y"
              />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default GradientSelector;
