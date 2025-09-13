import { forwardRef, useEffect, useRef } from "react";
import { Application, Graphics, Container, Sprite, Assets } from "pixi.js";
import { useDevice } from "../../contexts/DeviceContext";
import { useStageCalculations } from "../../hooks/useStageCalculations";
import { QRCodeSVG } from "qrcode.react";

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

    useEffect(() => {
      if (appRef.current) return;

      const initApp = async () => {
        const app = new Application();
        await app.init({
          width: deviceInfo.size.x,
          height: deviceInfo.size.y,
          backgroundColor: 0x000000,
        });

        if (containerRef.current) {
          containerRef.current.innerHTML = "";
          containerRef.current.appendChild(app.canvas);
        }

        appRef.current = app;
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
    }, [deviceInfo.size]);

    useEffect(() => {
      if (!appRef.current || !qrRef.current) return;

      const app = appRef.current;

      let qrContainer = qrContainerRef.current;
      if (!qrContainer) {
        qrContainer = new Container();
        app.stage.addChild(qrContainer);
        qrContainerRef.current = qrContainer;
      }

      const qrSize = Math.min(deviceInfo.size.x, deviceInfo.size.y);

      const svg = qrRef.current.querySelector("svg");
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const dataURL =
          "data:image/svg+xml;base64," +
          btoa(unescape(encodeURIComponent(svgData)));

        Assets.load(dataURL).then((texture) => {
          let qrSprite = qrContainer.getChildByName("qrSprite");
          qrContainer.removeChildren();
          qrContainer.removeAllListeners();

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
          if (!qrSprite) {
            qrSprite = new Sprite(texture);
            qrSprite.name = "qrSprite";
            qrSprite.anchor.set(0.5);
          } else {
            qrSprite.texture = texture;
          }

          qrContainer.addChild(borderGraphics);
          qrContainer.addChild(qrSprite);

          qrContainer.scale.set(qrConfig.scale);
          qrContainer.x = deviceInfo.size.x * qrConfig.positionPercentages.x;
          qrContainer.y = deviceInfo.size.y * qrConfig.positionPercentages.y;
          qrContainer.rotation = (qrConfig.rotation * Math.PI) / 180;

          qrContainer.eventMode = "dynamic";
          qrContainer.cursor = "grab";

          let isDragging = false;
          let dragStarted = false;
          let dragOffset = { x: 0, y: 0 };

          const timestamp = Date.now();
          console.log(`Creating event listeners at ${timestamp}`);

          qrContainer.on("pointerdown", (event) => {
            if (!locked) return;

            isDragging = true;
            qrContainer.cursor = "grabbing";

            const containerBounds = qrContainer.getBounds();
            dragOffset.x = event.global.x - qrContainer.x;
            dragOffset.y = event.global.y - qrContainer.y;

            const currentPosition = {
              x: qrContainer.x / deviceInfo.size.x,
              y: qrContainer.y / deviceInfo.size.y,
            };
            
            updateQRPositionPercentages(currentPosition);
              
              // Then take snapshot on next tick
              setTimeout(() => {
                takeSnapshot("Move QR Code");
              }, 0);          
          });

          qrContainer.on("pointermove", (event) => {
            if (!isDragging) return;

            const qrHalfSize = (qrSize * qrConfig.scale) / 2;

            const newX = Math.max(
              qrHalfSize,
              Math.min(
                deviceInfo.size.x - qrHalfSize,
                event.global.x - dragOffset.x
              )
            );
            const newY = Math.max(
              qrHalfSize,
              Math.min(
                deviceInfo.size.y - qrHalfSize,
                event.global.y - dragOffset.y
              )
            );

            qrContainer.x = newX;
            qrContainer.y = newY;

            updateQRPositionPercentages({
              x: newX / deviceInfo.size.x,
              y: newY / deviceInfo.size.y,
            });
          });

          qrContainer.on("pointerup", () => {
            isDragging = false;
            qrContainer.cursor = "grab";
          });

          qrContainer.on("pointerupoutside", () => {
            isDragging = false;
            qrContainer.cursor = "grab";
          });
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
      deviceInfo.size,
    ]);

    useEffect(() => {
      if (qrContainerRef.current) {
        qrContainerRef.current.x =
          deviceInfo.size.x * qrConfig.positionPercentages.x;
        qrContainerRef.current.y =
          deviceInfo.size.y * qrConfig.positionPercentages.y;
      }
    }, [qrConfig.positionPercentages, deviceInfo.size]);

    useEffect(() => {
      if (qrContainerRef.current) {
        qrContainerRef.current.scale = qrConfig.scale;
      }
    }, [qrConfig.scale]);

    useEffect(() => {
      if (qrContainerRef.current) {
        qrContainerRef.current.rotation = (qrConfig.rotation * Math.PI) / 180;
      }
    }, [qrConfig.rotation]);


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
