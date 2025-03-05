import { Stage, Rect, Layer, Circle } from "react-konva";
import React, { forwardRef, useEffect } from "react";

const Wallpaper = forwardRef(({ device }, ref) => {
  return (
    <Stage 
      width={device.size.x} 
      height={device.size.y} 
      ref={ref}
    >
      <Layer>
        <Rect 
          width={device.size.x} 
          height={device.size.y} 
          fill={device.bg} 
        />
        <Circle x={200} y={100} stroke="black" radius={50} />
      </Layer>
    </Stage>
  );
});

export default Wallpaper;
