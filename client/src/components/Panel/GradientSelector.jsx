import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDevice } from "../../contexts/DeviceContext";
import Slider from "../Slider";
import Dropdown from "./Dropdown";
import PositionInput from "./PositionInput";
import AngleInput from "./AngleInput";
import chroma from "chroma-js";

import { BetweenVerticalEnd, ArrowLeftRight, Grip } from "lucide-react";
import "./styles.css";

function GradientSelector() {
  const { device, updateBackground, takeSnapshot } = useDevice();
  const gradientBar = useRef(null);

  const [frozenPreset, setFrozenPreset] = useState(null);

  // Separate processed stops for sorting display/CSS without affecting dragging
  const [processedStops, setProcessedStops] = useState([]);

  const updateGrain = useCallback(
    (grain) => {
      updateBackground({ grain });
    },
    [updateBackground]
  );

  const [gradientCSS, setGradientCSS] = useState(null);

  // Update processed stops whenever gradient stops change
  useEffect(() => {
    const updatedStops = [];
    for (let i = 0; i < device.gradient.stops.length; i += 2) {
      updatedStops.push({
        percent: device.gradient.stops[i] * 100,
        color: device.gradient.stops[i + 1],
      });
    }
    // Sort for display/CSS purposes only
    updatedStops.sort((a, b) => a.percent - b.percent);
    setProcessedStops(updatedStops);
  }, [device.gradient.stops]);

  const updateCSS = () => {
    let css = "";
    if (device.gradient.type === "radial") {
      const posX = Math.round(device.gradient.pos.x * 100);
      const posY = Math.round(device.gradient.pos.y * 100);
      css = `radial-gradient(circle at ${posX}% ${posY}%,`;
    } else {
      css = `linear-gradient(${device.gradient.angle}deg,`;
    }

    // Use processedStops for CSS generation (sorted)
    const stopsCSS = processedStops.map(({ percent, color }) => `${color} ${percent}%`);
    css += stopsCSS.join(", ") + ")";
    setGradientCSS(css);
  };

  useEffect(() => {
    updateCSS();
  }, [processedStops, device.gradient.type, device.gradient.angle, device.gradient.pos]);

  const handleClick = (e) => {
    const rect = gradientBar.current.getBoundingClientRect();
    const clickX = (e.clientX || e.touches?.[0]?.clientX || 0) - rect.left;
    const percent = clickX / rect.width;
    let currentStops = [...device.gradient.stops];

    if (currentStops.length < 2) {
      const newStop = [parseFloat(percent.toFixed(2)), chroma.random().css()];
      currentStops.push(...newStop);
    } else {
      const newStop = [parseFloat(percent.toFixed(2)), "???"];
      currentStops.push(...newStop);

      const sortedStops = [];
      for (let i = 0; i < currentStops.length; i += 2) {
        sortedStops.push([currentStops[i], currentStops[i + 1]]);
      }
      sortedStops.sort((a, b) => a[0] - b[0]);

      const addedStopIndex = sortedStops.findIndex((stop) => stop[1] === "???");

      if (addedStopIndex > 0 && addedStopIndex < sortedStops.length - 1) {
        const preStop = sortedStops[addedStopIndex - 1];
        const postStop = sortedStops[addedStopIndex + 1];
        const mix =
          (sortedStops[addedStopIndex][0] - preStop[0]) /
          (postStop[0] - preStop[0]);
        sortedStops[addedStopIndex][1] = chroma
          .mix(preStop[1], postStop[1], mix)
          .css();
      } else if (addedStopIndex === 0) {
        sortedStops[addedStopIndex][1] =
          sortedStops[1]?.[1] || chroma.random().css();
      } else {
        sortedStops[addedStopIndex][1] =
          sortedStops[sortedStops.length - 2]?.[1] || chroma.random().css();
      }

      currentStops = sortedStops.flat();
    }

    updateBackground({
      gradient: {
        ...device.gradient,
        stops: currentStops,
      },
    });
  };

  const handleColorPickerOpen = (stopIndex) => {
    const currentStopColor = device.gradient.stops[stopIndex * 2 + 1];
    if (currentStopColor) {
      const hexColor = currentStopColor.startsWith("rgb")
        ? currentStopColor
            .match(/\d+/g)
            ?.map((num) => parseInt(num).toString(16).padStart(2, "0"))
            .join("")
        : currentStopColor.replace("#", "");

      const fullHexColor = hexColor ? `#${hexColor}` : currentStopColor;
      const normalizedExclude = fullHexColor.toLowerCase();

      const paletteWithoutCurrent = device.palette.filter(
        (color) => color.toLowerCase() !== normalizedExclude
      );
      setFrozenPreset(paletteWithoutCurrent);
    } else {
      setFrozenPreset([...device.palette]);
    }
  };

  const handleColorPickerClose = () => {
    setFrozenPreset(null);
  };

  const getPresetForGradientStop = (stopIndex) => {
    const currentStopColor = device.gradient.stops[stopIndex * 2 + 1];
    if (!currentStopColor) return frozenPreset || device.palette;

    const hexColor = currentStopColor.startsWith("rgb")
      ? currentStopColor
          .match(/\d+/g)
          ?.map((num) => parseInt(num).toString(16).padStart(2, "0"))
          .join("")
      : currentStopColor.replace("#", "");

    const fullHexColor = hexColor ? `#${hexColor}` : currentStopColor;
    const normalizedExclude = fullHexColor.toLowerCase();

    const paletteToUse = frozenPreset || device.palette;
    return paletteToUse.filter(
      (color) => color.toLowerCase() !== normalizedExclude
    );
  };

  const handleMenuClick = (e) => {
    takeSnapshot("Toggle gradient type");
    const newType = device.gradient.type === "linear" ? "radial" : "linear";

    updateBackground({
      gradient: {
        ...device.gradient,
        type: newType,
      },
    });
  };

  const menuOptions =
    device.gradient.type === "linear" ? ["Radial"] : ["Linear"];

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
            color={device.grain ? "var(--accent)" : "var(--text-secondary)"}
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

              const newStops = [];
              for (let i = 0; i < device.gradient.stops.length; i += 2) {
                val += stopsInterval;
                newStops.push(val, device.gradient.stops[i + 1]);
              }

              updateBackground({
                gradient: {
                  ...device.gradient,
                  stops: newStops,
                },
              });
            }}
          />
          <ArrowLeftRight
            className="opacity-75 hover:opacity-100 cursor-pointer"
            size={20}
            onClick={() => {
              takeSnapshot("Reverse gradient");

              // Convert 1D array to pairs for easier manipulation
              const pairs = [];
              for (let i = 0; i < device.gradient.stops.length; i += 2) {
                const percent = device.gradient.stops[i];
                const color = device.gradient.stops[i + 1];
                pairs.push([percent, color]);
              }

              // Reverse the order of pairs and flip the percentages
              const reversedPairs = pairs.reverse().map(([percent, color]) => [1 - percent, color]);

              // Convert back to 1D array
              const newStops = [];
              reversedPairs.forEach(([percent, color]) => {
                newStops.push(percent, color);
              });

              updateBackground({
                gradient: {
                  ...device.gradient,
                  stops: newStops,
                },
              });
            }}
          />
        </span>
      </div>
      <div className="space-y-1 !w-full">
        <div
          className="react-colorful__saturation !w-full !border-radius-[4px] !border-[5px] !border-white dark:!border-[rgba(38,38,38,1)] !shadow-[0_0_0_.95px_rgb(215,215,215)] dark:!shadow-[0_0_0_.95px_rgb(66,66,66)]"
          style={{ background: gradientCSS }}
        />
        <div className="relative mt-[12px]">
          <div
            ref={gradientBar}
            className="w-full rounded-full  cursor-pointer relative react-colorful__hue"
            onClick={handleClick}
            onTouchStart={handleClick}
            style={{
              background: `linear-gradient(90deg, ${processedStops
                .map(({ color, percent }) => `${color} ${percent}%`)
                .join(", ")})`,
            }}
          ></div>
          <div className="absolute w-full top-[0]">
            {(() => {
              const stopsArray = [];
              for (let i = 0; i < device.gradient.stops.length; i += 2) {
                stopsArray.push({
                  index: i / 2,
                  percent: device.gradient.stops[i],
                  color: device.gradient.stops[i + 1],
                });
              }
              return stopsArray.map(({ index, percent, color }) => (
                <Slider
                  key={index} // Use stable index since we're not reordering the original array
                  id={`gradient-slider-${index}`}
                  index={index}
                  stacked
                  deleteStop={(e) => {
                    takeSnapshot("Delete gradient stop");
                    const newStops = [...device.gradient.stops];
                    newStops.splice(index * 2, 2);
                    updateBackground({
                      gradient: {
                        ...device.gradient,
                        stops: newStops,
                      },
                    });
                  }}
                  min="0"
                  max="100"
                  color={color}
                  presets={[
                    {
                      label: "Active Colors",
                      colors: getPresetForGradientStop(index),
                    },
                  ]}
                  onColorPickerOpen={() => handleColorPickerOpen(index)}
                  onColorPickerClose={handleColorPickerClose}
                  value={percent * 100}
                  onChange={(e) => {
                    const newPercent = Number(e.target.value) / 100;
                    const newStops = [...device.gradient.stops];
                    newStops[index * 2] = newPercent;

                    // Real-time update without sorting - allows free dragging
                    updateBackground({
                      gradient: {
                        ...device.gradient,
                        stops: newStops,
                      },
                    });
                  }}
                  onBlur={() => {
                    // No additional action needed - processedStops handles sorting for display
                    updateBackground({
                      gradient: {
                        ...device.gradient,
                        stops: device.gradient.stops,
                      },
                    });
                  }}
                  changeColor={(e) => {
                    const newStops = [...device.gradient.stops];
                    newStops[index * 2 + 1] = e.toHexString();

                    updateBackground({
                      gradient: {
                        ...device.gradient,
                        stops: newStops,
                      },
                    });
                  }}
                  onColorBlur={() => {
                    updateBackground({
                      gradient: {
                        ...device.gradient,
                        stops: device.gradient.stops,
                      },
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
          <div className="w-full mt-4 space-y-2">
            <h4> Angle </h4>
            <AngleInput
              type="gradient"
              angle={device.gradient.angle}
              onUpdate={(newAngle) =>
                updateBackground({
                  gradient: { ...device.gradient, angle: newAngle },
                })
              }
              max={360}
              takeSnapshot={takeSnapshot}
            />
          </div>
        ) : (
          <div className="w-full mt-4 space-y-2">
            <h4> Position </h4>
            <PositionInput
              type="gradient"
              position={device.gradient.pos}
              onUpdate={(newPosition) =>
                updateBackground({
                  gradient: { ...device.gradient, pos: newPosition },
                })
              }
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