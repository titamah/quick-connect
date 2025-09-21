import { forwardRef, useState, useEffect, useRef, useCallback, useImperativeHandle } from "react";
import {
  Application,
  Graphics,
  Container,
  Sprite,
  Assets,
  Rectangle,
} from "pixi.js";
import { useDevice } from "../../contexts/DeviceContext";
import { usePreview } from "../../contexts/PreviewContext";
import { useStageCalculations } from "../../hooks/useStageCalculations";
import { QRCodeSVG } from "qrcode.react";
import { Transformer } from "./QRTransformer";
import { BackgroundRenderer } from "./BackgroundRenderer";
import PhoneUI from "./PhoneUI";

const Wallpaper = forwardRef(
  (
    { panelSize, isOpen, locked, setIsZoomEnabled, backgroundLayerRef },
    ref
  ) => {
    const {
      deviceInfo,
      background,
      qrConfig,
      updateQRConfig,
      updateQRPositionPercentages,
      takeSnapshot,
      isQRSelected,
      selectQR: contextSelectQR,
      deselectAll,
    } = useDevice();

    const {
      isPreviewVisible,
      isHovered,
      isExporting,
      setIsPreviewVisible,
    } = usePreview();

    const containerRef = useRef(null);
    const appRef = useRef(null);
    const qrRef = useRef(null);
    const stageScale = useStageCalculations(deviceInfo.size, panelSize, isOpen);
    const qrContainerRef = useRef(null);
    const transformerRef = useRef(null);
    const guidesRef = useRef(null);
    const backgroundRendererRef = useRef(null);


    const currentConfigRef = useRef(qrConfig);
    const currentDeviceRef = useRef(deviceInfo);
    const currentLockedRef = useRef(locked);

    const takeSnapshotRef = useRef(takeSnapshot);
    const updateQRConfigRef = useRef(updateQRConfig);
    const updateQRPositionPercentagesRef = useRef(updateQRPositionPercentages);

    useImperativeHandle(ref, () => ({
        exportImage: (options = {}) => {
          const {
            format = 'png',
            quality = 0.9,
            scale = 1,
            width,
            height,
          } = options;
  
          return new Promise((resolve, reject) => {
            try {
              const pixiApp = appRef.current;
              if (!pixiApp || !pixiApp.renderer) {
                throw new Error("Pixi application not found or not initialized");
              }

              const exportWidth = width || Math.floor(deviceInfo.size.x * scale);
              const exportHeight = height || Math.floor(deviceInfo.size.y * scale);
              
              const originalWidth = pixiApp.renderer.width;
              const originalHeight = pixiApp.renderer.height;
              
              pixiApp.renderer.resize(exportWidth, exportHeight);
              
              pixiApp.render();
              
              const canvas = pixiApp.renderer.extract.canvas(pixiApp.stage);
              
              const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
              canvas.toBlob((blob) => {
                try {
                  pixiApp.renderer.resize(originalWidth, originalHeight);

                  pixiApp.render();
                  
                  if (!blob) {
                    reject(new Error("Failed to generate image blob"));
                    return;
                  }
                  
                  resolve(blob);
                } catch (error) {
                  pixiApp.renderer.resize(originalWidth, originalHeight);
               
                  pixiApp.render();
                  reject(error);
                }
              }, mimeType, quality);
              
            } catch (error) {
              reject(error);
            }
          });
        },
  
        getPixiApp: () => appRef.current,
        
        toDataURL: (options = {}) => {
          const {
            format = 'png',
            quality = 0.9,
            scale = 1,
          } = options;
  
          try {
            const pixiApp = appRef.current;
            if (!pixiApp || !pixiApp.renderer) {
              throw new Error("Pixi application not found or not initialized");
            }

            
            const canvas = pixiApp.renderer.extract.canvas(pixiApp.stage);
            const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
            
            
            return canvas.toDataURL(mimeType, quality);
          } catch (error) {
            console.error("toDataURL failed:", error);
            return null;
          }
        },
      }), [deviceInfo.size]);

    useEffect(() => {
      takeSnapshotRef.current = takeSnapshot;
    }, [takeSnapshot]);

    useEffect(() => {
      updateQRConfigRef.current = updateQRConfig;
    }, [updateQRConfig]);

    useEffect(() => {
      updateQRPositionPercentagesRef.current = updateQRPositionPercentages;
    }, [updateQRPositionPercentages]);

    useEffect(() => {
      currentConfigRef.current = qrConfig;
    }, [qrConfig]);

    useEffect(() => {
      currentDeviceRef.current = deviceInfo;
    }, [deviceInfo]);

    useEffect(() => {
      currentLockedRef.current = locked;
    }, [locked]);

    const createGuides = useCallback(() => {
      if (!appRef.current) return;

      let guides = guidesRef.current;
      if (!guides) {
        guides = new Graphics();
        guides.zIndex = 1000;
        appRef.current.stage.addChild(guides);
        guidesRef.current = guides;
      }

      guides.clear();
      guides.visible = false;

      return guides;
    }, []);

    const showGuides = useCallback(
      (showHorizontal, showVertical) => {
        const guides = guidesRef.current;
        if (!guides) return;

        guides.clear();

        const centerX = deviceInfo.size.x / 2;
        const centerY = deviceInfo.size.y / 2;

        if (showHorizontal) {
          guides
            .moveTo(0, centerY)
            .lineTo(deviceInfo.size.x, centerY)
            .stroke({ color: 0x7ed03b, width: 6, alpha: 0.8 });
        }

        if (showVertical) {
          guides
            .moveTo(centerX, 0)
            .lineTo(centerX, deviceInfo.size.y)
            .stroke({ color: 0x7ed03b, width: 6, alpha: 0.8 });
        }

        guides.visible = showHorizontal || showVertical;
      },
      [deviceInfo.size]
    );

    const hideGuides = useCallback(() => {
      const guides = guidesRef.current;
      if (guides) {
        guides.visible = false;
      }
    }, []);

    const handlePointerDown = useCallback(
      (event) => {
        const qrContainer = qrContainerRef.current;
        if (!qrContainer || !currentLockedRef.current) return;

        event.stopPropagation();

        takeSnapshotRef.current("Move QR Code");

        if (transformerRef.current) {
          transformerRef.current.detach();
        }

        qrContainer.cursor = "grabbing";
        qrContainer.isDragging = true;

        qrContainer.dragOffset = {
          x: event.global.x - qrContainer.x,
          y: event.global.y - qrContainer.y,
        };

        createGuides();
      },
      [createGuides]
    );

    const handlePointerMove = useCallback(
      (event) => {
        const qrContainer = qrContainerRef.current;
        if (!qrContainer || !qrContainer.isDragging) return;

        const currentConfig = currentConfigRef.current;
        const currentDevice = currentDeviceRef.current;

        const qrSize = Math.min(currentDevice.size.x, currentDevice.size.y);
        const qrHalfSize = (qrSize * currentConfig.scale) / 2;

        const centerX = currentDevice.size.x / 2;
        const centerY = currentDevice.size.y / 2;
        const snapThreshold = 20;

        let targetX = event.global.x - qrContainer.dragOffset.x;
        let targetY = event.global.y - qrContainer.dragOffset.y;

        const snapToHorizontalCenter =
          Math.abs(targetX - centerX) < snapThreshold;
        const snapToVerticalCenter =
          Math.abs(targetY - centerY) < snapThreshold;

        if (snapToHorizontalCenter) {
          targetX = centerX;
        }
        if (snapToVerticalCenter) {
          targetY = centerY;
        }

        const newX = Math.max(
          qrHalfSize,
          Math.min(currentDevice.size.x - qrHalfSize, targetX)
        );
        const newY = Math.max(
          qrHalfSize,
          Math.min(currentDevice.size.y - qrHalfSize, targetY)
        );

        qrContainer.x = newX;
        qrContainer.y = newY;

        const isSnappedHorizontal = snapToVerticalCenter && newY === centerY;
        const isSnappedVertical = snapToHorizontalCenter && newX === centerX;

        if (isSnappedHorizontal || isSnappedVertical) {
          showGuides(isSnappedHorizontal, isSnappedVertical);
        } else {
          hideGuides();
        }

        updateQRPositionPercentagesRef.current({
          x: newX / currentDevice.size.x,
          y: newY / currentDevice.size.y,
        });
      },
      [showGuides, hideGuides]
    );

    const handlePointerUp = useCallback(() => {
      const qrContainer = qrContainerRef.current;
      if (!qrContainer) return;

      const wasDragging = qrContainer.isDragging;
      
      qrContainer.isDragging = false;
      qrContainer.cursor = "grab";

      if (wasDragging) {
        hideGuides();
      }

      // Always show transformer after any interaction (drag or click)
      if (transformerRef.current) {
        transformerRef.current.attachTo(
          qrContainer,
          currentDeviceRef.current,
          currentConfigRef.current,
          qrContainer.scale.x
        );
      }
    }, [hideGuides]);

    const attachDragHandlers = useCallback(() => {
      const qrContainer = qrContainerRef.current;
      if (!qrContainer || !locked) return;

      qrContainer.on("pointerdown", handlePointerDown);
      qrContainer.on("pointermove", handlePointerMove);
      qrContainer.on("pointerup", handlePointerUp);
      qrContainer.on("pointerupoutside", handlePointerUp);
    }, [locked, handlePointerDown, handlePointerMove, handlePointerUp]);

    const removeDragHandlers = useCallback(() => {
      const qrContainer = qrContainerRef.current;
      if (!qrContainer) return;

      qrContainer.off("pointerdown", handlePointerDown);
      qrContainer.off("pointermove", handlePointerMove);
      qrContainer.off("pointerup", handlePointerUp);
      qrContainer.off("pointerupoutside", handlePointerUp);
    }, [handlePointerDown, handlePointerMove, handlePointerUp]);

    const selectQR = useCallback(() => {
      const qrContainer = qrContainerRef.current;
      if (!qrContainer) return;

      contextSelectQR();
      qrContainer.cursor = "grab";

      if (transformerRef.current) {
        transformerRef.current.attachTo(
          qrContainer,
          currentDeviceRef.current,
          currentConfigRef.current,
          qrContainer.scale.x 
        );
      }

      attachDragHandlers();
      takeSnapshotRef.current("Select QR Code");
    }, [contextSelectQR, attachDragHandlers]);

    const handleStageClick = useCallback(
      (event) => {
        if (event.target === appRef.current?.stage) {
          deselectAll();
        }
      },
      [deselectAll]
    );

    const generateQRCode = useCallback(() => {
      if (!appRef.current || !qrRef.current) return;

      const app = appRef.current;

      let qrContainer = qrContainerRef.current;
      if (!qrContainer) {
        qrContainer = new Container();
        qrContainer.name = 'qr-container';
        app.stage.addChild(qrContainer);
        qrContainerRef.current = qrContainer;
      }

      const svg = qrRef.current.querySelector("svg");
      if (!svg) return;

      const svgData = new XMLSerializer().serializeToString(svg);
      const dataURL =
        "data:image/svg+xml;base64," +
        btoa(unescape(encodeURIComponent(svgData)));

      Assets.load(dataURL).then((texture) => {
        qrContainer.removeChildren();

        const qrSize = Math.min(deviceInfo.size.x, deviceInfo.size.y);
        const borderSize = qrSize * (qrConfig.custom.borderSizeRatio / 100);
        const cornerRadius =
          (qrSize + borderSize) * (qrConfig.custom.cornerRadiusRatio / 100);

        const borderGraphics = new Graphics();
        if (borderSize > 0) {
          const totalSize = qrSize + borderSize;
          borderGraphics.roundRect(
            -totalSize / 2,
            -totalSize / 2,
            totalSize,
            totalSize,
            cornerRadius
          );
          borderGraphics.fill(qrConfig.custom.borderColor);
        }

        const qrSprite = new Sprite(texture);
        qrSprite.anchor.set(0.5);
        qrSprite.width = qrSize;
        qrSprite.height = qrSize;

        qrContainer.addChild(borderGraphics);
        qrContainer.addChild(qrSprite);

        qrContainer.scale.set(qrConfig.scale);
        qrContainer.x = deviceInfo.size.x * qrConfig.positionPercentages.x;
        qrContainer.y = deviceInfo.size.y * qrConfig.positionPercentages.y;
        qrContainer.rotation = (qrConfig.rotation * Math.PI) / 180;

        if (
          transformerRef.current &&
          transformerRef.current.visible &&
          isQRSelected
        ) {
          requestAnimationFrame(() => {
            transformerRef.current.updateBorder();
          });
        }

        qrContainer.eventMode = "static";
        qrContainer.cursor = "pointer";

        qrContainer.on("pointerdown", (event) => {
          event.stopPropagation();

          // Always start dragging immediately, no selection requirement
          if (!qrContainer.isDragging) {
            handlePointerDown(event);
          }
        });

        // Show transformer on simple clicks (without drag)
        qrContainer.on("pointerup", (event) => {
          if (!qrContainer.isDragging) {
            // This was just a click, not a drag - show transformer
            if (transformerRef.current) {
              transformerRef.current.attachTo(
                qrContainer,
                currentDeviceRef.current,
                currentConfigRef.current,
                qrContainer.scale.x
              );
            }
          }
        });
      });
    }, [
      qrConfig.url,
      qrConfig.custom.primaryColor,
      qrConfig.custom.secondaryColor,
      qrConfig.custom.borderColor,
      qrConfig.custom.cornerRadiusRatio,
      qrConfig.custom.borderSizeRatio,
      qrConfig.scale,
      qrConfig.positionPercentages,
      qrConfig.rotation,
      deviceInfo.size,
      locked,
      selectQR,
      isQRSelected,
    ]);

    useEffect(() => {
      return () => {
        if (transformerRef.current) {
          transformerRef.current.forceCleanup();
        }
      };
    }, []);

    useEffect(() => {
      if (appRef.current) return;

      const initApp = async () => {
        const app = new Application();
        await app.init({
          width: deviceInfo.size.x + 2,
          height: deviceInfo.size.y + 2,
          backgroundColor: 0x000000,
          antialias: true,
        });

        if (containerRef.current) {
          containerRef.current.innerHTML = "";
          containerRef.current.appendChild(app.canvas);
        }

        appRef.current = app;

        backgroundRendererRef.current = new BackgroundRenderer(
          app,
          deviceInfo.size
        );


        const transformer = new Transformer();
        app.stage.addChild(transformer);
        transformerRef.current = transformer;

        transformer.on("transformstart", () => {
          takeSnapshotRef.current("Transform QR Code");
        });

        transformer.on("transform", () => {
          const qrContainer = qrContainerRef.current;
          if (!qrContainer) return;

          const currentDevice = currentDeviceRef.current;
          const newScale = Math.max(0.1, Math.min(1.0, qrContainer.scale.x));
          const newRotation = (qrContainer.rotation * 180) / Math.PI;
          const newPosition = {
            x: qrContainer.x / currentDevice.size.x,
            y: qrContainer.y / currentDevice.size.y,
          };

          updateQRConfigRef.current({ scale: newScale, rotation: newRotation });
          updateQRPositionPercentagesRef.current(newPosition);
          
          if (transformerRef.current && transformerRef.current.visible) {
            transformerRef.current.qrScale = newScale;
            transformerRef.current.updateHandleScaling();
          }
        });

        app.stage.eventMode = "static";
        app.stage.hitArea = new Rectangle(
          0,
          0,
          deviceInfo.size.x + 2,
          deviceInfo.size.y + 2
        );
        app.stage.on("pointerdown", handleStageClick);

        backgroundRendererRef.current?.updateDeviceSize(deviceInfo.size);
        backgroundRendererRef.current?.renderBackground(background);

        setTimeout(generateQRCode, 0);
      };

      initApp();

      return () => {
        if (backgroundRendererRef.current) {
          backgroundRendererRef.current.destroy();
        }
        if (appRef.current) {
          appRef.current.destroy(true);
          appRef.current = null;
        }
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }
      };
    }, []);

    useEffect(() => {
      if (!isQRSelected) {
        const qrContainer = qrContainerRef.current;
        if (qrContainer) {
          qrContainer.cursor = "pointer";

          if (transformerRef.current) {
            transformerRef.current.forceCleanup();
            transformerRef.current.detach();
          }

          removeDragHandlers();
        }
      }
    }, [isQRSelected, removeDragHandlers]);

    useEffect(() => {
      const handlePointerDownOutside = (event) => {
        const previewElement = document.getElementById("preview");

        if (
          isQRSelected &&
          previewElement &&
          !previewElement.contains(event.target)
        ) {
          deselectAll();
        }
      };

      if (isQRSelected) {
        document.addEventListener("pointerdown", handlePointerDownOutside);

        return () => {
          document.removeEventListener("pointerdown", handlePointerDownOutside);
        };
      }
    }, [isQRSelected, deselectAll]);

    useEffect(() => {
      // Always attach drag handlers when locked, regardless of selection state
      if (locked) {
        attachDragHandlers();
      } else {
        removeDragHandlers();
      }
    }, [locked, attachDragHandlers, removeDragHandlers]);

    useEffect(() => {
      if (backgroundRendererRef.current) {
        backgroundRendererRef.current.updateDeviceSize(deviceInfo.size);
        backgroundRendererRef.current.renderBackground(background);
      }
      if (appRef.current) {
        appRef.current.renderer.resize(
          deviceInfo.size.x + 2,
          deviceInfo.size.y + 2
        );
      }
    }, [deviceInfo.size]);

    useEffect(() => {
      generateQRCode();
    }, [generateQRCode]);

    useEffect(() => {
      if (backgroundRendererRef.current) {
        backgroundRendererRef.current.renderBackground(background);
      }
    }, [
      background.style,
      background.color,
      background.bg,
      background.gradient,
      background.grain,
    ]);

    useEffect(() => {
      if (
        transformerRef.current &&
        transformerRef.current.visible &&
        qrContainerRef.current
      ) {
        transformerRef.current.updateBorder();
      }
    }, [
      qrConfig.scale,
      qrConfig.rotation,
      qrConfig.positionPercentages.x,
      qrConfig.positionPercentages.y,
      qrConfig.custom.primaryColor,
      qrConfig.custom.secondaryColor,
      qrConfig.custom.borderColor,
      qrConfig.custom.cornerRadiusRatio,
      qrConfig.custom.borderSizeRatio,
    ]);

    return (
      <>
        <div
          style={{
            position: "absolute",
            left: "-9999px",
            visibility: "hidden",
            width: `${deviceInfo.size.x * stageScale}px`,
            height: `${deviceInfo.size.y * stageScale}px`,
          }}
          ref={qrRef}
        >
          <QRCodeSVG
            value={qrConfig.url || "www.qrki.xyz"}
            size={Math.min(deviceInfo.size.x, deviceInfo.size.y)}
            fgColor={qrConfig.custom.primaryColor}
            bgColor={qrConfig.custom.secondaryColor}
            level="M"
          />
        </div>
 
        <PhoneUI />
        <div
          id="preview"
          style={{
            width: `${deviceInfo.size.x * stageScale}px`,
            height: `${deviceInfo.size.y * stageScale}px`,
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            transform: `scale(${stageScale})`,
            transformOrigin: "center center",
            pointerEvents: "auto",
          }}
          ref={containerRef}
        >
        </div>
      </>
    );
  }
);

export default Wallpaper;
