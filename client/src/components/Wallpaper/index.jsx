import { Stage, Rect, Layer, Transformer, Line, Group } from "react-konva";
import React, { forwardRef, useEffect, useState, useRef, use } from "react";
import useWindowSize from "../../hooks/useWindowSize";
import { color } from "d3";
import Konva from "konva";

const Wallpaper = forwardRef(
  ({ device, panelSize, isOpen, locked, setIsZoomEnabled }, ref) => {
    const windowSize = useWindowSize();
    const [patternImage, setPatternImage] = useState(null);
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

    const getStageScale = () => {
      let panelX, panelY;
      if (window.innerHeight > 640) {
        panelX = panelSize.width;
        panelY = 0;
      } else {
        panelX = 0;
        panelY = panelSize.height;
      }
      const scaleX = isOpen
        ? (0.85 * window.innerWidth - panelX) / device.size.x
        : (0.85 * window.innerWidth) / device.size.x;
      const scaleY = isOpen
        ? (0.85 * (window.innerHeight - panelY - 52)) / device.size.y
        : (0.85 * (window.innerHeight - 52)) / device.size.y;
      const scale = Math.min(scaleX, scaleY);
      return scale;
    };

    const [stageScale, setStageScale] = useState({
      x: getStageScale(),
      y: getStageScale(),
    });

    const [isDraggable, setIsDraggable] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const [isCenterX, setIsCenterX] = useState(true);
    const [isCenterY, setIsCenterY] = useState(false);

    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [qrPos, setQRPos] = useState({
      x:(device.size.x / 4),
      y:(device.size.y / 1.75)
    });

    // useEffect(()=> {
    // },[device.size])


    const [qrImg, setQRImg] = useState(null);
    const [qrSize, setQRSize] = useState(
      Math.min(device.size.x, device.size.y) / 2
    );

    const transformerRef = useRef(null);
    const shapeRef = useRef(null);

    useEffect(() => {
      setIsDraggable(locked);
    }, [locked]);

    useEffect(() => {
      setTimeout(() => {
      const svg = document.getElementById("QRCode")?.querySelector("svg");
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const qrImage = new Image();
      qrImage.src = url;
      qrImage.onload = () => {
        console.log(qrImage);
        setQRImg(qrImage);
      };
    }, 1);

      setQRPos({
        x:(device.size.x / 4),
        y:(device.size.y / 1.75)
      })
      setQRSize(Math.min(device.size.x, device.size.y) / 2)

    }, [device.qr, device.size]);

    useEffect(() => {
      if (device.style == "image" && device.bg) {
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
    }, [device.style, device.bg]);

    useEffect(() => {
      setStageScale(getStageScale());
    }, [
      device.size.x,
      device.size.y,
      panelSize.width,
      panelSize.height,
      isOpen,
      windowSize,
    ]);

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

    // const rectProps = (() => {
    //   if (device.style === "image") {
    //     return {
    //       fillPatternImage: patternImage,
    //       fillPatternScale: getScaleFactors(),
    //       width: getImageSize().x,
    //       height: getImageSize().y,
    //       x: (device.size.x - getImageSize().x) / 2,
    //       y: (device.size.y - getImageSize().y) / 2,
    //       fillPatternRepeat: "no-repeat",
    //       fillPriority: "pattern",
    //     };
    //   } else if (device.style === "solid") {
    //     return {
    //       fill: device.color,
    //       width: device.size.x,
    //       height: device.size.y,
    //       x: 0,
    //       y: 0,
    //       fillPriority: "color",
    //     };
    //   } else if (device.style === "linear") {
    //     return {
    //       fillLinearGradientColorStops: device.gradient,
    //       fillLinearGradientStartPoint: { x: 0, y: 0 },
    //       fillLinearGradientEndPoint: { x: device.size.x, y: device.size.y },
    //       width: device.size.x,
    //       height: device.size.y,
    //       x: 0,
    //       y: 0,
    //       fillPriority: "color",
    //     };
    //   } else if (device.style === "radial") {
    //     return {
    //       fillRadialGradientColorStops: device.gradient,
    //       fillRadialGradientStartPoint: { x: device.size.x / 2, y: device.size.y / 2 },
    //       fillRadialGradientEndPoint: { x: device.size.x / 2, y: device.size.y / 2 },
    //       fillRadialGradientStartRadius: 0,
    //       fillRadialGradientEndRadius: Math.max(device.size.x, device.size.y) / 2,
    //       width: device.size.x,
    //       height: device.size.y,
    //       x: 0,
    //       y: 0,
    //       fillPriority: "color",
    //     };
    //   }
    // });
    

    const handleDragMove = (e) => {
      const shape = e.target;
      const layer = shape.getLayer();
      const stage = layer.getStage();
      const stageWidth = stage.width();
      const stageHeight = stage.height();
      const shapeWidth = shape.width() * shape.scaleX();
      const shapeHeight = shape.height() * shape.scaleY();
      const middleX = (stageWidth - shapeWidth) / 2;
      const middleY = (stageHeight - shapeHeight) / 2;
      const snapTolerance = 25;

      // Constrain position within stage bounds
      const rawX = Math.max(0, Math.min(shape.x(), stageWidth - shapeWidth));
      const rawY = Math.max(0, Math.min(shape.y(), stageHeight - shapeHeight));
      let targetX, targetY;
      // Determine target position with snapping
      if (Math.abs(rawX - middleX) < snapTolerance) {
        setIsCenterX(true);
        targetX = middleX;
      } else {
        setIsCenterX(false);
        targetX = rawX;
      }

      if (Math.abs(rawY - middleY) < snapTolerance) {
        setIsCenterY(true);
        targetY = middleY;
      } else {
        setIsCenterY(false);
        targetY = rawY;
      }
      shape.x(targetX);
      shape.y(targetY);
      setQRPos({
        x: targetX + (device.qr.custom.borderSize / 2 * stageScale),
        y: targetY + (device.qr.custom.borderSize / 2 * stageScale)
      })
    };

    const handleMouseDown = (e) => {
      if (isDraggable) {
        const shape = e.target.getParent();
        const originalScaleX = shape.scaleX();
        const originalScaleY = shape.scaleY();
        const originalWidth = shape.width() * originalScaleX;
        const originalHeight = shape.height() * originalScaleY;
        const newScale = 0.985;
        const newWidth = shape.width() * newScale * originalScaleX;
        const newHeight = shape.height() * newScale * originalScaleY;

        // Calculate new position to keep the shape centered
        const newX = shape.x() + (originalWidth - newWidth) / 2;
        const newY = shape.y() + (originalHeight - newHeight) / 2;

        // Use tween for smooth transition
        const tween = new Konva.Tween({
          node: shape,
          duration: 0.1,
          easing: Konva.Easings.BounceEaseInOut,
          scaleX: newScale * originalScaleX,
          scaleY: newScale * originalScaleY,
          x: newX,
          y: newY,
        }).play();

        setTimeout(() => {
          tween.reverse();
        }, 110);
      }
    };

    useEffect(() => {
      shapeRef.current.on("click dragend", (e) => {
        console.log(device.style)
        setTimeout(() => {
          setIsDragging(false);
          transformerRef.current.nodes([shapeRef.current]);
          transformerRef.current.getLayer().batchDraw();
        }, 5);
      });
      shapeRef.current.on("dragstart", (e) => {
        console.log(device.color)
        setTimeout(() => {
          setIsDragging(true);
          transformerRef.current.nodes([]);
          transformerRef.current.getLayer().batchDraw();
        }, 5);
      });
      transformerRef.current.on("transformend", (e) => {
        setTimeout(() => {
          transformerRef.current.nodes([shapeRef.current]);
          transformerRef.current.getLayer().batchDraw();
        }, 5);
      });
      document.getElementById("Canvas").addEventListener("mouseup", (e) => {
        if (transformerRef.current.nodes().length > 0) {
          transformerRef.current.nodes([]);
          transformerRef.current.getLayer().batchDraw();
          cancelBubble();
        }
      });
      // ref.current.on("click", ()=>{
      //   if(isDraggable){setIsZoomEnabled(true)};
      // })
    }, []);

    const handleStageMouseDown = (e) => {
      // Deselect transformer if clicked outside of the target shape
      if (e.target === e.target.getStage()) {
        transformerRef.current.nodes([]);
        transformerRef.current.getLayer().batchDraw();
      }
    };

    const cancelBubble = (e) => {
      setTimeout(() => {
        setIsZoomEnabled(false);
      }, 10);
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
      }}
      >
      <Stage
        width={device.size.x}
        height={device.size.y}
        style={{
        pointerEvents: "auto",
        transform: `scale(${stageScale})`,
        transition: "ease-in-out",
        // backgroundColor: device.color,
        }}
        ref={ref}
        onMouseDown={handleStageMouseDown}
      >
        <Layer>
          {/* <Rect
          // fillPatternImage={patternImage}
          // fillPatternScale={getScaleFactors()}
          // fill={device.color}
          // fillPriority={device.style == "image" ? "pattern" : "color"}
          // width={device.style == "image" ? getImageSize().x : device.size.x}
          // height={device.style == "image" ? getImageSize().y : device.size.y}
          // x={device.style == "image" ? (device.size.x - getImageSize().x) / 2 : 0}
          // y={device.style == "image" ? (device.size.y - getImageSize().y) / 2 : 0}
          // fillPatternRepeat="no-repeat"
          /> */}
          <Rect
  width={
    device.style === "image"
      ? getImageSize().x
      : device.size.x
  }
  height={
    device.style === "image"
      ? getImageSize().y
      : device.size.y
  }
  x={
    device.style === "image"
      ? (device.size.x - getImageSize().x) / 2
      : 0
  }
  y={
    device.style === "image"
      ? (device.size.y - getImageSize().y) / 2
      : 0
  }

  // Solid fill
  fill={device.style === "solid" ? device.color : undefined}

  // Linear gradient
  fillLinearGradientColorStops={device.style === "linear" ? device.gradient : undefined}
  fillLinearGradientStartPoint={device.style === "linear" ? { x: 0, y: 0 } : undefined}
  fillLinearGradientEndPoint={device.style === "linear" ? { x: device.size.x, y: device.size.y } : undefined}

  // Radial gradient
  fillRadialGradientColorStops={device.style === "radial" ? device.gradient : undefined}
  fillRadialGradientStartPoint={device.style === "radial" ? { x: device.size.x / 2, y: device.size.y / 2 } : undefined}
  fillRadialGradientEndPoint={device.style === "radial" ? { x: device.size.x / 2, y: device.size.y / 2 } : undefined}
  fillRadialGradientStartRadius={device.style === "radial" ? 0 : undefined}
  fillRadialGradientEndRadius={device.style === "radial" ? Math.max(device.size.x, device.size.y) / 2 : undefined}

  // Image pattern
  fillPatternImage={device.style === "image" ? patternImage : undefined}
  fillPatternScale={device.style === "image" ? getScaleFactors() : undefined}
  fillPatternRepeat={device.style === "image" ? "no-repeat" : undefined}

  // Fill priority
  fillPriority={device.style === "image" ? "pattern" : "color"}
/>

          </Layer>
        <Layer
        style={{
          pointerEvents: "auto",
        }}
        onMouseUp={cancelBubble}
        >
        <Group
          draggable={isDraggable}
          onDragMove={handleDragMove}
          onMouseDown={handleMouseDown}
          ref={shapeRef}
          x={qrPos.x - (device.qr.custom.borderSize / 2 * stageScale)}
          y={qrPos.y - (device.qr.custom.borderSize / 2 * stageScale)}
          height={qrSize + (device.qr.custom.borderSize * stageScale)}
          width={qrSize + (device.qr.custom.borderSize * stageScale)}
        >
        <Rect
        id="QRImage"
        fill={device.qr.custom.borderColor}
        fillPatternRepeat={"no-repeat"}
        height={qrSize + (device.qr.custom.borderSize * stageScale)}
        width={qrSize + (device.qr.custom.borderSize * stageScale)}
        fillAfterStrokeEnabled={true}
        cornerRadius={[device.qr.custom.cornerRadius,device.qr.custom.cornerRadius,device.qr.custom.cornerRadius,device.qr.custom.cornerRadius]}
        />
        <Rect
        id="QRImage"
          x={(device.qr.custom.borderSize / 2 * stageScale)}
          y={(device.qr.custom.borderSize / 2 * stageScale)}
          fillPatternImage={qrImg}
          fillPatternRepeat={"no-repeat"}
          height={qrSize}
          width={qrSize}
          fillAfterStrokeEnabled={true}
        />
      </Group>
        <Transformer
          onTransformEnd={cancelBubble}
          borderStroke={"red"}
          borderStrokeWidth={2 / stageScale}
          enabledAnchors={[
          "top-left",
          "top-right",
          "bottom-left",
          "bottom-right",
          ]}
          keepRatio={true}
          anchorSize={7.5 / stageScale}
          anchorStroke={"red"}
          anchorStrokeWidth={1 / stageScale}
          anchorCornerRadius={7.5 / stageScale}
          rotateEnabled={false}
          flipEnabled={false}
          ref={transformerRef}
        />
        <Line
          stroke={"red"}
          strokeWidth={5}
          dash={[25, 15]}
          points={[
          device.size.x / 2,
          0,
          device.size.x / 2,
          device.size.y / 2,
          device.size.x / 2,
          device.size.y,
          ]}
          visible={isCenterX && isDragging}
        />
        <Line
          stroke={"red"}
          strokeWidth={5}
          dash={[25, 15]}
          points={[
          0,
          device.size.y / 2,
          device.size.x / 2,
          device.size.y / 2,
          device.size.x,
          device.size.y / 2,
          ]}
          visible={isCenterY & isDragging}
        />
        </Layer>
      </Stage>
      </div>
    );
  }
);

export default Wallpaper;
