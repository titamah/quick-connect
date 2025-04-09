import React, { useEffect, useRef, useState, useContext, use } from "react";
import { DeviceContext } from "../../App";
import { ColorPicker } from "antd";
import { reverse } from "d3";

function GradientSelector() {
  const { device, setDevice } = useContext(DeviceContext);
  const [type, setType] = useState("Linear");
  const [inactiveType, setInactiveType] = useState("Radial");
  const gradientPreview = useRef(null);
  const [gradientCSS, setGradientCSS] = useState(
    "linear-gradient(180deg, rgb(52,83,220) 0%, rgb(203,52,220) 28%, rgb(99,8,69) 81%)"
  );
  const [stops, setStops] = useState([
    [0, "rgb(16,142,233)"],
    [0.5, "rgb(228,88,191)"],
    [1, "rgb(177,99,232)"],
  ]);

  const DEFAULT_COLOR = [
    {
      color: "rgb(16, 142, 233)",
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

  const updateStops = (colors) => {
    const rawArray = colors.split(", ").slice(1);
    const stopsArray = [];
    rawArray.forEach((element) => {
      const [color, percent] = element.split(" ");
      const percentValue = parseFloat(percent.replace("%", "")) / 100;
      stopsArray.push([percentValue, color]);
      //   stopsArray.push(color);
    });
    setStops(stopsArray);
    // console.log(stops);
  };

  useEffect(() => {
    // const flatStops = stops.flat(); // Flatten the stops array
    // console.log(flatStops);

    // Update the device.gradient property directly with the flatStops array
    setDevice((prevDevice) => ({
      ...prevDevice,
      gradient: stops.flat(), // Set gradient to the flatStops array
    }));

    console.log("Updated device.gradient:", stops);
  }, [stops]);

  useEffect(() => {
    const colorPreview = gradientPreview.current.querySelector("div");
    colorPreview.style.height = "100%";
    colorPreview.style.width = "100%";
    // colorPreview.style.padding = "0";
    colorPreview.style.backgroundImage = gradientCSS;

    // colo
  }, []);

  return (
    <div className="w-full space-y-2 px-5 dark:text-white">
        <ColorPicker
        ref={gradientPreview}
        defaultValue={DEFAULT_COLOR}
        size="large"
        placement="bottomRight"
        mode="gradient"
        className="w-full h-[200px]"
        disabledAlpha
        onChange={(color) => {
          updateStops(color.toCssString());
          setGradientCSS(color.toCssString());
        }}
      />
      <div
        className="flex items-center justify-between"
        onClick={() => {
          const reverse = stops.map(([percent, color]) => {
            return [1 - percent, color];
          });
          setStops(reverse);
        }}
      >
        <span>Linear Gradient</span>
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
    </div>
  );
}

export default GradientSelector;
