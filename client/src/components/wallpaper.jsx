import { Stage, Rect, Layer, Circle } from "react-konva";
import React, { forwardRef, useEffect, useState } from "react";

const Wallpaper = forwardRef(({ device, panelSize, locked, setIsZoomEnabled }, ref) => {
  const [patternImage, setPatternImage] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [stageScale, setStageScale] = useState({ x: 1, y: 1 });
  const [isDraggable, setIsDraggable] = useState(false);

  useEffect(() => {
    setIsDraggable(locked);
  }, [locked]);

  useEffect(() => {
    if (device.isUpload && device.bg) {
      const img = new Image();
      img.src = device.bg;
      img.onload = () => {
        setPatternImage(img);
        setImageSize({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };
    }
  }, [device.isUpload, device.bg]);

  useEffect(() => {
    const scaleX = (0.95 * window.innerWidth - panelSize.width) / device.size.x;
    const scaleY =
      (0.95 * window.innerHeight - panelSize.height) / device.size.y;
    const scale = Math.min(scaleX, scaleY);
    setStageScale(scale);
  }, [device.size.x, device.size.y]);

  const getScaleFactors = () => {
    if (!imageSize.width || !imageSize.height) return { x: 1, y: 1 };

    // Calculate scale to cover entire stage (like CSS background-size: cover)
    const scaleX = device.size.x / imageSize.width;
    const scaleY = device.size.y / imageSize.height;
    const scale = Math.max(scaleX, scaleY);

    return { x: scale, y: scale };
  };

  const rectProps = device.isUpload
    ? {
        fillPatternImage: patternImage,
        fillPatternScale: getScaleFactors(),
        width: device.size.x,
        height: device.size.y,
        fillPatternOffset: {
          x: (imageSize.width * getScaleFactors().x - device.size.x) / 2,
          y: (imageSize.height * getScaleFactors().y - device.size.y) / 2,
        },
      }
    : {
        fill: device.color,
        width: device.size.x,
        height: device.size.y,
      };

  return (
    <div
      id="preview"
      style={{
        width: `${device.size.x * stageScale - 1}px`,
        height: `${device.size.y * stageScale - 1}px`,
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        outline: "10px solid black",
        backgroundColor: "rgba(0,0,0,0)",
        overflow: "hidden",
      }}
      className="
        bg-gray-800 shadow-[0_2.75rem_5.5rem_-3.5rem_rgb(45_55_75_/_20%),_0_2rem_4rem_-2rem_rgb(45_55_75_/_30%),_inset_0_-0.1875rem_0.3125rem_0_rgb(45_55_75_/_20%)] dark:bg-neutral-600 dark:shadow-[0_2.75rem_5.5rem_-3.5rem_rgb(0_0_0_/_20%),_0_2rem_4rem_-2rem_rgb(0_0_0_/_30%),_inset_0_-0.1875rem_0.3125rem_0_rgb(0_0_0_/_20%)]
rounded-4xl"
    >
      <Stage
        width={device.size.x}
        height={device.size.y}
        style={{
          transform: `scale(${stageScale})`,
          transformOrigin: "center center",
          top: "0",
          left: "0",
          pointerEvents: "auto",
        }}
        ref={ref}
      >
        <Layer>
          <Rect {...rectProps} />
          <Circle
            x={200}
            y={100}
            fill="red"
            stroke="black"
            radius={50}
            draggable={isDraggable}
            onDragEnd={()=>{
              setTimeout(() => {
                setIsZoomEnabled(false);
              }, 10);
            }}
            onClick={(e) => {
              console.log("clicked");
              setTimeout(() => {
                setIsZoomEnabled(false);
              }, 50);
            }}
          />
        </Layer>
      </Stage>
    </div>
  );
});

export default Wallpaper;
