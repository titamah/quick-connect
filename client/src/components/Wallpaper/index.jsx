import {
  Stage,
  Rect,
  Layer,
  Transformer,
  Line,
  Group,
  Text,
} from "react-konva";
import QRCode from "antd/es/qrcode/index.js";
import React, {
  forwardRef,
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useDevice } from "../../contexts/DeviceContext";
import { usePreview } from "../../contexts/PreviewContext";
import { useImageLoader } from "../../hooks/useImageLoader";
import { useStageCalculations } from "../../hooks/useStageCalculations";
import { useImageCache } from "../../hooks/useImageCache";

const PERFORMANCE_MONITORING = process.env.NODE_ENV === "development";

const SNAP_TOLERANCE = 25;

const Wallpaper = forwardRef(
  ({ panelSize, isOpen, locked, setIsZoomEnabled, backgroundLayerRef }, ref) => {
    const {
      deviceInfo,
      background,
      qrConfig,
      updateQRConfig,
      updateQRPositionPercentages,
      takeSnapshot,
    } = useDevice();
    const { isExporting, isPreviewVisible, isHovered } = usePreview();

    const showPhoneUI = isPreviewVisible || isHovered;

    const stageScale = useStageCalculations(deviceInfo.size, panelSize, isOpen);
    const { patternImage, imageSize } = useImageLoader(
      background,
      deviceInfo.size
    );
    const { loadImage } = useImageCache();

    const [qrImg, setQRImg] = useState(null);

    const [cachedSVGPaths, setCachedSVGPaths] = useState(null);
    const [lastURL, setLastURL] = useState(qrConfig.url);
    const [qrPos, setQRPos] = useState(() => {
      return {
        x: deviceInfo.size.x * qrConfig.positionPercentages.x,
        y: deviceInfo.size.y * qrConfig.positionPercentages.y,
      };
    });

    const [grainImage, setGrainImage] = useState(null);
    const grainLoadedRef = useRef(false);

    const [transparentImage, setTransparentImage] = useState(null);
    const transparentLoadedRef = useRef(false);

    const qrSize = useMemo(() => {
      const minDimension = Math.min(deviceInfo.size.x, deviceInfo.size.y);
      const sizePercentage = Math.max(10, Math.min(100, qrConfig.sizePercentage || 50));
      return minDimension * (sizePercentage / 100);
    }, [deviceInfo.size.x, deviceInfo.size.y, qrConfig.sizePercentage]);

    const primaryColor = qrConfig.custom?.primaryColor || "#000";
    const secondaryColor = qrConfig.custom?.secondaryColor || "#fff";

    const actualBorderSize = useMemo(
      () => qrSize * (qrConfig.custom.borderSizeRatio / 100),
      [qrSize, qrConfig.custom.borderSizeRatio]
    );

    const actualCornerRadius = useMemo(() => {
      const maxRadius = (qrSize + actualBorderSize) / 2;
      return maxRadius * (qrConfig.custom.cornerRadiusRatio / 100);
    }, [qrSize, actualBorderSize, qrConfig.custom.cornerRadiusRatio]);

    const qrRef = useRef(null);

    const extractSVGPaths = useCallback((svgElement) => {
      if (!svgElement) return null;

      try {
        const paths = svgElement.querySelectorAll("path");
        const pathData = [];

        paths.forEach((path, index) => {
          const fill = path.getAttribute("fill");
          pathData.push({
            id: `qr-path-${index}`,
            d: path.getAttribute("d"),
            fill: fill,
            originalFill: fill,
          });
          console.log(`📊 Path ${index}: fill="${fill}"`);
        });

        console.log("📊 Extracted SVG paths:", pathData.length);
        console.log(
          "🔍 Path details:",
          pathData.map((p) => ({
            id: p.id,
            fill: p.fill,
            dLength: p.d?.length,
          }))
        );
        return pathData;
      } catch (error) {
        console.error("Error extracting SVG paths:", error);
        return null;
      }
    }, []);

    const updateSVGColors = useCallback(
      (primaryColor, secondaryColor) => {
        const svg = qrRef.current?.querySelector("svg");
        if (!svg || !cachedSVGPaths) return;

        try {
          const paths = svg.querySelectorAll("path");
          console.log("🔍 Updating colors for", paths.length, "paths");

          paths.forEach((path, index) => {
            const originalFill = cachedSVGPaths[index]?.originalFill;
            console.log(`Path ${index}: originalFill="${originalFill}"`);

            if (index === 0) {
              path.setAttribute("fill", secondaryColor);
              console.log(
                `  → Set to secondary (background): ${secondaryColor}`
              );
            } else {
              path.setAttribute("fill", primaryColor);
              console.log(`  → Set to primary (QR pattern): ${primaryColor}`);
            }
          });

          console.log("🎨 Updated SVG colors:", {
            primaryColor,
            secondaryColor,
          });
        } catch (error) {
          console.error("Error updating SVG colors:", error);
        }
      },
      [cachedSVGPaths]
    );

    const transformerRef = useRef(null);
    const shapeRef = useRef(null);
    const [isDraggable, setIsDraggable] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isCenterX, setIsCenterX] = useState(true);
    const [isCenterY, setIsCenterY] = useState(false);

    // Replace the backgroundProps useMemo with this fixed version:

const backgroundProps = useMemo(() => {
  // For image mode, only use imageSize if we actually have an image loaded
  const useImageSize = background.style === "image" && background.bg && patternImage;
  
  const baseProps = {
    width: useImageSize ? imageSize.scaledWidth : deviceInfo.size.x,
    height: useImageSize ? imageSize.scaledHeight : deviceInfo.size.y,
    x: useImageSize ? imageSize.offsetX : 0,
    y: useImageSize ? imageSize.offsetY : 0,
  };

  switch (background.style) {
    case "solid":
      return { ...baseProps, fill: background.color };

    case "gradient":
      if (background.gradient.type === "linear") {
        const angleRad = ((background.gradient.angle - 90) * Math.PI) / 180;
        const dx = Math.cos(angleRad);
        const dy = Math.sin(angleRad);

        const cx = deviceInfo.size.x / 2;
        const cy = deviceInfo.size.y / 2;
        const gradientLength =
          (Math.abs(dx) * deviceInfo.size.x +
            Math.abs(dy) * deviceInfo.size.y) /
          2;

        return {
          ...baseProps,
          fillLinearGradientColorStops: background.gradient.stops,
          fillLinearGradientStartPoint: {
            x: cx - dx * gradientLength,
            y: cy - dy * gradientLength,
          },
          fillLinearGradientEndPoint: {
            x: cx + dx * gradientLength,
            y: cy + dy * gradientLength,
          },
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
          fillRadialGradientEndRadius:
            Math.max(deviceInfo.size.x, deviceInfo.size.y) / 1.5,
        };
      }

    case "image":
      // If we have an actual uploaded/generated image, use it with proper scaling
      if (background.bg && patternImage) {
        return {
          ...baseProps,
          fillPatternImage: patternImage,
          fillPatternScale: imageSize.scaleFactors,
          fillPatternRepeat: "no-repeat",
          fillPriority: "pattern",
        };
      }
      // If no actual image but we have transparent pattern and not exporting, use it
      else if (transparentImage && !isExporting) {
        return {
          ...baseProps,
          fillPatternImage: transparentImage,
          fillPatternRepeat: "repeat",
          fillPriority: "pattern",
        };
      }
      // Fallback for image mode when no pattern is available yet
      else {
        return {
          ...baseProps,
          fill: "#f0f0f0", // Light gray placeholder
        };
      }

    default:
      return baseProps;
  }
}, [background, deviceInfo.size, imageSize, patternImage, isExporting, transparentImage]);

    const handleDragMove = useCallback(
      (e) => {
        const group = e.target;
        const layer = group.getLayer();
        const stage = layer.getStage();
        const stageWidth = stage.width();
        const stageHeight = stage.height();

        const qrHalfSize = qrSize / 2;
        const minX = qrHalfSize;
        const maxX = stageWidth - qrHalfSize;
        const minY = qrHalfSize;
        const maxY = stageHeight - qrHalfSize;

        const rawX = Math.max(minX, Math.min(maxX, group.x()));
        const rawY = Math.max(minY, Math.min(maxY, group.y()));

        let targetX, targetY;

        const centerSnapX = stageWidth / 2;
        const centerSnapY = stageHeight / 2;

        if (Math.abs(rawX - centerSnapX) < SNAP_TOLERANCE) {
          setIsCenterX(true);
          targetX = centerSnapX;
        } else {
          setIsCenterX(false);
          targetX = rawX;
        }

        if (Math.abs(rawY - centerSnapY) < SNAP_TOLERANCE) {
          setIsCenterY(true);
          targetY = centerSnapY;
        } else {
          setIsCenterY(false);
          targetY = rawY;
        }

        group.x(targetX);
        group.y(targetY);

        const newQRPos = {
          x: targetX,
          y: targetY,
        };
        setQRPos(newQRPos);

        const newPercentages = {
          x: newQRPos.x / deviceInfo.size.x,
          y: newQRPos.y / deviceInfo.size.y,
        };
        updateQRPositionPercentages(newPercentages);
      },
      [qrSize, SNAP_TOLERANCE, deviceInfo.size, updateQRPositionPercentages]
    );

    useEffect(() => {
      if (PERFORMANCE_MONITORING) {
        console.log("🔄 QR URL Generation Effect triggered by:", {
          url: qrConfig.url,
        });
      }

      const generateQRCode = () => {
        const startTime =
          PERFORMANCE_MONITORING && window.performance
            ? window.performance.now()
            : 0;

        const svg = qrRef.current?.querySelector("svg");
        if (!svg) {
          console.log("QR SVG not found");
          return;
        }

        if (qrConfig.url !== lastURL || !cachedSVGPaths) {
          console.log("🔄 URL changed or initial load, extracting SVG paths");
          const newPaths = extractSVGPaths(svg);
          setCachedSVGPaths(newPaths);
          setLastURL(qrConfig.url);

          try {
            const svgData = new XMLSerializer().serializeToString(svg);
            const dataUrl =
              "data:image/svg+xml;base64," +
              btoa(unescape(encodeURIComponent(svgData)));

            const qrImage = new Image();
            qrImage.onload = () => {
              if (PERFORMANCE_MONITORING && window.performance) {
                const endTime = window.performance.now();
                console.log(
                  `✅ QR image loaded successfully in ${(
                    endTime - startTime
                  ).toFixed(2)}ms`
                );
              }
              setQRImg(qrImage);
            };
            qrImage.onerror = (error) => {
              console.error("Failed to load QR code image:", error);
            };
            qrImage.src = dataUrl;
          } catch (error) {
            console.error("Error generating QR code:", error);
          }
        }
      };

      const timeoutId = setTimeout(generateQRCode, 100);
      return () => clearTimeout(timeoutId);
    }, [qrConfig.url, lastURL, extractSVGPaths]);

    useEffect(() => {
      if (!cachedSVGPaths) return;

      console.log("🎨 Color update effect triggered");
      updateSVGColors(primaryColor, secondaryColor);

      const svg = qrRef.current?.querySelector("svg");
      if (svg) {
        try {
          const svgData = new XMLSerializer().serializeToString(svg);
          const dataUrl =
            "data:image/svg+xml;base64," +
            btoa(unescape(encodeURIComponent(svgData)));

          const qrImage = new Image();
          qrImage.onload = () => {
            setQRImg(qrImage);
          };
          qrImage.onerror = (error) => {
            console.error("Failed to load QR code image:", error);
          };
          qrImage.src = dataUrl;
        } catch (error) {
          console.error("Error updating QR code image:", error);
        }
      }
    }, [primaryColor, secondaryColor, cachedSVGPaths, updateSVGColors]);

    useEffect(() => {
      const minDimension = Math.min(deviceInfo.size.x, deviceInfo.size.y);
      const sizePercentage = Math.max(10, Math.min(100, qrConfig.sizePercentage || 50));
      const newQRSize = minDimension * (sizePercentage / 100);
      const maxBorderSize = newQRSize * 0.1;

      if (qrConfig.custom.borderSize > maxBorderSize) {
        updateQRConfig({
          custom: {
            ...qrConfig.custom,
            borderSize: Math.floor(maxBorderSize),
            cornerRadius: Math.min(
              qrConfig.custom.cornerRadius,
              maxBorderSize * 0.5
            ),
          },
        });
      }
    }, [deviceInfo.size.x, deviceInfo.size.y, qrConfig.sizePercentage]);

    useEffect(() => {
      if (!grainLoadedRef.current) {
        grainLoadedRef.current = true;
    
        const controller = new AbortController();
    
        loadImage("/grain.jpeg", { 
          crossOrigin: "anonymous",
          signal: controller.signal 
        })
          .then((img) => {
            console.log("Grain image loaded successfully");
            setGrainImage(img);
            if (ref.current) {
              ref.current.batchDraw();
            }
          })
          .catch((error) => {
            if (error.name !== 'AbortError') {
              console.error("Failed to load grain texture from /grain.jpeg", error);
            }
            setGrainImage(null);
          });
      }
    }, [loadImage]);

    useEffect(() => {
      if (!transparentLoadedRef.current) {
        transparentLoadedRef.current = true;
    
        const controller = new AbortController();
    
        loadImage("/transparent.png", { 
          crossOrigin: "anonymous",
          signal: controller.signal 
        })
          .then((img) => {
            console.log("Transparent image loaded successfully");
            setTransparentImage(img);
            if (ref.current) {
              ref.current.batchDraw();
            }
          })
          .catch((error) => {
            if (error.name !== 'AbortError') {
              console.error("Failed to load transparent texture from /transparent.png", error);
            }
            setTransparentImage(null);
          });
      }
    }, [loadImage]);

    useEffect(() => {
      setIsDraggable(locked);
    }, [locked]);

    useEffect(() => {
      setQRPos({
        x: deviceInfo.size.x * qrConfig.positionPercentages.x,
        y: deviceInfo.size.y * qrConfig.positionPercentages.y,
      });
    }, [deviceInfo.size, qrConfig.positionPercentages]);

    useEffect(() => {
      if (!shapeRef.current || !transformerRef.current) return;

      const qrGroup = shapeRef.current;
      const transformer = transformerRef.current;

      const handleQRSelect = (e) => {
        setTimeout(() => {
          setIsDragging(false);
          transformer.nodes([qrGroup]);

          transformer.getLayer().batchDraw();
        }, 5);
      };

      const handleDragStart = (e) => {
        takeSnapshot("Drag start");
        setTimeout(() => {
          setIsDragging(true);
          transformer.nodes([]);

          transformer.getLayer().batchDraw();
        }, 5);
      };

      const handleTransformEnd = (e) => {
        setTimeout(() => {
          transformer.nodes([qrGroup]);

          const group = qrGroup;
          const newQRPos = {
            x: group.x(),
            y: group.y(),
          };

          const newPercentages = {
            x: newQRPos.x / deviceInfo.size.x,
            y: newQRPos.y / deviceInfo.size.y,
          };
          updateQRPositionPercentages(newPercentages);

          const newRotation = group.rotation();
          updateQRConfig({ rotation: newRotation });

          transformer.getLayer().batchDraw();
        }, 5);
      };

      qrGroup.on("click dragend", handleQRSelect);
      qrGroup.on("dragstart", handleDragStart);
      qrGroup.on("tap", handleQRSelect); // Add tap event for mobile
      transformer.on("transformend", handleTransformEnd);

      const handleOutsideClick = (e) => {
        if (transformer.nodes().length > 0) {
          transformer.nodes([]);
          setIsZoomEnabled(false);
          transformer.getLayer().batchDraw();
        }
      };

      document
        .getElementById("Canvas")
        ?.addEventListener("mouseup", handleOutsideClick);
      
      // Add touch event handler for mobile
      document
        .getElementById("Canvas")
        ?.addEventListener("touchend", handleOutsideClick);

              return () => {
          qrGroup.off("click dragend", handleQRSelect);
          qrGroup.off("dragstart", handleDragStart);
          qrGroup.off("tap", handleQRSelect);
          transformer.off("transformend", handleTransformEnd);
          document
            .getElementById("Canvas")
            ?.removeEventListener("mouseup", handleOutsideClick);
          document
            .getElementById("Canvas")
            ?.removeEventListener("touchend", handleOutsideClick);
        };
    }, [qrSize, deviceInfo.size, updateQRPositionPercentages]);

    const phoneUIRef = useRef(null);

    useEffect(() => {
      if (!phoneUIRef.current) return;

      // Only animate if the Layer is mounted
      const layer = phoneUIRef.current;
      const targetOpacity = showPhoneUI ? (isHovered || isDragging ? 0.5 : 1) : 0;

      // If already at target, skip
      if (layer.opacity() === targetOpacity) return;

      const tween = new window.Konva.Tween({
        node: layer,
        duration: .1,
        opacity: targetOpacity,
        easing: window.Konva.Easings.EaseInOut,
      });

      tween.play();

      // Clean up tween on unmount or change
      return () => {
        tween.destroy();
      };
    }, [showPhoneUI, isHovered, isDragging]);


    
    return (
      <>
        <div
          style={{
            position: "absolute",
            left: "-9999px",
            visibility: "hidden",
          }}
        >
          <QRCode
            ref={qrRef}
            value={qrConfig.url || "www.qrki.xyz"}
            type="svg"
            bordered={false}
            size={qrSize}
            color={primaryColor}
            bgColor={secondaryColor}
          />
        </div>
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
            perfectDrawEnabled={false}
            onMouseDown={(e) => {
              if (e.target === e.target.getStage()) {
                transformerRef.current?.nodes([]);
              }
            }}
            onMouseUp={(e) => {
              if (transformerRef.current?.nodes().length > 0) {
                transformerRef.current.nodes([]);
                setIsZoomEnabled(false);
              } else {
                if (!locked) {
                  setIsZoomEnabled(false);
                } else {
                  setIsZoomEnabled(true);
                }
              }

              transformerRef.current?.getLayer()?.batchDraw();
            }}
            onTouchStart={(e) => {
              if (e.target === e.target.getStage()) {
                transformerRef.current?.nodes([]);
              }
            }}
            onTouchEnd={(e) => {
              if (transformerRef.current?.nodes().length > 0) {
                transformerRef.current.nodes([]);
                setIsZoomEnabled(false);
              } else {
                if (!locked) {
                  setIsZoomEnabled(false);
                } else {
                  setIsZoomEnabled(true);
                }
              }

              transformerRef.current?.getLayer()?.batchDraw();
            }}
          >
            <Layer className="background-layer" ref={backgroundLayerRef}>
              <Rect {...backgroundProps} listening={false} />

              {background.grain && grainImage && (
                <Rect
                  width={deviceInfo.size.x}
                  height={deviceInfo.size.y}
                  x={0}
                  y={0}
                  fillPatternImage={grainImage}
                  fillPatternRepeat="repeat"
                  fillPriority="pattern"
                  globalCompositeOperation="luminosity"
                  opacity={0.065}
                  listening={false}
                />
              )}
            </Layer>

            <Layer
              onMouseUp={() => {
                setTimeout(() => {
                  setIsZoomEnabled(false);
                }, 10);
              }}
              onTouchEnd={() => {
                setTimeout(() => {
                  setIsZoomEnabled(false);
                }, 10);
              }}
            >
              <Group
                draggable={isDraggable}
                onDragMove={handleDragMove}
                ref={shapeRef}
                x={qrPos.x}
                y={qrPos.y}
                rotation={qrConfig.rotation || 0}
                offsetX={qrSize / 2}
                offsetY={qrSize / 2}
                height={qrSize + actualBorderSize}
                width={qrSize + actualBorderSize}
                onMouseDown={(e) => {
                  e.cancelBubble = true;
                  if (transformerRef.current?.nodes().length == 0) {
                    setTimeout(() => {
                      setIsZoomEnabled(false);
                      if (transformerRef.current && shapeRef.current) {
                        transformerRef.current.nodes([shapeRef.current]);
                        transformerRef.current.getLayer().batchDraw();
                      }
                    }, 100);
                  }
                }}
                onTouchStart={(e) => {
                  e.cancelBubble = true;
                  console.log("📱 Touch start on QR code");
                  if (transformerRef.current?.nodes().length == 0) {
                    setTimeout(() => {
                      setIsZoomEnabled(false);
                      if (transformerRef.current && shapeRef.current) {
                        transformerRef.current.nodes([shapeRef.current]);
                        transformerRef.current.getLayer().batchDraw();
                      }
                    }, 100);
                  }
                }}
              >
                <Rect
                  fill={qrConfig.custom.borderColor}
                  x={-actualBorderSize / 2}
                  y={-actualBorderSize / 2}
                  height={qrSize + actualBorderSize}
                  width={qrSize + actualBorderSize}
                  cornerRadius={[
                    actualCornerRadius,
                    actualCornerRadius,
                    actualCornerRadius,
                    actualCornerRadius,
                  ]}
                />

                <Rect
                  x={0}
                  y={0}
                  fillPatternImage={qrImg}
                  fillPatternRepeat="no-repeat"
                  fillPatternScale={
                    qrImg
                      ? {
                          x: qrSize / qrImg.width,
                          y: qrSize / qrImg.height,
                        }
                      : { x: 1, y: 1 }
                  }
                  height={qrSize}
                  width={qrSize}
                />
              </Group>

              <Transformer
              centeredScaling={true}
                borderStroke="red"
                borderStrokeWidth={2 / stageScale}
                enabledAnchors={[
                  "top-left",
                  "top-right",
                  "bottom-left",
                  "bottom-right",
                ]}
                keepRatio={true}
                anchorSize={7.5 / stageScale}
                anchorStroke="red"
                anchorStrokeWidth={1 / stageScale}
                anchorCornerRadius={7.5 / stageScale}
                rotateEnabled={true}
                rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
                rotationSnapTolerance={5}
                flipEnabled={false}
                ref={transformerRef}
                onTransformEnd={() => {
                  setTimeout(() => {
                    setIsZoomEnabled(false);
                  }, 10);
                }}
              />

              {isCenterX && isDragging && (
                <Line
                  stroke="red"
                  strokeWidth={5}
                  dash={[25, 15]}
                  points={[
                    deviceInfo.size.x / 2,
                    0,
                    deviceInfo.size.x / 2,
                    deviceInfo.size.y,
                  ]}
                  listening={false}
                />
              )}

              {isCenterY && isDragging && (
                <Line
                  stroke="red"
                  strokeWidth={5}
                  dash={[25, 15]}
                  points={[
                    0,
                    deviceInfo.size.y / 2,
                    deviceInfo.size.x,
                    deviceInfo.size.y / 2,
                  ]}
                  listening={false}
                />
              )}
            </Layer>

            {!isExporting && (
              <Layer
              ref={phoneUIRef}
              listening={false}
              // opacity={showPhoneUI ? (isHovered || isDragging ? 0.5 : 1) : 0}
            >
              <Rect
                x={deviceInfo.size.x / 2 - deviceInfo.size.x * 0.15}
                y={deviceInfo.size.y * 0.01}
                width={deviceInfo.size.x * 0.3}
                height={deviceInfo.size.x * 0.065}
                fill="black"
                cornerRadius={deviceInfo.size.x * 0.15}
              />

              <Text
                x={deviceInfo.size.x * 0.125}
                y={deviceInfo.size.y * 0.0175}
                text="QRKI"
                fontSize={deviceInfo.size.x * 0.05}
                fontFamily="Rubik, -apple-system, BlinkMacSystemFont, sans-serif"
                fill="white"
                opacity={1}
              />

              <Group
                x={deviceInfo.size.x * 0.725}
                y={deviceInfo.size.y * 0.0175}
                listening={false}
              >
                <Rect
                  x={deviceInfo.size.x * 0.045}
                  y={deviceInfo.size.x * 0}
                  width={deviceInfo.size.x * 0.01}
                  height={deviceInfo.size.x * 0.0375}
                  fill="white"
                  opacity={0.5}
                />
                <Rect
                  x={deviceInfo.size.x * 0.03}
                  y={deviceInfo.size.x * 0.0095}
                  width={deviceInfo.size.x * 0.01}
                  height={deviceInfo.size.x * 0.028}
                  fill="white"
                  opacity={1}
                />
                <Rect
                  x={deviceInfo.size.x * 0.015}
                  y={deviceInfo.size.x * 0.0195}
                  width={deviceInfo.size.x * 0.01}
                  height={deviceInfo.size.x * 0.01825}
                  fill="white"
                  opacity={1}
                />
                <Rect
                  x={0}
                  y={deviceInfo.size.x * 0.0295}
                  width={deviceInfo.size.x * 0.01}
                  height={deviceInfo.size.x * 0.009}
                  fill="white"
                  opacity={1}
                />
              </Group>

              <Group
                x={deviceInfo.size.x * 0.805}
                y={deviceInfo.size.y * 0.0175}
                listening={false}
              >
                <Rect
                  x={0}
                  y={0}
                  width={deviceInfo.size.x * 0.075}
                  height={deviceInfo.size.x * 0.035}
                  stroke="white"
                  strokeWidth={deviceInfo.size.x * 0.002}
                  cornerRadius={deviceInfo.size.x * 0.01}
                />
                <Rect
                  x={deviceInfo.size.x * 0.0075}
                  y={deviceInfo.size.x * 0.005}
                  width={deviceInfo.size.x * 0.06}
                  height={deviceInfo.size.x * 0.025}
                  fill="white"
                  cornerRadius={deviceInfo.size.x * 0.005}
                />
                <Rect
                  x={deviceInfo.size.x * 0.0775}
                  y={deviceInfo.size.x * 0.012}
                  width={deviceInfo.size.x * 0.005}
                  height={deviceInfo.size.x * 0.01}
                  fill="white"
                  cornerRadius={deviceInfo.size.x * 0.00175}
                />
              </Group>

              <Text
                x={0}
                y={deviceInfo.size.y / 6}
                width={deviceInfo.size.x}
                text="4:44"
                stroke="white"
                strokeWidth={deviceInfo.size.x * 0.001}
                fontSize={deviceInfo.size.x * 0.3}
                fontWeight="bold"
                fontFamily="Rubik, -apple-system, BlinkMacSystemFont, sans-serif"
                fill="white"
                align="center"
                listening={false}
              />

              <Group x={0} y={deviceInfo.size.y * 0.75} listening={false}>
                <Rect
                  x={deviceInfo.size.x * 0.05}
                  y={0}
                  width={deviceInfo.size.x * 0.9}
                  height={deviceInfo.size.y * 0.095 + deviceInfo.size.x * 0.095}
                  fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                  fillLinearGradientEndPoint={{
                    x: deviceInfo.size.x,
                    y: deviceInfo.size.y * 0.175,
                  }}
                  fillLinearGradientColorStops={[
                    0,
                    "rgba(255,255,255,0.95)",
                    1,
                    "rgba(225, 225, 225, 0.85)",
                  ]}
                  shadowBlur={8}
                  shadowOpacity={0.1}
                  shadowOffset={{ x: 0, y: 4 }}
                  filters={[Konva.Filters.Blur]}
                  blurRadius={10}
                  cornerRadius={deviceInfo.size.x * 0.045}
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth={deviceInfo.size.x * 0.001}
                />
                <Rect
                  x={deviceInfo.size.x * 0.1}
                  y={deviceInfo.size.x * 0.05}
                  width={deviceInfo.size.y * 0.095}
                  height={deviceInfo.size.y * 0.095}
                  cornerRadius={deviceInfo.size.x * 0.025}
                  fill="#F0F66E"
                />
                <Text
                  x={deviceInfo.size.x * 0.125 + deviceInfo.size.y * 0.095}
                  y={deviceInfo.size.x * 0.06}
                  text="Quacki"
                  fontSize={deviceInfo.size.x * 0.075}
                  fontFamily="SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif"
                  listening={false}
                  fill="rgba(0, 0, 0, 0.75)"
                />
                <Text
                  x={deviceInfo.size.x * 0.125 + deviceInfo.size.y * 0.095}
                  y={deviceInfo.size.x * 0.15}
                  text="2 New Messages"
                  fontSize={deviceInfo.size.x * 0.045}
                  fontFamily="SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif"
                  fill="rgba(0, 0, 0, 0.75)"
                />
                <Text
                  x={deviceInfo.size.x * 0.775}
                  y={deviceInfo.size.x * 0.0575}
                  text="3:33 AM"
                  fontSize={deviceInfo.size.x * 0.035}
                  fontFamily="SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif"
                  fill="rgba(0, 0, 0, 0.75)"
                />
              </Group>
              <Rect
                x={deviceInfo.size.x * 0.25}
                y={deviceInfo.size.y * 0.95}
                width={deviceInfo.size.x * 0.5}
                height={deviceInfo.size.y * 0.0125}
                fill="white"
                opacity={0.5}
                cornerRadius={deviceInfo.size.x * 0.5}
              />
            </Layer>)}
          </Stage>
        </div>
      </>
    );
  }
);

export default Wallpaper;
