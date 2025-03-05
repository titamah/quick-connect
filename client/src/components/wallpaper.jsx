import { Stage, Rect, Layer, Circle } from "react-konva";
import React, { forwardRef } from "react";

const Wallpaper = forwardRef((props, ref) => {
  return (
    <Stage width={2778} height={1284} ref={ref}>
      <Layer>
        <Rect width={1284} height={2778} fill="red" />
        <Circle x={200} y={100} stroke="black" radius={50} />
      </Layer>
    </Stage>
  );
});

export default Wallpaper;
