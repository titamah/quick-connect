import { useState, useContext, useEffect } from "react";
import "preline/preline";
import { DeviceContext } from "../../App";
import { HexColorPicker } from "react-colorful";
import "./styles.css";

function ColorSelector() {
  const { device, setDevice } = useContext(DeviceContext);
  const [color, setColor] = useState("#ffad6c");
  const [recentColors] = useState(["#000000", "#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff0000", "#ffff00", ]);
//   const [recentColors] = useState([]);
  const [colorCircles, setColorCircles] = useState(null);

  const getColorCircle = recentColors.map((e) => (
    <div
      className="recent-color my-auto border-black/25 dark:border-black/75"
      style={{ backgroundColor: e }}
      onClick={() => setColorCombo(e)} // Pass the color value directly
    ></div>
  ));

  const updateColors = (c) => {
    const debounce = (func, delay) => {
      let debounceTimer;
      return function (...args) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(this, args), delay);
      };
    };
    const debouncedUpdateColors = debounce((c) => {
        console.log(c)
      setDevice((prevDevice) => ({
        ...prevDevice,
        color: c,
      }));
    }, 350);
    debouncedUpdateColors(c);
  };

  const setColorCombo = (c) => {
    setColor(c);
    setDevice((prevDevice) => ({
      ...prevDevice,
      color: c,
    }));
  };

  useEffect(() => {
    setColorCircles(getColorCircle);
  }, [recentColors]);

  useEffect(() => {}, [color]);

  const getColorString = (x) => {
    return typeof x === "string" ? x.substring(0, 7) : "#ffffff";
  };

return (
    <div id="ColorSelectPanel" className="dark:text-white text-sm color-selector-panel w-full px-5 gap-[10px] flex flex-wrap">
        <HexColorPicker color={color} onChange={(e) => updateColors(e)} className="flex-7 min-w-[150px] !max-w-full"/>
        <div className="flex-5 w-fit">
            <input
                value={getColorString(color)}
                onChange={(e) => updateColors(e.target.value)}
                className="p-1 border-1 border-black/10 dark:border-white/10 mr-5 text-neutral-600 dark:text-neutral-200/75 text-sm align-center rounded-sm w-full min-w-[75px]"
            />
            <div className="flex flex-wrap  my-[5px] gap-[5px]">
            {getColorCircle}
            </div>
        </div>
    </div>
);
}

export default ColorSelector;