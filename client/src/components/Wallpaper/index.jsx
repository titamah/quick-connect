import { Stage, Rect, Layer, Transformer, Line, Group } from "react-konva";
import React, { forwardRef, useEffect, useState, useRef, use } from "react";
import useWindowSize from "../../hooks/useWindowSize";
import Konva from "konva";

const Wallpaper = forwardRef(
  ({ device, panelSize, isOpen, locked, setIsZoomEnabled }, ref) => {
    const windowSize = useWindowSize();
    const [patternImage, setPatternImage] = useState(null);
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const [grain, setGrain] = useState(null);

    useEffect(() => {
      const img = new Image();
      img.src = "/grain.jpeg";
      img.onload = () => {
        console.log(img);
        setGrain(img);
      ref.current.batchDraw();
      };
    },[]);
     

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
      x: device.size.x / 4,
      y: device.size.y / 1.75,
    });

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
        const blob = new Blob([svgData], {
          type: "image/svg+xml;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const qrImage = new Image();
        qrImage.src = url;
        qrImage.onload = () => {
          console.log(qrImage);
          setQRImg(qrImage);
        };
      }, 1);

      setQRPos({
        x: device.size.x / 4,
        y: device.size.y / 1.75,
      });
      setQRSize(Math.min(device.size.x, device.size.y) / 2);
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
          setIsImageLoaded(true);
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

      const rawX = Math.max(0, Math.min(shape.x(), stageWidth - shapeWidth));
      const rawY = Math.max(0, Math.min(shape.y(), stageHeight - shapeHeight));
      let targetX, targetY;

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
        x: targetX + (device.qr.custom.borderSize / 2) * stageScale,
        y: targetY + (device.qr.custom.borderSize / 2) * stageScale,
      });
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

        const newX = shape.x() + (originalWidth - newWidth) / 2;
        const newY = shape.y() + (originalHeight - newHeight) / 2;

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
        setTimeout(() => {
          setIsDragging(false);
          transformerRef.current.nodes([shapeRef.current]);
          transformerRef.current.getLayer().batchDraw();
        }, 5);
      });
      shapeRef.current.on("dragstart", (e) => {
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
    }, []);

    const handleStageMouseDown = (e) => {
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
        unselectable="on"
        style={{
          width: `${device.size.x * stageScale - 2}px`,
          height: `${device.size.y * stageScale}px`,
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
          }}
          ref={ref}
          onMouseDown={handleStageMouseDown}
        >
          <Layer>
            <Rect
              width={
                device.style === "image" ? getImageSize().x : device.size.x
              }
              height={
                device.style === "image" ? getImageSize().y : device.size.y
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
              fill={device.style === "solid" ? device.color : undefined}
              fillLinearGradientColorStops={
                device.style === "gradient" && device.gradient.type == "linear"
                  ? device.gradient.stops
                  : undefined
              }
              fillLinearGradientStartPoint={
                device.style === "gradient" && device.gradient.type == "linear"
                  ? {
                      x: device.gradient.angle.start.x,
                      y: device.gradient.angle.start.y,
                    }
                  : undefined
              }
              fillLinearGradientEndPoint={
                device.style === "gradient" && device.gradient.type == "linear"
                  ? {
                      x: device.gradient.angle.end.x,
                      y: device.gradient.angle.end.y,
                    }
                  : undefined
              }
              fillRadialGradientColorStops={
                device.style === "gradient" && device.gradient.type === "radial"
                  ? device.gradient.stops
                  : undefined
              }
              fillRadialGradientStartPoint={
                device.style === "gradient" && device.gradient.type === "radial"
                  ? {
                      x: device.size.x * device.gradient.pos.x,
                      y: device.size.y * device.gradient.pos.y,
                    }
                  : undefined
              }
              fillRadialGradientEndPoint={
                device.style === "gradient" && device.gradient.type === "radial"
                  ? {
                      x: device.size.x * device.gradient.pos.x,
                      y: device.size.y * device.gradient.pos.y,
                    }
                  : undefined
              }
              fillRadialGradientStartRadius={
                device.style === "gradient" && device.gradient.type === "radial"
                  ? 0
                  : undefined
              }
              fillRadialGradientEndRadius={
                device.style === "gradient" && device.gradient.type === "radial"
                  ? Math.max(device.size.x, device.size.y) / 1.5
                  : undefined
              }
              fillPatternImage={
                device.style === "image" ? patternImage : undefined
              }
              fillPatternScale={
                device.style === "image" ? getScaleFactors() : undefined
              }
              fillPatternRepeat={
                device.style === "image" ? "no-repeat" : undefined
              }
              fillPriority={device.style === "image" ? "pattern" : "color"}
            />
            <Rect
              width={device.size.x}
              height={device.size.y}
              x={0}
              y={0}
              fillPatternImage={grain}
              fillPatternRepeat="repeat"
              fillPriority="pattern"
              globalCompositeOperation= 'luminosity'
              opacity={device.grain ? .065 : 0}
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
              x={qrPos.x - (device.qr.custom.borderSize / 2) * stageScale}
              y={qrPos.y - (device.qr.custom.borderSize / 2) * stageScale}
              height={qrSize + device.qr.custom.borderSize * stageScale}
              width={qrSize + device.qr.custom.borderSize * stageScale}
            >
              <Rect
                id="QRImage"
                fill={device.qr.custom.borderColor}
                fillPatternRepeat={"no-repeat"}
                height={qrSize + device.qr.custom.borderSize * stageScale}
                width={qrSize + device.qr.custom.borderSize * stageScale}
                fillAfterStrokeEnabled={true}
                cornerRadius={[
                  device.qr.custom.cornerRadius,
                  device.qr.custom.cornerRadius,
                  device.qr.custom.cornerRadius,
                  device.qr.custom.cornerRadius,
                ]}
              />
              <Rect
                id="QRImage"
                x={(device.qr.custom.borderSize / 2) * stageScale}
                y={(device.qr.custom.borderSize / 2) * stageScale}
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
