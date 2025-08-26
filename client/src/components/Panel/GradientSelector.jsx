import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDevice } from "../../contexts/DeviceContext";
import Slider from "../Slider";
import Dropdown from "./Dropdown";
import PositionInput from "./PositionInput";
import AngleInput from "./AngleInput";
import { ColorPicker, Button, Space, Tooltip } from "antd";
import chroma from "chroma-js";

import {
  BetweenVerticalEnd,
  ArrowLeftRight,
  RotateCcw,
  RotateCw,
  Grip,
  Waves,
} from "lucide-react";
import "./styles.css";

function GradientSelector() {
  const { device, updateBackground, updateQRConfig, updateDeviceInfo, getPaletteExcluding } = useDevice();
  const [type, setType] = useState(device.gradient.type);
  const gradientBar = useRef(null);
  
  // Frozen preset state to prevent flickering during color picking
  const [frozenPreset, setFrozenPreset] = useState(null);

  // Real-time update functions for immediate feedback
  const updateGradient = useCallback((gradientData) => {
    updateBackground({
      gradient: gradientData
    });
  }, [updateBackground]);

  const updateGrain = useCallback((grain) => {
    updateBackground({ grain });
  }, [updateBackground]);





  const [gradientCSS, setGradientCSS] = useState(null);

  const updateCSS = () => {
    let css = "";
    if (type === "radial") {
      const posX = Math.round(device.gradient.pos.x * 100);
      const posY = Math.round(device.gradient.pos.y * 100);
      css = `radial-gradient(circle at ${posX}% ${posY}%,`;
    } else {
      css = `linear-gradient(${device.gradient.angle}deg,`;
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
  }, [processedStops, device.gradient, type]);

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

  function rgbToHex(rgbString) {
    const match = rgbString.match(/\d+/g); // extracts ["255", "170", "0"]
    if (!match) return "#000000"; // fallback
    return (
      "#" +
      match.map((num) => parseInt(num).toString(16).padStart(2, "0")).join("")
    );
  }

  const handleClick = (e) => {
    const rect = gradientBar.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = clickX / rect.width;
    let prevStops = [...stops];

    if (stops.length < 1){ 
      let newStop = [parseFloat(percent.toFixed(2)), chroma.random().css()];
      prevStops.push(newStop);

    } else {
      
    let newStop = [parseFloat(percent.toFixed(2)), "???"];
    prevStops.push(newStop);
    prevStops = prevStops.sort((a, b) => a[0] - b[0]);

    const addedStop = prevStops.findIndex((i) => i[1] === "???");

    let preStop = null;
    let postStop = null;
    if (addedStop > 0) {
      preStop = prevStops[addedStop - 1];
    }
    if (addedStop < prevStops.length - 1) {
      postStop = prevStops[addedStop + 1];
    }
    if (preStop && postStop) {
      let mix =
        (prevStops[addedStop][0] - preStop[0]) / (postStop[0] - preStop[0]);
      prevStops[addedStop][1] = chroma.mix(preStop[1], postStop[1], mix).css();
    } else if (!preStop) {
      prevStops[addedStop][1] = postStop[1];
    } else if (!postStop) {
      prevStops[addedStop][1] = preStop[1];
    }
  }
    setStops(prevStops);
  };

  useEffect(() => {
    updateGradient({
      type: type,
      stops: stops.flat(),
      angle: device.gradient.angle,
      pos: device.gradient.pos,
    });
  }, [stops, type, device.gradient.angle, device.gradient.pos]);

  // Frozen preset logic to prevent flickering during color picking
  const handleColorPickerOpen = (stopIndex) => {
    // Freeze palette without the current stop color
    const currentStopColor = stops[stopIndex]?.[1];
    if (currentStopColor) {
      const hexColor = currentStopColor.startsWith("rgb") 
        ? currentStopColor.match(/\d+/g)?.map(num => parseInt(num).toString(16).padStart(2, '0')).join('')
        : currentStopColor.replace('#', '');
      
      const fullHexColor = hexColor ? `#${hexColor}` : currentStopColor;
      const normalizedExclude = fullHexColor.toLowerCase();
      
      const paletteWithoutCurrent = device.palette.filter(color => color.toLowerCase() !== normalizedExclude);
      setFrozenPreset(paletteWithoutCurrent);
    } else {
      setFrozenPreset([...device.palette]);
    }
  };

  const handleColorPickerClose = () => {
    setFrozenPreset(null); // Unfreeze
  };

  // Use frozen preset if available, otherwise use current palette
  const getPresetForGradientStop = (stopIndex) => {
    const currentStopColor = stops[stopIndex]?.[1];
    if (!currentStopColor) return frozenPreset || device.palette;
    
    // Convert RGB to hex if needed
    const hexColor = currentStopColor.startsWith("rgb") 
      ? currentStopColor.match(/\d+/g)?.map(num => parseInt(num).toString(16).padStart(2, '0')).join('')
      : currentStopColor.replace('#', '');
    
    const fullHexColor = hexColor ? `#${hexColor}` : currentStopColor;
    const normalizedExclude = fullHexColor.toLowerCase();
    
    // Always exclude current color, whether using frozen or live palette
    const paletteToUse = frozenPreset || device.palette;
    return paletteToUse.filter(color => color.toLowerCase() !== normalizedExclude);
  };

  const handleMenuClick = (e) => {
    setType(type === "linear" ? "radial" : "linear");
  };

  const menuOptions = type === "linear" ? ["Radial"] : ["Linear"];

  return (
    <div className="dark:text-white w-full">
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
    updateGrain(!device.grain);
  }}
/>
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
        {/* <ColorPicker
          ref={gradientPreview}
          value={processedStops}
          size="large"
          placement="topRight"
          mode="gradient"
          disabledAlpha
          onChange={(color) => {
            updateStops(color.toCssString());
          }}
        > */}
        <div
          className="react-colorful__saturation !w-full !border-radius-[4px] !border-[5px] !border-white dark:!border-[rgba(38,38,38,1)] !shadow-[0_0_0_.95px_rgb(215,215,215)] dark:!shadow-[0_0_0_.95px_rgb(66,66,66)]"
          style={{ background: gradientCSS }}
        />
        {/* </ColorPicker> */}
        <div className="relative h-3">
          <div
            ref={gradientBar}
            className="w-full h-3 rounded-full cursor-pointer relative react-colorful__hue"
            onClick={handleClick}
            style={{
              background: `linear-gradient(90deg, ${processedStops
                .map(({ color, percent }) => `${color} ${percent}%`)
                .join(", ")})`,
            }}
          ></div>
          <div className="absolute w-full top-2/3">
            {stops.map(([percent, color], index) => (
              <Slider
                id={`gradient-slider-${index}`}
                index={index}
                stacked
                deleteStop={(e) => {
                  const newStops = [...stops]
                  newStops.splice(index, 1);
                  setStops(newStops);
                }}
                min="0"
                max="100"
                color={color}
                presets={[
                  { label: "Active Colors", colors: getPresetForGradientStop(index) },
                ]}
                onColorPickerOpen={() => handleColorPickerOpen(index)}
                onColorPickerClose={handleColorPickerClose}
                value={percent * 100}
                onChange={(e) => {
                  const newPercent = Number(e.target.value) / 100;
                  const newStops = [...stops];
                  newStops[index][0] = newPercent;
                  updateStops(newStops);
                }}
                onBlur={() => {
                  // Immediate update on blur
                  updateBackground({
                    gradient: {
                      type: type,
                      stops: stops.flat(),
                      angle: device.gradient.angle,
                      pos: device.gradient.pos,
                    }
                  });
                }}
                changeColor={(e) => {
                  const newStops = [...stops];
                  newStops[index][1] = e.toHexString();
                  updateStops(newStops);
                }}
                onColorBlur={() => {
                  // Immediate update on color blur
                  updateBackground({
                    gradient: {
                      type: type,
                      stops: stops.flat(),
                      angle: device.gradient.angle,
                      pos: device.gradient.pos,
                    }
                  });
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-row items-center justify-center w-full space-x-1">
        {type === "linear" ? (
          <div className="w-full my-4 space-y-2">
          <h4> Angle </h4>
          <AngleInput 
          type="gradient"
          angle={device.gradient.angle}
          onUpdate={(newAngle) => updateBackground({ gradient: { ...device.gradient, angle: newAngle } })}
          max={360}
        />
        </div>
        ) : (
          <div className="w-full my-4 space-y-2">
          <h4> Position </h4>
          <PositionInput 
          type="gradient"
          position={device.gradient.pos}
          onUpdate={(newPosition) => updateBackground({ gradient: { ...device.gradient, pos: newPosition } })}
          deviceSize={device.size}
          units="%"
        />
        </div>
        )}
      </div>
    </div>
  );
}

export default GradientSelector;
