// components/Wallpaper/OptimizedWallpaper.jsx
import {
  Stage,
  Rect,
  Layer,
  Transformer,
  Line,
  Group,
  Text,
} from "react-konva";
import { QRCode } from "antd";
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
import { usePerformanceMonitor } from "../../hooks/usePerformanceMonitor";
import { useDebounce } from "../../hooks/useDebounce";
import { useImageCache } from "../../hooks/useImageCache";

// Performance monitoring
const PERFORMANCE_MONITORING = process.env.NODE_ENV === "development";

// Constants extracted from magic numbers
const STAGE_PADDING = 0.85;
const HEADER_HEIGHT = 52;
const QR_SIZE_RATIO = 0.5;
const SNAP_TOLERANCE = 25;
const SCALE_ANIMATION_FACTOR = 0.985;

const OptimizedWallpaper = forwardRef(
  ({ panelSize, isOpen, locked, setIsZoomEnabled }, ref) => {
    const {
      deviceInfo,
      background,
      qrConfig,
      updateQRConfig,
      updateQRPositionPercentages,
    } = useDevice();
    const { isPreviewVisible, isHovered } = usePreview();

    // Determine if phone UI should be shown
    const showPhoneUI = isPreviewVisible || isHovered;
    if (background.style === "image") {
      console.log("Background image URL:", background.imageUrl);
    }

    // Memoized calculations to prevent unnecessary recalculations
    const stageScale = useStageCalculations(deviceInfo.size, panelSize, isOpen);
    const { patternImage, imageSize, isImageLoaded } = useImageLoader(
      background,
      deviceInfo.size
    );
    const { loadImage } = useImageCache();

    // QR Code state
    const [qrImg, setQRImg] = useState(null);
    
    // Cache for SVG paths - only regenerate when URL changes
    const [cachedSVGPaths, setCachedSVGPaths] = useState(null);
    const [lastURL, setLastURL] = useState(qrConfig.url);
    const [qrPos, setQRPos] = useState(() => {
      // Calculate initial position from percentages
      const qrSize =
        Math.min(deviceInfo.size.x, deviceInfo.size.y) * QR_SIZE_RATIO;
      return {
        x: deviceInfo.size.x * qrConfig.positionPercentages.x,
        y: deviceInfo.size.y * qrConfig.positionPercentages.y,
      };
    });

    // Grain image state
    const [grainImage, setGrainImage] = useState(null);
    const grainLoadedRef = useRef(false);

    const qrSize = useMemo(
      () => Math.min(deviceInfo.size.x, deviceInfo.size.y) * QR_SIZE_RATIO,
      [deviceInfo.size.x, deviceInfo.size.y]
    );

    // Get current QR colors (with fallbacks) - DEBOUNCED to prevent cascade
    const primaryColor = qrConfig.custom?.primaryColor || "#000";
    const secondaryColor = qrConfig.custom?.secondaryColor || "#fff";

    // No longer need debounced colors - using real-time SVG updates

    // Performance monitoring - only track stable dependencies
    const performance = usePerformanceMonitor("OptimizedWallpaper", [
      background.style,
      qrConfig.url,
      // Removed debounced values to prevent infinite re-render loop
      // debouncedPrimaryColor,
      // debouncedSecondaryColor
    ]);

    // Calculate actual values from ratios
    const actualBorderSize = useMemo(
      () => qrSize * (qrConfig.custom.borderSizeRatio / 100),
      [qrSize, qrConfig.custom.borderSizeRatio]
    );

    const actualCornerRadius = useMemo(() => {
      // Calculate max possible radius (half of the total border rectangle)
      const maxRadius = (qrSize + actualBorderSize) / 2;
      // Apply the ratio to get the actual radius
      return maxRadius * (qrConfig.custom.cornerRadiusRatio / 100);
    }, [qrSize, actualBorderSize, qrConfig.custom.cornerRadiusRatio]);

    // Add ref for our hidden QR component
    const qrRef = useRef(null);

    // Function to extract and cache SVG paths
    const extractSVGPaths = useCallback((svgElement) => {
      if (!svgElement) return null;
      
      try {
        // Find all path elements in the SVG
        const paths = svgElement.querySelectorAll('path');
        const pathData = [];
        
        paths.forEach((path, index) => {
          const fill = path.getAttribute('fill');
          pathData.push({
            id: `qr-path-${index}`,
            d: path.getAttribute('d'),
            fill: fill,
            // Store original attributes for reference
            originalFill: fill
          });
          console.log(`📊 Path ${index}: fill="${fill}"`);
        });
        
        console.log('📊 Extracted SVG paths:', pathData.length);
        console.log('🔍 Path details:', pathData.map(p => ({ id: p.id, fill: p.fill, dLength: p.d?.length })));
        return pathData;
      } catch (error) {
        console.error('Error extracting SVG paths:', error);
        return null;
      }
    }, []);

    // Function to update SVG colors in real-time
    const updateSVGColors = useCallback((primaryColor, secondaryColor) => {
      const svg = qrRef.current?.querySelector("svg");
      if (!svg || !cachedSVGPaths) return;
      
      try {
        const paths = svg.querySelectorAll('path');
        console.log('🔍 Updating colors for', paths.length, 'paths');
        
        paths.forEach((path, index) => {
          const originalFill = cachedSVGPaths[index]?.originalFill;
          console.log(`Path ${index}: originalFill="${originalFill}"`);
          
          // Determine which color to use based on path index
          // Path 0 = background, Path 1 = QR pattern (foreground)
          if (index === 0) {
            // First path is background
            path.setAttribute('fill', secondaryColor);
            console.log(`  → Set to secondary (background): ${secondaryColor}`);
          } else {
            // Second path is QR pattern
            path.setAttribute('fill', primaryColor);
            console.log(`  → Set to primary (QR pattern): ${primaryColor}`);
          }
        });
        
        console.log('🎨 Updated SVG colors:', { primaryColor, secondaryColor });
      } catch (error) {
        console.error('Error updating SVG colors:', error);
      }
    }, [cachedSVGPaths]);

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
        width:
          background.style === "image"
            ? imageSize.scaledWidth
            : deviceInfo.size.x,
        height:
          background.style === "image"
            ? imageSize.scaledHeight
            : deviceInfo.size.y,
        x: background.style === "image" ? imageSize.offsetX : 0,
        y: background.style === "image" ? imageSize.offsetY : 0,
      };

      switch (background.style) {
        case "solid":
          return { ...baseProps, fill: background.color };

        case "gradient":
          if (background.gradient.type === "linear") {
            // Convert angle to start/end points for Konva
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

    const handleDragMove = useCallback(
      (e) => {
        const group = e.target;
        const layer = group.getLayer();
        const stage = layer.getStage();
        const stageWidth = stage.width();
        const stageHeight = stage.height();

        // Calculate boundary constraints (only QR code, border can extend beyond)
        const qrHalfSize = qrSize / 2;
        const minX = qrHalfSize;
        const maxX = stageWidth - qrHalfSize;
        const minY = qrHalfSize;
        const maxY = stageHeight - qrHalfSize;

        // Constrain position within boundaries
        const rawX = Math.max(minX, Math.min(maxX, group.x()));
        const rawY = Math.max(minY, Math.min(maxY, group.y()));

        let targetX, targetY;

        // For snapping to center
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

        // Update QR position (now directly the group position since it's centered)
        const newQRPos = {
          x: targetX,
          y: targetY,
        };
        setQRPos(newQRPos);

        // Calculate and store position percentages for device switching consistency
        const newPercentages = {
          x: newQRPos.x / deviceInfo.size.x,
          y: newQRPos.y / deviceInfo.size.y,
        };
        updateQRPositionPercentages(newPercentages);
      },
      [qrSize, SNAP_TOLERANCE, deviceInfo.size, updateQRPositionPercentages]
    );

    // Generate QR code only when URL changes (for new paths)
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

        // Regenerate when URL changes or on initial load
        if (qrConfig.url !== lastURL || !cachedSVGPaths) {
          console.log('🔄 URL changed or initial load, extracting SVG paths');
          const newPaths = extractSVGPaths(svg);
          setCachedSVGPaths(newPaths);
          setLastURL(qrConfig.url);
          
          // Generate new QR image after extracting paths
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
    }, [qrConfig.url, lastURL, extractSVGPaths]); // Only URL changes

    // Update colors in real-time (separate effect)
    useEffect(() => {
      if (!cachedSVGPaths) return; // Don't update if no paths cached
      
      console.log('🎨 Color update effect triggered');
      updateSVGColors(primaryColor, secondaryColor);
      
      // Update the displayed QR image with the modified SVG
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
    }, [primaryColor, secondaryColor, cachedSVGPaths, updateSVGColors]); // Only color changes

    // Auto-adjust border size when device size changes
    useEffect(() => {
      const newQRSize =
        Math.min(deviceInfo.size.x, deviceInfo.size.y) * QR_SIZE_RATIO;
      const maxBorderSize = newQRSize * 0.1; // 10% of QR size as max border

      // If current border size is too big for new device, scale it down
      if (qrConfig.custom.borderSize > maxBorderSize) {
        updateQRConfig({
          custom: {
            ...qrConfig.custom,
            borderSize: Math.floor(maxBorderSize),
            cornerRadius: Math.min(
              qrConfig.custom.cornerRadius,
              maxBorderSize * 0.5
            ), // Also adjust radius
          },
        });
      }
    }, [deviceInfo.size.x, deviceInfo.size.y]);

    // Load grain image once with proper caching
    useEffect(() => {
      // Only load if not already loaded
      if (!grainLoadedRef.current) {
        grainLoadedRef.current = true;

        loadImage("/grain.jpeg", { crossOrigin: "anonymous" })
          .then((img) => {
            console.log("Grain image loaded successfully");
            setGrainImage(img);
            // Force a re-render of the stage when grain loads
            if (ref.current) {
              ref.current.batchDraw();
            }
          })
          .catch((error) => {
            console.error(
              "Failed to load grain texture from /grain.jpeg",
              error
            );
            // Continue without grain - don't break the export
            setGrainImage(null);
          });
      }
    }, []); // Empty dependency array - only run once

    // Update draggable state
    useEffect(() => {
      setIsDraggable(locked);
    }, [locked]);

    // Update QR position when device size changes
    useEffect(() => {
      setQRPos({
        x: deviceInfo.size.x * qrConfig.positionPercentages.x,
        y: deviceInfo.size.y * qrConfig.positionPercentages.y,
      });
    }, [deviceInfo.size, qrConfig.positionPercentages]);

    // Set up QR interaction event handlers
    useEffect(() => {
      if (!shapeRef.current || !transformerRef.current) return;

      const qrGroup = shapeRef.current;
      const transformer = transformerRef.current;

      // Handle QR click/dragend to show transformer
      const handleQRSelect = (e) => {
        setTimeout(() => {
          setIsDragging(false);
          transformer.nodes([qrGroup]);
          // Batch draw after all changes
          transformer.getLayer().batchDraw();
        }, 5);
      };

      // Handle drag start to hide transformer and show snap lines
      const handleDragStart = (e) => {
        setTimeout(() => {
          setIsDragging(true);
          transformer.nodes([]);
          // Batch draw after all changes
          transformer.getLayer().batchDraw();
        }, 5);
      };

      // Handle transformer end to keep QR selected
      const handleTransformEnd = (e) => {
        setTimeout(() => {
          transformer.nodes([qrGroup]);

          // Calculate and store position percentages after transform
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

          // Update QR rotation from transformer
          const newRotation = group.rotation();
          updateQRConfig({ rotation: newRotation });

          // Batch draw after all changes
          transformer.getLayer().batchDraw();
        }, 5);
      };

      qrGroup.on("click dragend", handleQRSelect);
      qrGroup.on("dragstart", handleDragStart);
      transformer.on("transformend", handleTransformEnd);

      // Handle clicks outside QR/Canvas to deselect
      const handleOutsideClick = (e) => {
        if (transformer.nodes().length > 0) {
          transformer.nodes([]);
          setIsZoomEnabled(false);
          // Batch draw after all changes
          transformer.getLayer().batchDraw();
        }
      };

      document
        .getElementById("Canvas")
        ?.addEventListener("mouseup", handleOutsideClick);

      // Clean up event listeners
      return () => {
        qrGroup.off("click dragend", handleQRSelect);
        qrGroup.off("dragstart", handleDragStart);
        transformer.off("transformend", handleTransformEnd);
        document
          .getElementById("Canvas")
          ?.removeEventListener("mouseup", handleOutsideClick);
      };
    }, [qrSize, deviceInfo.size, updateQRPositionPercentages]);

    return (
      <>
        {/* Hidden QR Code generator - always rendered */}
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
              // Only deselect if clicking on the stage background, not on QR or transformer
              if (e.target === e.target.getStage()) {
                transformerRef.current?.nodes([]);
                // Batch draw will be called in onMouseUp
              }
            }}
            onMouseUp={(e) => {
              // Handle clicks outside QR to deselect transformer
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
              // Single batch draw for all mouse up operations
              transformerRef.current?.getLayer()?.batchDraw();
            }}
          >
            {/* Background Layer */}
            <Layer>
              <Rect {...backgroundProps} listening={false} />

              {/* Grain overlay */}
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

            {/* QR Layer */}
            <Layer
              onMouseUp={() => {
                setTimeout(() => {
                  setIsZoomEnabled(false);
                }, 10);
              }}
            >
              <Group
                draggable={isDraggable}
                onDragMove={handleDragMove}
                ref={shapeRef}
                x={qrPos.x} // Position at center of QR
                y={qrPos.y} // Position at center of QR
                rotation={qrConfig.rotation || 0}
                offsetX={qrSize / 2} // Center rotation point (QR center, not border center)
                offsetY={qrSize / 2} // Center rotation point (QR center, not border center)
                height={qrSize + actualBorderSize}
                width={qrSize + actualBorderSize}
                onMouseDown={(e) => {
                  e.cancelBubble = true;
                  if (transformerRef.current?.nodes().length == 0) {
                    setTimeout(() => {
                      setIsZoomEnabled(false);
                      if (transformerRef.current && shapeRef.current) {
                        transformerRef.current.nodes([shapeRef.current]);
                        // Batch draw after all transformer setup
                        transformerRef.current.getLayer().batchDraw();
                      }
                    }, 100);
                  }
                }}
              >
                {/* QR Border */}
                <Rect
                  fill={qrConfig.custom.borderColor}
                  x={-actualBorderSize / 2} // Offset border to grow from center
                  y={-actualBorderSize / 2} // Offset border to grow from center
                  height={qrSize + actualBorderSize}
                  width={qrSize + actualBorderSize}
                  cornerRadius={[
                    actualCornerRadius,
                    actualCornerRadius,
                    actualCornerRadius,
                    actualCornerRadius,
                  ]}
                />

                {/* QR Code */}
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

              {/* Transformer */}
              <Transformer
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

              {/* Snap lines */}
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

            {/* Phone UI Layer - Topmost */}
            {showPhoneUI && (
              <Layer listening={false} opacity={isHovered ? 0.5 : 1}>
                {/* Signal Bars */}
                <Group x={24} y={20} listening={false}>
                  <Rect
                    x={0}
                    y={0}
                    width={1 / stageScale}
                    height={16 / stageScale}
                    fill="white"
                    cornerRadius={0.5 / stageScale}
                  />
                  <Rect
                    x={2 / stageScale}
                    y={2 / stageScale}
                    width={1 / stageScale}
                    height={14 / stageScale}
                    fill="white"
                    cornerRadius={0.5 / stageScale}
                  />
                  <Rect
                    x={4 / stageScale}
                    y={1 / stageScale}
                    width={1 / stageScale}
                    height={15 / stageScale}
                    fill="white"
                    cornerRadius={0.5 / stageScale}
                  />
                  <Rect
                    x={6 / stageScale}
                    y={0}
                    width={1 / stageScale}
                    height={16 / stageScale}
                    fill="white"
                    cornerRadius={0.5 / stageScale}
                  />
                </Group>

                {/* Battery */}
                <Group x={deviceInfo.size.x - 60} y={20} listening={false}>
                  <Rect
                    x={0}
                    y={0}
                    width={24 / stageScale}
                    height={16 / stageScale}
                    stroke="white"
                    strokeWidth={1 / stageScale}
                    cornerRadius={2 / stageScale}
                  />
                  <Rect
                    x={2 / stageScale}
                    y={2 / stageScale}
                    width={18 / stageScale}
                    height={12 / stageScale}
                    fill="white"
                    cornerRadius={1 / stageScale}
                  />
                  <Rect
                    x={26 / stageScale}
                    y={4 / stageScale}
                    width={2 / stageScale}
                    height={8 / stageScale}
                    fill="white"
                    cornerRadius={1 / stageScale}
                  />
                </Group>

                {/* Time */}
                <Text
                  x={deviceInfo.size.x / 2}
                  y={deviceInfo.size.y / 2 - 40}
                  text="4:44 PM"
                  fontSize={48 / stageScale}
                  fontFamily="SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif"
                  fill="white"
                  align="center"
                  listening={false}
                  offsetX={100 / stageScale}
                  offsetY={24 / stageScale}
                />

                {/* Notification */}
                <Group x={24} y={deviceInfo.size.y / 2 + 40} listening={false}>
                  <Rect
                    x={0}
                    y={0}
                    width={(deviceInfo.size.x - 48) / stageScale}
                    height={48 / stageScale}
                    fill="rgba(255, 255, 255, 0.2)"
                    cornerRadius={16 / stageScale}
                    stroke="rgba(255, 255, 255, 0.3)"
                    strokeWidth={1 / stageScale}
                  />
                  <Text
                    x={16 / stageScale}
                    y={16 / stageScale}
                    text="New Messages"
                    fontSize={16 / stageScale}
                    fontFamily="SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif"
                    fill="white"
                    listening={false}
                  />
                  <Text
                    x={16 / stageScale}
                    y={36 / stageScale}
                    text="1 notification"
                    fontSize={14 / stageScale}
                    fontFamily="SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif"
                    fill="rgba(255, 255, 255, 0.8)"
                    listening={false}
                  />
                  <Text
                    x={(deviceInfo.size.x - 72) / stageScale}
                    y={16 / stageScale}
                    text="3:33 AM"
                    fontSize={14 / stageScale}
                    fontFamily="SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif"
                    fill="rgba(255, 255, 255, 0.8)"
                    listening={false}
                  />
                </Group>
              </Layer>
            )}
          </Stage>
        </div>
      </>
    );
  }
);

export default OptimizedWallpaper;
