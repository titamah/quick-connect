import React, {
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import {
  Application,
  Graphics,
  TextStyle,
  Text,
  Assets,
  Sprite,
  Texture,
  ImageSource,
} from "pixi.js";
import { useDevice } from "../../contexts/DeviceContext";

const THUMBNAIL_HEIGHT = 640;
const THUMBNAIL_WIDTH = 1280;
const THUMBNAIL_SCALE = 0.25;
const THUMBNAIL_PADDING = THUMBNAIL_WIDTH / 10;
const THUMBNAIL_TEXT_SIZE = THUMBNAIL_HEIGHT * 0.1;

const Thumbnail = forwardRef(({ wallpaperRef, dark = true }, ref) => {
  const { qrConfig } = useDevice();
  const containerRef = useRef(null);
  const appRef = useRef(null);

  const exportAsBlob = async (options = {}) => {
    const { quality = 0.8, format = "image/webp" } = options;

    if (!appRef.current) {
      throw new Error("Thumbnail not ready for export");
    }

    try {
      const canvas = appRef.current.renderer.extract.canvas(
        appRef.current.stage
      );

      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to export thumbnail"));
              return;
            }
            resolve(blob);
          },
          format === "png" ? "image/png" : "image/webp",
          quality
        );
      });
    } catch (error) {
      console.error("Failed to export thumbnail:", error);
      throw new Error("Failed to export thumbnail");
    }
  };

  useImperativeHandle(ref, () => ({ exportAsBlob }));

  const setupBasicScene = async () => {
    const app = appRef.current;
    if (!app) {
      console.error("❌ No app in setupBasicScene");
      return;
    }

    console.log("🎨 Setting up basic scene...");

    // Clear stage
    app.stage.removeChildren();

    // Create a simple red background - full size, no scaling issues
    const background = new Graphics();
    background.rect(0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
    background.fill(`${dark ? "#000000" : "#FFFFFF"}`); // Bright red
    app.stage.addChild(background);

    const style = new TextStyle({
      fontFamily: "Rubik",
      fontSize: `${THUMBNAIL_TEXT_SIZE}px`,
      fontWeight: "800",
      fill: `${!dark ? "#000000" : "#FFFFFF"}`,
    });

    // Blue square in top-left corner
    const text = new Text("MADE WITH", style);
    text.x = THUMBNAIL_PADDING;
    text.y = THUMBNAIL_HEIGHT * 0.2;
    app.stage.addChild(text);

    const loadColoredLogo = async (color) => {
      try {
        const svgResponse = await fetch("/LOGO.svg");
        const svgText = await svgResponse.text();

        const coloredSVG = svgText.replace(/#FC6524/gi, color);

        const blob = new Blob([coloredSVG], { type: "image/svg+xml" });
        const blobUrl = URL.createObjectURL(blob);

        // Create an Image element and wait for it to load
        const image = new Image();

        const logoTexture = await new Promise((resolve, reject) => {
          image.onload = () => {
            try {
              // Create texture source with the loaded image
              const source = new ImageSource({ resource: image });

              // Create texture from source
              const texture = new Texture({ source });

              resolve(texture);
            } catch (err) {
              reject(err);
            }
          };

          image.onerror = reject;
          image.src = blobUrl;
        });

        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        return logoTexture;
      } catch (error) {
        console.error("Failed to load colored logo:", error);
        return await Assets.load("/LOGO.svg");
      }
    };

    // Then in your try block:
    try {
      const logoTexture = await loadColoredLogo(
        qrConfig?.custom?.primaryColor || "#FC6524"
      );

      if (!logoTexture) {
        throw new Error("Logo texture is null");
      }

      const logoSprite = new Sprite(logoTexture);
      const desiredHeight = THUMBNAIL_HEIGHT * 0.5; // Or whatever size you want
      const scale = desiredHeight / 525;
      logoSprite.scale.set(scale);

      logoSprite.x = THUMBNAIL_PADDING * 1.2;
      logoSprite.y = THUMBNAIL_HEIGHT * 0.3375;

      // Scale to desired size
      const logoScale = (THUMBNAIL_HEIGHT * 0.3) / logoSprite.height;
      logoSprite.scale.set(logoScale);

      app.stage.addChild(logoSprite);

      console.log("✅ Logo loaded successfully");
    } catch (error) {
      console.error("❌ Failed to load logo:", error);
    }

    console.log("✅ Added background to stage", {
      stageChildren: app.stage.children.length,
      backgroundWidth: background.width,
      backgroundHeight: background.height,
      appWidth: app.renderer.width,
      appHeight: app.renderer.height,
    });

    // Force a render
    app.render();
    console.log("🖼️ Forced render complete");
  };

  useEffect(() => {
    const initApp = async () => {
      if (appRef.current) {
        console.log("⚠️ App already exists, skipping init");
        return;
      }

      console.log("🚀 Initializing Pixi app...");

      try {
        const app = new Application();
        await app.init({
          width: THUMBNAIL_WIDTH, // Full size first, then scale display
          height: THUMBNAIL_HEIGHT,
          backgroundColor: 0x000000,
          antialias: true,
        });

        console.log("✅ Pixi app initialized", {
          rendererSize: `${app.renderer.width}x${app.renderer.height}`,
          canvasSize: `${app.canvas.width}x${app.canvas.height}`,
        });

        // Add to DOM
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
          containerRef.current.appendChild(app.canvas);

          // Scale the canvas display only
          app.canvas.style.width = `${THUMBNAIL_WIDTH * THUMBNAIL_SCALE}px`;
          app.canvas.style.height = `${THUMBNAIL_HEIGHT * THUMBNAIL_SCALE}px`;

          console.log("✅ Canvas added to DOM", {
            containerHasCanvas: containerRef.current.contains(app.canvas),
            canvasStyleSize: `${app.canvas.style.width} x ${app.canvas.style.height}`,
          });
        }

        appRef.current = app;

        // Setup scene immediately
        setupBasicScene();
      } catch (error) {
        console.error("❌ Failed to initialize Pixi app:", error);
      }
    };

    initApp();

    return () => {
      if (appRef.current) {
        console.log("🧹 Cleaning up Pixi app");
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
  }, []);

  return (
    <div
      id="Thumbnail"
      className="relative border border-[var(--border-color)] mx-3.5 mb-3.5 rounded-md overflow-hidden flex items-center justify-center cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors"
      style={{
        height: `${THUMBNAIL_HEIGHT * THUMBNAIL_SCALE}px`,
        width: `${THUMBNAIL_WIDTH * THUMBNAIL_SCALE}px`,
      }}
      ref={containerRef}
    >
      {/* Fallback content if canvas fails */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          color: "white",
          fontSize: "12px",
          pointerEvents: "none",
        }}
      >
        Loading...
      </div>
    </div>
  );
});

export default Thumbnail;
