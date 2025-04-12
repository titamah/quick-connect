import React, { useState, useRef, useEffect } from "react";

const Slider = ({ id, index, value, onChange, color, min = 0, max = 100 }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [thumbLeft, setThumbLeft] = useState(0);
  const sliderRef = useRef(null);

  const updateThumbPosition = () => {
    if (!sliderRef.current) return;
    const slider = sliderRef.current;
    const percent = (value - min) / (max - min);
    const thumbOffset = percent * slider.offsetWidth;
    setThumbLeft(thumbOffset);
  };

  useEffect(() => {
    updateThumbPosition();
  }, [value]);

  return (
    <div
      className= {`${ index ? "absolute pointer-events-none" : ""} w-full h-full`}
      onMouseDown={() => setShowTooltip(true)}
      onMouseUp={() => setShowTooltip(false)}
    >
      {showTooltip && (
        <div
          className="absolute -top-8 text-xs px-2 py-1 rounded bg-[var(--contrast)]"
          style={{ left: thumbLeft, transform: "translateX(-50%)", color: "var(--bg-main)" }}
        >
          {Math.round(value)}%
        </div>
      )}

      <input
        ref={sliderRef}
        id={id ? id : null}
        type="range"
        value={value}
        min={min}
        max={max}
        onChange={onChange}
        className={`appearance-none w-full absolute -translate-y-1/4 ${ index ? "" : "rounded-full cursor-pointer relative mt-[7.5px] h-[5px] bg-[var(--contrast-sheer)]"}`}
      />
      <style jsx>
        {`
          input[type="range"]::-moz-range-thumb {
            border: 2px solid var(--bg-main);
            border-radius: 50%;
            height: 10px;
            width: 10px;
            cursor: pointer;
            pointer-events: all;
            appearance: none;
            box-shadow: 0 0 0 1px var(--contrast-sheer);
          }

          input[type="range"]::-webkit-slider-thumb {
            border: 2px solid var(--bg-main);
            border-radius: 50%;
            height: 10px;
            width: 10px;
            cursor: pointer;
            pointer-events: all;
            appearance: none;
            box-shadow: 0 0 0 1px var(--contrast-sheer);
          }

          input[type="range"]::-moz-range-thumb:hover {
            height: 12px;
            width: 12px;
            box-shadow: 0 0 0 1px var(--accent);
          }

          input[type="range"]::-webkit-slider-thumb:hover {
            height: 12px;
            width: 12px;
            box-shadow: 0 0 0 1px var(--accent);
          }

          #${id}::-webkit-slider-thumb {
            background-color: ${color}!important;
          }
          #${id}::-moz-range-thumb {
            background-color: ${color}!important;
          }
        `}
      </style>
    </div>
  );
};

export default Slider;
