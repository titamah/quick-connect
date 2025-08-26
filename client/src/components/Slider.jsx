import { ColorPicker } from "antd";
import React, { useState, useRef, useEffect } from "react";

const Slider = ({ id, presets, stacked, deleteStop, value, onChange, changeColor, color, min = 0, max = 100, onColorPickerOpen, onColorPickerClose, onBlur }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [thumbLeft, setThumbLeft] = useState(0);
  const [openPicker, setOpenPicker] = useState(false);
  const [drag, setDrag] = useState(false);
  const containerRef = useRef(null);
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

  useEffect(() => {
    const arrow = containerRef.current.querySelector('.ant-popover-arrow');
    if (arrow) { arrow.style.left = `${thumbLeft * 0.95}px` }
    const popUp = containerRef.current.querySelector('.ant-popover');
    if (popUp) { popUp.style.pointerEvents = "all" }

  }, [openPicker, thumbLeft]);

  return (
    <div
    // ref={containerRef}
      className= {`${ stacked ? "absolute pointer-events-none" : "pointer-events-auto"} w-full h-full`}
      onMouseDown={() => setShowTooltip(true && !openPicker)}
      onMouseUp={(e) => { setShowTooltip(false) }}
      onKeyDownCapture={(e) => {
        if (openPicker && e.key === "Backspace") {
          deleteStop();
        }
      }}
    >
      {showTooltip && (
        <div
          className="absolute -top-8 text-xs px-2 py-1 rounded bg-[var(--contrast)]"
          style={{ left: thumbLeft, transform: "translateX(-50%)", color: "var(--bg-main)" }}
        >
          {Math.round(value)}%
        </div>
      )}
      <div
    ref={containerRef}
      className= {`relative`}>
        {stacked ? (
<ColorPicker
          value={color}
          open={openPicker}
          mode="solid"
          disabledAlpha
          presets={presets}
          onChange={changeColor}
          onOpenChange={(e)=>{
            setOpenPicker(e && !drag)
            if (e && !drag) {
              onColorPickerOpen?.(); // Call when picker opens
            } else {
              onColorPickerClose?.(); // Call when picker closes
            }
          }}
          getPopupContainer={() => containerRef.current}
          popupStyle={{
            position: 'absolute',
            inset: `auto auto ${thumbLeft} auto`,
            transform: `translateX(${thumbLeft}px)`,
          }}
          >
      <input
        ref={sliderRef}
        id={id ? `${id}-input` : null}
        type="range"
        value={value}
        min={min}
        max={max}
        onChangeCapture={(e)=>{setDrag(true)}}
        onMouseDown={()=>{setDrag(false)}}
        onChange={onChange}
        onBlur={onBlur}
        className={`appearance-none w-full absolute -translate-y-[2px] ${ stacked ? "" : "rounded-full relative mt-[7.5px] h-[8px] bg-[var(--contrast-sheer)]"}`}
      />
      </ColorPicker>)
      :(
              <input
                ref={sliderRef}
                id={id ? `${id}-input` : null}
                type="range"
                value={value}
                min={min}
                max={max}
                onChangeCapture={(e)=>{setDrag(true)}}
                onMouseDown={()=>{setDrag(false)}}
                        onChange={onChange}
        onBlur={onBlur}
        className={`appearance-none w-full absolute -translate-y-[2px] ${ stacked ? "" : "rounded-full relative mt-[7.5px] h-[8px] bg-[var(--contrast-sheer)]"}`}
      />)}
      </div>
    </div>
  );
};

export default Slider;
