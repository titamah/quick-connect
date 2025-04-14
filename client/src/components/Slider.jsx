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
        className={`appearance-none w-full absolute -translate-y-[2px] ${ index ? "" : "rounded-full cursor-pointer relative mt-[7.5px] h-[8px] bg-[var(--contrast-sheer)]"}`}
      />
      <style jsx>
        {`

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
