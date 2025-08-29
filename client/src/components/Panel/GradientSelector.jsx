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
  const { device, updateBackground, updateQRConfig, updateDeviceInfo, getPaletteExcluding, takeSnapshot } = useDevice();
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
    if (device.gradient.type === "radial") {
      const posX = Math.round(device.gradient.pos.x * 100);
      const posY = Math.round(device.gradient.pos.y * 100);
      css = `radial-gradient(circle at ${posX}% ${posY}%,`;
    } else {
      css = `linear-gradient(${device.gradient.angle}deg,`;
    }
    
    // Convert flat array to CSS format
    const stopsCSS = [];
    for (let i = 0; i < device.gradient.stops.length; i += 2) {
      const percent = device.gradient.stops[i] * 100;
      const color = device.gradient.stops[i + 1];
      stopsCSS.push(`${color} ${percent}%`);
    }
    
    css += stopsCSS.join(", ") + ")";
    setGradientCSS(css);
  };

  useEffect(() => {
    updateCSS();
  }, [device.gradient.stops, device.gradient.type, device.gradient.angle, device.gradient.pos]);

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
    let currentStops = [...device.gradient.stops];

    if (currentStops.length < 2) { 
      // No stops exist, create first stop
      const newStop = [parseFloat(percent.toFixed(2)), chroma.random().css()];
      currentStops.push(...newStop);
    } else {
      // Add new stop to flat array
      const newStop = [parseFloat(percent.toFixed(2)), "???"];
      currentStops.push(...newStop);
      
      // Sort the flat array by percent values (even indices)
      const sortedStops = [];
      for (let i = 0; i < currentStops.length; i += 2) {
        sortedStops.push([currentStops[i], currentStops[i + 1]]);
      }
      sortedStops.sort((a, b) => a[0] - b[0]);
      
      // Find the added stop and calculate its color
      const addedStopIndex = sortedStops.findIndex(stop => stop[1] === "???");
      
      if (addedStopIndex > 0 && addedStopIndex < sortedStops.length - 1) {
        const preStop = sortedStops[addedStopIndex - 1];
        const postStop = sortedStops[addedStopIndex + 1];
        const mix = (sortedStops[addedStopIndex][0] - preStop[0]) / (postStop[0] - preStop[0]);
        sortedStops[addedStopIndex][1] = chroma.mix(preStop[1], postStop[1], mix).css();
      } else if (addedStopIndex === 0) {
        sortedStops[addedStopIndex][1] = sortedStops[1]?.[1] || chroma.random().css();
      } else {
        sortedStops[addedStopIndex][1] = sortedStops[sortedStops.length - 2]?.[1] || chroma.random().css();
      }
      
      // Flatten back to device format
      currentStops = sortedStops.flat();
    }
    
    // Update device state directly
    updateBackground({
      gradient: {
        ...device.gradient,
        stops: currentStops,
      }
    });
  };

  // Remove the problematic useEffect that causes infinite loops
  // useEffect(() => {
  //   updateGradient({
  //     type: type,
  //     stops: stops.flat(),
  //     angle: device.gradient.angle,
  //     pos: device.gradient.pos,
  //   });
  // }, [stops, type, device.gradient.angle, device.gradient.pos]);

  // Frozen preset logic to prevent flickering during color picking
  const handleColorPickerOpen = (stopIndex) => {
    // Freeze palette without the current stop color
    const currentStopColor = device.gradient.stops[stopIndex * 2 + 1]; // Color is at odd index
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
    const currentStopColor = device.gradient.stops[stopIndex * 2 + 1]; // Color is at odd index
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
    takeSnapshot("Toggle gradient type");
    const newType = device.gradient.type === "linear" ? "radial" : "linear";
    
    // Explicitly update device state for real-time feedback
    updateBackground({
      gradient: {
        ...device.gradient,
        type: newType,
      }
    });
  };

  const menuOptions = device.gradient.type === "linear" ? ["Radial"] : ["Linear"];

  return (
    <div className="dark:text-white w-full">
      <div className="flex flex-row items-center justify-between w-full mb-2">
        <Dropdown
          options={menuOptions}
          value={device.gradient.type}
          onChange={handleMenuClick}
        />
        <span className="flex items-center gap-2 pointer-events-auto">
        <Grip 
  className="opacity-75 hover:opacity-100 cursor-pointer"
  size={20}
  onClick={() => {
    takeSnapshot("Toggle grain");
    updateGrain(!device.grain);
  }}
/>
          <BetweenVerticalEnd
            className="opacity-75 hover:opacity-100 cursor-pointer"
            size={20}
            onClick={() => {
              takeSnapshot("Evenly spaced gradient");
              const stopsCount = device.gradient.stops.length / 2;
              const stopsInterval = 1 / (stopsCount - 1);
              let val = -stopsInterval;
              
              // Create new evenly spaced stops
              const newStops = [];
              for (let i = 0; i < device.gradient.stops.length; i += 2) {
                val += stopsInterval;
                newStops.push(val, device.gradient.stops[i + 1]); // percent, color
              }
              
              updateBackground({
                gradient: {
                  ...device.gradient,
                  stops: newStops,
                }
              });
            }}
          />
          <ArrowLeftRight
            className="opacity-75 hover:opacity-100 cursor-pointer"
            size={20}
            onClick={() => {
              takeSnapshot("Reverse gradient");
              
              // Create reversed stops
              const newStops = [];
              for (let i = 0; i < device.gradient.stops.length; i += 2) {
                const percent = device.gradient.stops[i];
                const color = device.gradient.stops[i + 1];
                newStops.push(1 - percent, color); // reverse percent, keep color
              }
              
              updateBackground({
                gradient: {
                  ...device.gradient,
                  stops: newStops,
                }
              });
            }}
          />
        </span>
      </div>
      <div className="react-colorful space-y-1 !w-full">
        {/* <ColorPicker
          // ref={gradientPreview}
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
              background: `linear-gradient(90deg, ${(() => {
                const stopsCSS = [];
                for (let i = 0; i < device.gradient.stops.length; i += 2) {
                  const percent = device.gradient.stops[i] * 100;
                  const color = device.gradient.stops[i + 1];
                  stopsCSS.push(`${color} ${percent}%`);
                }
                return stopsCSS.join(", ");
              })()})`,
            }}
          ></div>
          <div className="absolute w-full top-2/3">
            {(() => {
              // Convert flat array to array of stops for mapping
              const stopsArray = [];
              for (let i = 0; i < device.gradient.stops.length; i += 2) {
                stopsArray.push({
                  index: i / 2,
                  percent: device.gradient.stops[i],
                  color: device.gradient.stops[i + 1]
                });
              }
              return stopsArray.map(({ index, percent, color }) => (
                <Slider
                  key={index}
                  id={`gradient-slider-${index}`}
                  index={index}
                  stacked
                  deleteStop={(e) => {
                    takeSnapshot("Delete gradient stop");
                    const newStops = [...device.gradient.stops];
                    newStops.splice(index * 2, 2); // Remove percent and color
                    updateBackground({
                      gradient: {
                        ...device.gradient,
                        stops: newStops,
                      }
                    });
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
                    const newStops = [...device.gradient.stops];
                    newStops[index * 2] = newPercent; // Update percent at even index
                    
                    // Explicitly update device state for real-time feedback
                    updateBackground({
                      gradient: {
                        ...device.gradient,
                        stops: newStops,
                      }
                    });
                  }}
                  onBlur={() => {
                    // Final update on blur (redundant but safe)
                    updateBackground({
                      gradient: {
                        ...device.gradient,
                        stops: device.gradient.stops,
                      }
                    });
                  }}
                  changeColor={(e) => {
                    const newStops = [...device.gradient.stops];
                    newStops[index * 2 + 1] = e.toHexString(); // Update color at odd index
                    
                    // Explicitly update device state for real-time feedback
                    updateBackground({
                      gradient: {
                        ...device.gradient,
                        stops: newStops,
                      }
                    });
                  }}
                  onColorBlur={() => {
                    // Final update on color blur (redundant but safe)
                    updateBackground({
                      gradient: {
                        ...device.gradient,
                        stops: device.gradient.stops,
                      }
                    });
                  }}
                />
              ));
            })()}
          </div>
        </div>
      </div>
      <div className="flex flex-row items-center justify-center w-full space-x-1">
        {device.gradient.type === "linear" ? (
          <div className="w-full my-4 space-y-2">
          <h4> Angle </h4>
          <AngleInput 
          type="gradient"
          angle={device.gradient.angle}
          onUpdate={(newAngle) => updateBackground({ gradient: { ...device.gradient, angle: newAngle } })}
          max={360}
          takeSnapshot={takeSnapshot}
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
