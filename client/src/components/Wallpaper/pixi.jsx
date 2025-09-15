import { forwardRef, useEffect, useRef, useCallback } from "react";
import { Application, Graphics, Container, Sprite, Assets } from "pixi.js";
import { useDevice } from "../../contexts/DeviceContext";
import { useStageCalculations } from "../../hooks/useStageCalculations";
import { QRCodeSVG } from "qrcode.react";
import { Transformer } from "./QRTransformer"; // Import our custom transformer

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

    // ✅ FIX: Use refs to store current values for event handlers
    const currentConfigRef = useRef(qrConfig);
    const currentDeviceRef = useRef(deviceInfo);
    const currentLockedRef = useRef(locked);

    // ✅ Update refs whenever values change
    useEffect(() => {
      currentConfigRef.current = qrConfig;
    }, [qrConfig]);

    useEffect(() => {
      currentDeviceRef.current = deviceInfo;
    }, [deviceInfo]);

    useEffect(() => {
      currentLockedRef.current = locked;
    }, [locked]);

    // ✅ FIX: Create stable callback functions that use current refs
    const handlePointerDown = useCallback(
      (event) => {
        const qrContainer = qrContainerRef.current;
        if (!qrContainer || !currentLockedRef.current) return;

        console.log("📸 Taking snapshot with current position:", {
          x: currentConfigRef.current.positionPercentages.x,
          y: currentConfigRef.current.positionPercentages.y,
        });

        // Take snapshot FIRST with current state
        takeSnapshot("Move QR Code");

        qrContainer.cursor = "grabbing";
        qrContainer.isDragging = true;

        // Store drag offset
        qrContainer.dragOffset = {
          x: event.global.x - qrContainer.x,
          y: event.global.y - qrContainer.y,
        };
      },
      [takeSnapshot]
    );

    const handlePointerMove = useCallback(
      (event) => {
        const qrContainer = qrContainerRef.current;
        if (!qrContainer || !qrContainer.isDragging) return;

        const currentConfig = currentConfigRef.current;
        const currentDevice = currentDeviceRef.current;

        const qrSize = Math.min(currentDevice.size.x, currentDevice.size.y);
        const qrHalfSize = (qrSize * currentConfig.scale) / 2;

        const newX = Math.max(
          qrHalfSize,
          Math.min(
            currentDevice.size.x - qrHalfSize,
            event.global.x - qrContainer.dragOffset.x
          )
        );
        const newY = Math.max(
          qrHalfSize,
          Math.min(
            currentDevice.size.y - qrHalfSize,
            event.global.y - qrContainer.dragOffset.y
          )
        );

        qrContainer.x = newX;
        qrContainer.y = newY;

        // ✅ Update transformer position to follow the QR
        if (transformerRef.current && transformerRef.current.visible) {
          transformerRef.current.updatePosition();
        }

        // Update position immediately
        updateQRPositionPercentages({
          x: newX / currentDevice.size.x,
          y: newY / currentDevice.size.y,
        });
      },
      [updateQRPositionPercentages]
    );

    const handlePointerUp = useCallback(() => {
      const qrContainer = qrContainerRef.current;
      if (!qrContainer) return;

      qrContainer.isDragging = false;
      qrContainer.cursor = "grab";
    }, []);

    const handleStageClick = useCallback((event) => {
      if (event.target === appRef.current?.stage) {
        console.log("🖱️ Stage clicked - deselecting transformer");
        if (transformerRef.current) {
          transformerRef.current.forceCleanup();
          transformerRef.current.detach();
        }
      }
    }, []);

    useEffect(() => {
        return () => {
          // Cleanup when component unmounts
          if (transformerRef.current) {
            transformerRef.current.forceCleanup();
          }
        };
      }, []);

    // Initialize Pixi Application
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

        // ✅ FIX: Create the transformer instance
        const transformer = new Transformer();
        app.stage.addChild(transformer);
        transformerRef.current = transformer;

        // Listen for transformer events
        transformer.on("transformstart", () => {
          takeSnapshot("Transform QR Code");
        });

        transformer.on("transform", () => {
          const qrContainer = qrContainerRef.current;
          if (!qrContainer) return;

          // Update QR config during transform
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

        // Handle stage clicks for deselection
        app.stage.eventMode = "static";
        app.stage.on("pointerdown", handleStageClick);
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
    }, [deviceInfo.size]); // ✅ FIX: Revert to original dependencies only

    // Update QR Code
    useEffect(() => {
      if (!appRef.current || !qrRef.current) return;

      const app = appRef.current;

      let qrContainer = qrContainerRef.current;
      if (!qrContainer) {
        qrContainer = new Container();
        app.stage.addChild(qrContainer);
        qrContainerRef.current = qrContainer;
      }

      const svg = qrRef.current.querySelector("svg");
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const dataURL =
          "data:image/svg+xml;base64," +
          btoa(unescape(encodeURIComponent(svgData)));

        Assets.load(dataURL).then((texture) => {
          // Clear container but preserve reference
          qrContainer.removeChildren();

          const qrSize = Math.min(deviceInfo.size.x, deviceInfo.size.y);
          const borderSize = qrSize * (qrConfig.custom.borderSizeRatio / 100);
          const cornerRadius =
            (qrSize + borderSize) * (qrConfig.custom.cornerRadiusRatio / 100);

          // Create border graphics
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

          // Create QR sprite
          const qrSprite = new Sprite(texture);
          qrSprite.anchor.set(0.5);
          qrSprite.width = qrSize;
          qrSprite.height = qrSize;

          qrContainer.addChild(borderGraphics);
          qrContainer.addChild(qrSprite);

          // Set position and scale
          qrContainer.scale.set(qrConfig.scale);
          qrContainer.x = deviceInfo.size.x * qrConfig.positionPercentages.x;
          qrContainer.y = deviceInfo.size.y * qrConfig.positionPercentages.y;
          qrContainer.rotation = (qrConfig.rotation * Math.PI) / 180;

          // ✅ Update transformer immediately after QR container is updated
          if (transformerRef.current && transformerRef.current.visible) {
            // Use requestAnimationFrame to ensure the QR container is fully rendered
            requestAnimationFrame(() => {
              transformerRef.current.updateBorder();
            });
          }

          // Make QR container interactive
          qrContainer.eventMode = "static";
          qrContainer.cursor = "pointer";

          // Handle QR container clicks
          qrContainer.on("pointerdown", (event) => {
            event.stopPropagation();
            console.log("🎯 QR selected");

            if (transformerRef.current) {
              transformerRef.current.attachTo(
                qrContainer,
                deviceInfo,
                qrConfig
              );
            }

            takeSnapshot("Select QR Code");
          });

          // Setup drag functionality when not using transformer
          if (locked) {
            qrContainer.on("pointerdown", handlePointerDown);
            qrContainer.on("pointermove", handlePointerMove);
            qrContainer.on("pointerup", handlePointerUp);
            qrContainer.on("pointerupoutside", handlePointerUp);
          }
        });
      }
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

    // ✅ Add useEffect to update transformer when QR config changes
    useEffect(() => {
      if (
        transformerRef.current &&
        transformerRef.current.visible &&
        qrContainerRef.current
      ) {
        console.log("🔄 QR config changed, updating transformer");
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
