import { Stage, Rect, Layer } from "react-konva";
import React, { forwardRef, useEffect, useState } from "react";
import { color } from "d3";
import Konva from "konva";

const Wallpaper = forwardRef(
  ({ device, panelSize, locked, setIsZoomEnabled }, ref) => {
    const [patternImage, setPatternImage] = useState(null);
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const [stageScale, setStageScale] = useState({ x: 1, y: 1 });
    const [isDraggable, setIsDraggable] = useState(false);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    // const [qr, setQR] = useState(null);
    const [qrImg, setQRImg] = useState(null);
    const [isQRLoaded, setIsQRLoaded] = useState(false);
    const [qrSize, setQRSize] = useState(
      Math.min(device.size.x, device.size.y) / 2
    );
    //Temporary QR code
    const [qr, setQR] = useState(
      `http://api.qrserver.com/v1/create-qr-code/?data=HelloWorld!&size=${qrSize}x${qrSize}`
    );

    useEffect(() => {
      setIsDraggable(locked);
    }, [locked]);

    // useEffect(() => {
    //   const fetchQRCode = async () => {
    //     try {
    //       const response = await fetch(
    //         `http://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
    //           device.qr
    //         )}&size=${qrSize}x${qrSize}&color=550022&bgcolor=ffffff&margin=10`
    //       );

    //       if (!response.ok) {
    //         throw new Error(`HTTP error! status: ${response.status}`);
    //       }

    //       const qrBlob = await response.blob();
    //       const qrUrl = URL.createObjectURL(qrBlob);
    //       setQR(qrUrl);
    //     } catch (error) {
    //       console.error("Error fetching QR code:", error);
    //     }
    //   };

    //   if (device.qr) {
    //     fetchQRCode();
    //   }
    // }, [device.qr, qrSize]);

    useEffect(() => {
      if (qr) {
        const qrImage = new Image();
        qrImage.src = `http://api.qrserver.com/v1/create-qr-code/?data=HelloWorld!&size=${qrSize}x${qrSize}`;
        qrImage.src = qr;
        qrImage.onload = () => {
          setQRImg(qrImage);
          setIsQRLoaded(true);
        };
      }
    }, [qr]);

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
          setIsImageLoaded(true); // Set image loaded status to true
        };
      }
    }, [device.isUpload, device.bg]);

    useEffect(() => {
      const scaleX =
        (0.95 * window.innerWidth - panelSize.width) / device.size.x;
      const scaleY =
        (0.95 * window.innerHeight - panelSize.height) / device.size.y;
      const scale = Math.min(scaleX, scaleY);
      setStageScale(scale);
    }, [device.size.x, device.size.y, panelSize.width, panelSize.height]);

    const getScaleFactors = () => {
      if (!imageSize.width || !imageSize.height) return { x: 1, y: 1 };

      // Calculate scale to cover entire stage (like CSS background-size: cover)
      const scaleX = device.size.x / imageSize.width;
      const scaleY = device.size.y / imageSize.height;
      const scale = Math.max(scaleX, scaleY);

      return { x: scale, y: scale };
    };

    const getImageSize = () => {
      return {
        x: imageSize.width * getScaleFactors().x,
        y: imageSize.height * getScaleFactors().y,
      };
    };

    const rectProps = device.isUpload
      ? {
          fillPatternImage: patternImage,
          fillPatternScale: getScaleFactors(),
          width: getImageSize().x,
          height: getImageSize().y,
          x: (device.size.x - getImageSize().x) / 2,
          y: (device.size.y - getImageSize().y) / 2,
          fillPatternRepeat: "no-repeat",
        }
      : {
          fill: device.color,
          width: device.size.x,
          height: device.size.y,
        };

    const handleDragMove = (e) => {
      const shape = e.target;
      const layer = shape.getLayer();
      const stage = layer.getStage();
      const stageWidth = stage.width();
      const stageHeight = stage.height();
      const shapeWidth = shape.width();
      const shapeHeight = shape.height();
      const middleX = (stageWidth - shapeWidth) / 2;
      const middleY = (stageHeight - shapeHeight) / 2;
      const snapThreshold = 50;

      // Constrain position within stage bounds
      const rawX = Math.max(0, Math.min(shape.x(), stageWidth - shapeWidth));
      const rawY = Math.max(0, Math.min(shape.y(), stageHeight - shapeHeight));

      // Determine target position with snapping
      const targetX = Math.abs(rawX - middleX) < snapThreshold ? middleX : rawX;
      const targetY = Math.abs(rawY - middleY) < snapThreshold ? middleY : rawY;

      shape.x(targetX);
      shape.y(targetY);
    };

    const handleMouseDown = (e) => {
      if (isDraggable) {
      const shape = e.target;
      const originalScaleX = shape.scaleX();
      const originalScaleY = shape.scaleY();
      const originalWidth = shape.width() * originalScaleX;
      const originalHeight = shape.height() * originalScaleY;
      const newScale = 0.98;
      const newWidth = shape.width() * newScale;
      const newHeight = shape.height() * newScale;

      // Calculate new position to keep the shape centered
      const newX = shape.x() + (originalWidth - newWidth) / 2;
      const newY = shape.y() + (originalHeight - newHeight) / 2;

      // Use tween for smooth transition
      const tween = new Konva.Tween({
        node: shape,
        duration: 0.05,
        easing: Konva.Easings.EaseInOut,
        scaleX: newScale,
        scaleY: newScale,
        x: newX,
        y: newY,
      }).play();

      setTimeout(() => {
        tween.reverse();      
      }, 60)
    }
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
          borderRadius: "24px",
        }}
        className="
        bg-gray-800 shadow-[0_2.75rem_5.5rem_-3.5rem_rgb(45_55_75_/_20%),_0_2rem_4rem_-2rem_rgb(45_55_75_/_30%),_inset_0_-0.1875rem_0.3125rem_0_rgb(45_55_75_/_20%)] dark:bg-neutral-600 dark:shadow-[0_2.75rem_5.5rem_-3.5rem_rgb(0_0_0_/_20%),_0_2rem_4rem_-2rem_rgb(0_0_0_/_30%),_inset_0_-0.1875rem_0.3125rem_0_rgb(0_0_0_/_20%)]"
      >
        <Stage
          width={device.size.x}
          height={device.size.y}
          style={{
            transform: `scale(${stageScale})`,
            pointerEvents: "auto",
          }}
          ref={ref}
        >
        <Layer>
          {isImageLoaded && <Rect {...rectProps} />}
        </Layer>
          <Layer>
            <Rect
              x={device.size.x / 4}
              y={device.size.y / 1.75}
              fillPatternImage={qrImg}
              stroke="black"
              height={Math.min(device.size.x, device.size.y) / 2}
              width={Math.min(device.size.x, device.size.y) / 2}
              draggable={isDraggable}
              onDragMove={handleDragMove}
              onDragEnd={() => {
                setTimeout(() => {
                  setIsZoomEnabled(false);
                }, 10);
              }}
              onClick={(e) => {
                console.log(e.target.x());
                console.log(device);
                setTimeout(() => {
                  setIsZoomEnabled(false);
                }, 10);
              }}
              onMouseDown={handleMouseDown}
            />
          </Layer>
        </Stage>
      </div>
    );
  }
);

export default Wallpaper;
