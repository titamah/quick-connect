import { useState, useContext, useEffect, useRef } from "react";
import "preline/preline";
import { DeviceContext } from "../../App";
import { HexColorPicker } from "react-colorful";
import "./styles.css";
import { Grip } from "lucide-react";
import chroma from "chroma-js";

function ColorSelector(panelSize) {
  const { device, setDevice } = useContext(DeviceContext);
  const pickerRef = useRef(null);
  const [color, setColor] = useState("#ffad6c");
  const [colorCircles, setColorCircles] = useState(null);


  useEffect(() => {
    const pickerElement = pickerRef.current;
    if (pickerElement) {
      const colorPicker = pickerElement.querySelector(
        ".react-colorful__saturation"
      );
      if (colorPicker) {
        const classesToAdd = [
          "!border-radius-[4px]",
          "!border-[5px]",
          "!border-white",
          "dark:!border-[rgba(38,38,38,1)]",
          "!shadow-[0_0_0_.95px_rgb(215,215,215)]",
          "dark:!shadow-[0_0_0_.95px_rgb(66,66,66)]",
        ];
        colorPicker.classList.add(...classesToAdd); // Add all classes
      }
    }
  }, [pickerRef]);

  const updateColors = (c) => {
    const debounce = (func, delay) => {
      let debounceTimer;
      return function (...args) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(this, args), delay);
      };
    };
    setInputText(c);
    const debouncedUpdateColors = debounce((c) => {
      console.log(c);
      setDevice((prevDevice) => ({
        ...prevDevice,
        color: c,
      }));
    }, 350);
    debouncedUpdateColors(c);
  };

  const setColorCombo = (c) => {
    setColor(c);
  };

  useEffect(() => {
    const num = Math.round((panelSize.panelSize.panelSize.width - 20) / 40);
    const validColors = [device.palette.qr, device.palette.bg, device.palette.border]
    const chromaTest = chroma.scale(validColors).mode("lch").colors(num);
    console.log(chromaTest);
    setColorCircles(
      chromaTest.map((e) => (
        e && 
        <div
          className="recent-color my-auto border-black/25 dark:border-black/75"
          style={{ backgroundColor: e }}
          onClick={() => setColorCombo(e)}
        ></div>
      ))
    );
  }, [device.palette, panelSize.panelSize.panelSize.width]);

  useEffect(() => {
    setDevice((prevDevice) => ({
      ...prevDevice,
      color: color ,
      palette: {...prevDevice.palette, solid: color},
    }));
  }, [color]);

  const getColorString = (x) => {
    return typeof x === "string" ? x.substring(0, 7) : "#ffffff";
  };

  const [inputText, setInputText] = useState(getColorString(color));

  useEffect(() => {
    setInputText(getColorString(color));
  }, [color]);

  return (
    <>
      <div
        id="ColorSelectPanel"
        ref={pickerRef}
        className="dark:text-white w-full h-[290px] px-5 space-y-2.5"
      >
        <span className="flex flex-row items-center justify-between w-full mb-2 ">
          <input
            value={inputText}
            onChange={(e) => {
              const newValue = e.target.value;
              setInputText(newValue);
              if (chroma.valid(newValue)) {
                updateColors(newValue);
              }
            }}
            className="p-1 border-1 border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-200/75 text-sm align-center rounded-sm px-[15px] w-[95px]"
          />
          <Grip
            className="opacity-75 hover:opacity-100 cursor-pointer"
            size={20}
            onClick={() => {
              const curr = device.grain;
              setDevice((prevDevice) => ({
                ...prevDevice,
                grain: !curr,
              }));
            }}
          />
        </span>
        <HexColorPicker
          color={color}
          onChange={(e) => updateColors(e)}
          className="space-y-1 !w-full"
        />
        <div className="w-full mb-3">
          <div
            className="flex flex-row flex-nowrap overflow-show w-full my-3 gap-2.5 "
          >
            {colorCircles}
          </div>
        </div>
      </div>
    </>
  );
}

export default ColorSelector;
