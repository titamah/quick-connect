// components/Wallpaper/OptimizedWallpaper.jsx
import { Stage, Rect, Layer, Transformer, Line, Group } from "react-konva";
import React, { forwardRef, useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useDevice } from "../../contexts/DeviceContext";
import { useImageLoader } from "../../hooks/useImageLoader";
import { useStageCalculations } from "../../hooks/useStageCalculations";

// Constants extracted from magic numbers
const STAGE_PADDING = 0.85;
const HEADER_HEIGHT = 52;
const QR_SIZE_RATIO = 0.5;
const SNAP_TOLERANCE = 25;
const SCALE_ANIMATION_FACTOR = 0.985;

const OptimizedWallpaper = forwardRef(
  ({ panelSize, isOpen, locked, setIsZoomEnabled }, ref) => {
    const { deviceInfo, background, qrConfig } = useDevice();
    
    // Memoized calculations to prevent unnecessary recalculations
    const stageScale = useStageCalculations(deviceInfo.size, panelSize, isOpen);
    const { patternImage, imageSize, isImageLoaded } = useImageLoader(background, deviceInfo.size);
    
    // QR Code state
    const [qrImg, setQRImg] = useState(null);
    const [qrPos, setQRPos] = useState(() => ({
      x: deviceInfo.size.x / 4,
      y: deviceInfo.size.y / 1.75,
    }));
    
    const qrSize = useMemo(() => 
      Math.min(deviceInfo.size.x, deviceInfo.size.y) * QR_SIZE_RATIO,
      [deviceInfo.size.x, deviceInfo.size.y]
    );

    // Refs
    const transformerRef = useRef(null);
    const shapeRef = useRef(null);
    const [isDraggable, setIsDraggable] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isCenterX, setIsCenterX] = useState(true);
    const [isCenterY, setIsCenterY] = useState(false);

    // Memoized style calculations
    const backgroundProps = useMemo(() => {
      const baseProps = {
        width: background.style === "image" ? imageSize.scaledWidth : deviceInfo.size.x,
        height: background.style === "image" ? imageSize.scaledHeight : deviceInfo.size.y,
        x: background.style === "image" ? imageSize.offsetX : 0,
        y: background.style === "image" ? imageSize.offsetY : 0,
      };

      switch (background.style) {
        case "solid":
          return { ...baseProps, fill: background.color };
        
        case "gradient":
          if (background.gradient.type === "linear") {
            return {
              ...baseProps,
              fillLinearGradientColorStops: background.gradient.stops,
              fillLinearGradientStartPoint: background.gradient.angle.start,
              fillLinearGradientEndPoint: background.gradient.angle.end,
            };
          } else {
            return {
              ...baseProps,
              fillRadialGradientColorStops: background.gradient.stops,
              fillRadialGradientStartPoint: {
                x: deviceInfo.size.x * background.gradient.pos.x,
                y: deviceInfo.size.y * background.gradient.pos.y,
              },
              fillRadialGradientEndPoint: {
                x: deviceInfo.size.x * background.gradient.pos.x,
                y: deviceInfo.size.y * background.gradient.pos.y,
              },
              fillRadialGradientStartRadius: 0,
              fillRadialGradientEndRadius: Math.max(deviceInfo.size.x, deviceInfo.size.y) / 1.5,
            };
          }
        
        case "image":
          return {
            ...baseProps,
            fillPatternImage: patternImage,
            fillPatternScale: imageSize.scaleFactors,
            fillPatternRepeat: "no-repeat",
            fillPriority: "pattern",
          };
        
        default:
          return baseProps;
      }
    }, [background, deviceInfo.size, imageSize, patternImage]);

    // Optimized drag handler with useCallback
    const handleDragMove = useCallback((e) => {
      const shape = e.target;
      const layer = shape.getLayer();
      const stage = layer.getStage();
      const stageWidth = stage.width();
      const stageHeight = stage.height();
      const shapeWidth = shape.width() * shape.scaleX();
      const shapeHeight = shape.height() * shape.scaleY();
      const middleX = (stageWidth - shapeWidth) / 2;
      const middleY = (stageHeight - shapeHeight) / 2;

      const rawX = Math.max(0, Math.min(shape.x(), stageWidth - shapeWidth));
      const rawY = Math.max(0, Math.min(shape.y(), stageHeight - shapeHeight));
      
      let targetX, targetY;

      if (Math.abs(rawX - middleX) < SNAP_TOLERANCE) {
        setIsCenterX(true);
        targetX = middleX;
      } else {
        setIsCenterX(false);
        targetX = rawX;
      }

      if (Math.abs(rawY - middleY) < SNAP_TOLERANCE) {
        setIsCenterY(true);
        targetY = middleY;
      } else {
        setIsCenterY(false);
        targetY = rawY;
      }
      
      shape.x(targetX);
      shape.y(targetY);
      
      setQRPos({
        x: targetX + (qrConfig.custom.borderSize / 2) * stageScale,
        y: targetY + (qrConfig.custom.borderSize / 2) * stageScale,
      });
    }, [qrConfig.custom.borderSize, stageScale]);

    // QR Code effect optimization
    useEffect(() => {
      const timeoutId = setTimeout(() => {
        const svg = document.getElementById("QRCode")?.querySelector("svg");
        if (!svg) return;
        
        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        
        const qrImage = new Image();
        qrImage.onload = () => {
          setQRImg(qrImage);
          URL.revokeObjectURL(url); // Cleanup
        };
        qrImage.src = url;
      }, 1);

      return () => clearTimeout(timeoutId);
    }, [qrConfig]);

    // Update draggable state
    useEffect(() => {
      setIsDraggable(locked);
    }, [locked]);

    // Update QR position when device size changes
    useEffect(() => {
      setQRPos({
        x: deviceInfo.size.x / 4,
        y: deviceInfo.size.y / 1.75,
      });
    }, [deviceInfo.size]);

    return (
      <div
        id="preview"
        style={{
          width: `${deviceInfo.size.x * stageScale - 2}px`,
          height: `${deviceInfo.size.y * stageScale}px`,
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Stage
          width={deviceInfo.size.x}
          height={deviceInfo.size.y}
          style={{
            pointerEvents: "auto",
            transform: `scale(${stageScale})`,
            transition: "ease-in-out",
          }}
          ref={ref}
          onMouseDown={(e) => {
            if (e.target === e.target.getStage()) {
              transformerRef.current?.nodes([]);
              transformerRef.current?.getLayer()?.batchDraw();
            }
          }}
        >
          {/* Background Layer */}
          <Layer>
            <Rect {...backgroundProps} />
            
            {/* Grain overlay */}
            {background.grain && (
              <Rect
                width={deviceInfo.size.x}
                height={deviceInfo.size.y}
                x={0}
                y={0}
                fillPatternImage="/grain.jpeg" // You'll need to load this properly
                fillPatternRepeat="repeat"
                fillPriority="pattern"
                globalCompositeOperation="luminosity"
                opacity={0.065}
              />
            )}
          </Layer>

          {/* QR Layer */}
          <Layer>
            <Group
              draggable={isDraggable}
              onDragMove={handleDragMove}
              ref={shapeRef}
              x={qrPos.x - (qrConfig.custom.borderSize / 2) * stageScale}
              y={qrPos.y - (qrConfig.custom.borderSize / 2) * stageScale}
              height={qrSize + qrConfig.custom.borderSize * stageScale}
              width={qrSize + qrConfig.custom.borderSize * stageScale}
            >
              {/* QR Border */}
              <Rect
                fill={qrConfig.custom.borderColor}
                height={qrSize + qrConfig.custom.borderSize * stageScale}
                width={qrSize + qrConfig.custom.borderSize * stageScale}
                cornerRadius={qrConfig.custom.cornerRadius}
              />
              
              {/* QR Code */}
              <Rect
                x={(qrConfig.custom.borderSize / 2) * stageScale}
                y={(qrConfig.custom.borderSize / 2) * stageScale}
                fillPatternImage={qrImg}
                fillPatternRepeat="no-repeat"
                height={qrSize}
                width={qrSize}
              />
            </Group>

            {/* Transformer */}
            <Transformer
              borderStroke="red"
              borderStrokeWidth={2 / stageScale}
              enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
              keepRatio={true}
              anchorSize={7.5 / stageScale}
              anchorStroke="red"
              anchorStrokeWidth={1 / stageScale}
              anchorCornerRadius={7.5 / stageScale}
              rotateEnabled={false}
              flipEnabled={false}
              ref={transformerRef}
            />

            {/* Snap lines */}
            {isCenterX && isDragging && (
              <Line
                stroke="red"
                strokeWidth={5}
                dash={[25, 15]}
                points={[deviceInfo.size.x / 2, 0, deviceInfo.size.x / 2, deviceInfo.size.y]}
              />
            )}
            
            {isCenterY && isDragging && (
              <Line
                stroke="red"
                strokeWidth={5}
                dash={[25, 15]}
                points={[0, deviceInfo.size.y / 2, deviceInfo.size.x, deviceInfo.size.y / 2]}
              />
            )}
          </Layer>
        </Stage>
      </div>
    );
  }
);

export default OptimizedWallpaper;