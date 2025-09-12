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
    }, []);

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

        // In your QR setup effect, after creating the sprite:
        Assets.load(dataURL).then((texture) => {
          // 🧹 CLEAN UP: Remove all old children
          qrContainer.removeChildren();

          // Calculate sizes
          const qrSize = Math.min(deviceInfo.size.x, deviceInfo.size.y);
          const borderSize = qrSize * (qrConfig.custom.borderSizeRatio / 100); // Convert ratio to pixels
          const cornerRadius =
            (qrSize + borderSize) * (qrConfig.custom.cornerRadiusRatio / 100);

          // 1. CREATE BORDER FIRST (so it's behind QR)
          const borderGraphics = new Graphics();
          if (borderSize > 0) {
            // Only draw if border exists
            const totalSize = qrSize + borderSize;
            borderGraphics.roundRect(
              -totalSize / 2, // Center the border
              -totalSize / 2,
              totalSize,
              totalSize,
              cornerRadius
            );
            borderGraphics.fill(qrConfig.custom.borderColor);
          }

          // 2. CREATE QR SPRITE
          let qrSprite = qrContainer.getChildByName('qrSprite');
          if (!qrSprite) {
            qrSprite = new Sprite(texture);
            qrSprite.name = 'qrSprite';
            qrSprite.anchor.set(0.5);
          } else {
            // Just swap the texture! 🔥
            qrSprite.texture = texture;
          }

          // 3. ADD TO CONTAINER (border behind, QR in front)
          qrContainer.addChild(borderGraphics);
          qrContainer.addChild(qrSprite);

          // Apply transforms to whole container
          qrContainer.scale.set(qrConfig.scale);
          qrContainer.x = deviceInfo.size.x * qrConfig.positionPercentages.x;
          qrContainer.y = deviceInfo.size.y * qrConfig.positionPercentages.y;
          qrContainer.rotation = (qrConfig.rotation * Math.PI) / 180;
        });
      }
    }, [
      qrConfig.url,
      qrConfig.custom.primaryColor,
      qrConfig.custom.secondaryColor,
      qrConfig.custom.borderColor,
      qrConfig.custom.cornerRadiusRatio,
      qrConfig.custom.borderSizeRatio,
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
