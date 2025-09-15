import { forwardRef, useEffect, useRef, useCallback } from "react";
import { Application, Graphics, Container, Sprite, Assets } from "pixi.js";
import { useDevice } from "../../contexts/DeviceContext";
import { useStageCalculations } from "../../hooks/useStageCalculations";
import { QRCodeSVG } from "qrcode.react";
import { Transformer } from "./QRTransformer";

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
    } = useDevice();

    const containerRef = useRef(null);
    const appRef = useRef(null);
    const qrRef = useRef(null);
    const stageScale = useStageCalculations(deviceInfo.size, panelSize, isOpen);
    const qrContainerRef = useRef(null);
    const transformerRef = useRef(null);
    const guidesRef = useRef(null);

    const currentConfigRef = useRef(qrConfig);
    const currentDeviceRef = useRef(deviceInfo);
    const currentLockedRef = useRef(locked);

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

    const showGuides = useCallback((showHorizontal, showVertical) => {
      const guides = guidesRef.current;
      if (!guides) return;

      guides.clear();
      
      const centerX = deviceInfo.size.x / 2;
      const centerY = deviceInfo.size.y / 2;
      
      if (showHorizontal) {
        guides
          .moveTo(0, centerY)
          .lineTo(deviceInfo.size.x, centerY)
          .stroke({ color: 0x00ff88, width: 2, alpha: 0.8 });
      }
      
      if (showVertical) {
        guides
          .moveTo(centerX, 0)
          .lineTo(centerX, deviceInfo.size.y)
          .stroke({ color: 0x00ff88, width: 2, alpha: 0.8 });
      }
      
      guides.visible = showHorizontal || showVertical;
    }, [deviceInfo.size]);

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

        takeSnapshot("Move QR Code");

        qrContainer.cursor = "grabbing";
        qrContainer.isDragging = true;

        qrContainer.dragOffset = {
          x: event.global.x - qrContainer.x,
          y: event.global.y - qrContainer.y,
        };

        createGuides();
      },
      [takeSnapshot, createGuides]
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

        const snapToHorizontalCenter = Math.abs(targetX - centerX) < snapThreshold;
        const snapToVerticalCenter = Math.abs(targetY - centerY) < snapThreshold;

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

        if (transformerRef.current && transformerRef.current.visible) {
          transformerRef.current.updatePosition();
        }

        updateQRPositionPercentages({
          x: newX / currentDevice.size.x,
          y: newY / currentDevice.size.y,
        });
      },
      [updateQRPositionPercentages, showGuides, hideGuides]
    );

    const handlePointerUp = useCallback(() => {
      const qrContainer = qrContainerRef.current;
      if (!qrContainer) return;

      qrContainer.isDragging = false;
      qrContainer.cursor = "grab";
      
      hideGuides();
    }, [hideGuides]);

    const handleStageClick = useCallback((event) => {
      if (event.target === appRef.current?.stage) {
        if (transformerRef.current) {
          transformerRef.current.forceCleanup();
          transformerRef.current.detach();
        }
      }
    }, []);

    const generateQRCode = useCallback(() => {
      if (!appRef.current || !qrRef.current) return;

      const app = appRef.current;

      let qrContainer = qrContainerRef.current;
      if (!qrContainer) {
        qrContainer = new Container();
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

        if (transformerRef.current && transformerRef.current.visible) {
          requestAnimationFrame(() => {
            transformerRef.current.updateBorder();
          });
        }

        qrContainer.eventMode = "static";
        qrContainer.cursor = "pointer";

        qrContainer.on("pointerdown", (event) => {
          event.stopPropagation();

          if (transformerRef.current) {
            transformerRef.current.attachTo(
              qrContainer,
              deviceInfo,
              qrConfig
            );
          }

          takeSnapshot("Select QR Code");
        });

        if (locked) {
          qrContainer.on("pointerdown", handlePointerDown);
          qrContainer.on("pointermove", handlePointerMove);
          qrContainer.on("pointerup", handlePointerUp);
          qrContainer.on("pointerupoutside", handlePointerUp);
        }
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
      handlePointerDown,
      handlePointerMove,
      handlePointerUp,
      takeSnapshot,
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

        const transformer = new Transformer();
        app.stage.addChild(transformer);
        transformerRef.current = transformer;

        transformer.on("transformstart", () => {
          takeSnapshot("Transform QR Code");
        });

        transformer.on("transform", () => {
          const qrContainer = qrContainerRef.current;
          if (!qrContainer) return;

          const newScale = Math.max(0.1, Math.min(1.0, qrContainer.scale.x));
          const newRotation = (qrContainer.rotation * 180) / Math.PI;
          const newPosition = {
            x: qrContainer.x / deviceInfo.size.x,
            y: qrContainer.y / deviceInfo.size.y,
          };

          updateQRConfig({ scale: newScale, rotation: newRotation });
          updateQRPositionPercentages(newPosition);
        });

        transformer.on("transformend", () => {
          console.log("Transform ended");
        });

        app.stage.eventMode = "static";
        app.stage.on("pointerdown", handleStageClick);

        setTimeout(generateQRCode, 0);
      };

      initApp();

      return () => {
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
      if (appRef.current) {
        appRef.current.renderer.resize(deviceInfo.size.x + 2, deviceInfo.size.y + 2);
      }
    }, [deviceInfo.size]);

    useEffect(() => {
      generateQRCode();
    }, [generateQRCode]);

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
          }}
          ref={qrRef}
        >
          <QRCodeSVG
            value={qrConfig.url || "www.qrki.xyz"}
            size={Math.min(deviceInfo.size.x, deviceInfo.size.y)}
            fgColor={qrConfig.custom.primaryColor}
            bgColor={qrConfig.custom.secondaryColor}
            level="M"
            includeMargin={false}
          />
        </div>

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
        ></div>
      </>
    );
  }
);

export default Wallpaper;