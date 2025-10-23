import React, {
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useState,
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
  const { qrConfig, deviceInfo } = useDevice();
  const containerRef = useRef(null);
  const appRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const readyPromiseRef = useRef(null);

  // Create a promise that resolves when thumbnail is ready
  useEffect(() => {
    readyPromiseRef.current = new Promise((resolve) => {
      const checkReady = () => {
        if (isReady) {
          resolve();
        } else {
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
    });
  }, [isReady]);

  const exportAsBlob = async (options = {}) => {
    const { quality = 0.8, format = "image/webp" } = options;

    console.log("🖼️ exportAsBlob called, waiting for thumbnail to be ready...");
    
    // Wait for thumbnail to be fully ready
    await readyPromiseRef.current;
    
    console.log("🖼️ Thumbnail is ready, proceeding with export");

    if (!appRef.current) {
      throw new Error("Thumbnail app not initialized");
    }

    try {
      console.log("🖼️ Starting thumbnail export...");
      
      // Double-check stage has content
      if (appRef.current.stage.children.length === 0) {
        throw new Error("Thumbnail stage is empty");
      }
      
      console.log("🖼️ Stage has", appRef.current.stage.children.length, "children");
      
      // Force a render before extracting
      appRef.current.renderer.render(appRef.current.stage);
      console.log("🖼️ Render completed");
      
      const canvas = appRef.current.renderer.extract.canvas(
        appRef.current.stage
      );

      console.log("🖼️ Canvas extracted:", canvas.width, "x", canvas.height);

      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to export thumbnail"));
              return;
            }
            console.log("✅ Thumbnail blob created:", blob.size, "bytes");
            resolve(blob);
          },
          format === "png" ? "image/png" : "image/webp",
          quality
        );
      });
    } catch (error) {
      console.error("❌ Failed to export thumbnail:", error);
      throw error;
    }
  };

  useImperativeHandle(ref, () => ({ 
    exportAsBlob,
    isReady: () => isReady 
  }));

  const createThumbnail = async () => {
    console.log("🖼️ createThumbnail called");
    setIsReady(false); // Reset ready state
    
    if (!wallpaperRef.current?.exportImage) {
      console.log("🖼️ exportImage not ready, using fallback");
      await setupBasicScene(null);
      setIsReady(true);
      return;
    }
    if (!appRef.current) {
      console.log("🖼️ app ref not ready, using fallback");
      await setupBasicScene(null);
      setIsReady(true);
      return;
    }

    try {
      // Export the main wallpaper at a reasonable size for thumbnail
      console.log("🖼️ Exporting wallpaper image...");
      const wallpaperBlob = await wallpaperRef.current.exportImage({
        format: "png",
        quality: 0.8,
        scale: 1,
      });

      console.log("🖼️ Wallpaper exported, creating image...");
      // Convert blob to image
      const wallpaperImage = new Image();
      
      await new Promise((resolve, reject) => {
        wallpaperImage.onload = async () => {
          console.log("🖼️ Wallpaper image loaded successfully");
          await setupBasicScene(wallpaperImage);
          setIsReady(true);
          resolve();
        };
        wallpaperImage.onerror = async () => {
          console.log("🖼️ Failed to load wallpaper image, using fallback");
          await setupBasicScene(null);
          setIsReady(true);
          resolve(); // Don't reject, just use fallback
        };
        wallpaperImage.src = URL.createObjectURL(wallpaperBlob);
      });
    } catch (error) {
      console.log("🖼️ Failed to create thumbnail from wallpaper:", error);
      await setupBasicScene(null);
      setIsReady(true);
    }
    console.log("✅ createThumbnail function completed, thumbnail is ready");
  };

  const setupBasicScene = async (wallpaperImage) => {
    const qrYPercent = qrConfig.positionPercentages.y;
    const aspectRatio = deviceInfo.size.y / deviceInfo.size.x;
    const PHONE_WIDTH = THUMBNAIL_WIDTH * 0.3525;
    const PHONE_HEIGHT = PHONE_WIDTH * aspectRatio;
    const qrOffset = (0.5 - qrYPercent) * PHONE_HEIGHT;
    const strokeWidth = PHONE_WIDTH * 0.075;
    const phoneX =
      THUMBNAIL_WIDTH - (PHONE_WIDTH + strokeWidth) - THUMBNAIL_PADDING;
    const phoneY = (THUMBNAIL_HEIGHT - PHONE_HEIGHT) / 2 + qrOffset;

    const app = appRef.current;
    if (!app) {
      console.error("❌ No app in setupBasicScene");
      return;
    }

    app.stage.removeChildren();

    // Create stage mask to clip everything to thumbnail bounds
    const stageMask = new Graphics();
    stageMask.rect(0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
    stageMask.fill(0xffffff);
    app.stage.mask = stageMask;

    const background = new Graphics();
    background.rect(0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
    background.fill(`${dark ? "#232323" : "#F0F0F0"}`);
    app.stage.addChild(background);

    const text = new Text("MADE WITH", {
      fontFamily: "Rubik",
      fontSize: `${THUMBNAIL_TEXT_SIZE}px`,
      fontWeight: "800",
      fill: `${!dark ? "#000000" : "#FFFFFF"}`,
    });
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

        const image = new Image();

        const logoTexture = await new Promise((resolve, reject) => {
          image.onload = () => {
            try {
              const source = new ImageSource({ resource: image });
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

    try {
      const logoTexture = await loadColoredLogo(
        qrConfig?.custom?.primaryColor || "#FC6524"
      );

      if (!logoTexture) {
        throw new Error("Logo texture is null");
      }

      const logoSprite = new Sprite(logoTexture);
      const desiredHeight = THUMBNAIL_HEIGHT * 0.5;
      const scale = desiredHeight / 525;
      logoSprite.scale.set(scale);

      logoSprite.x = THUMBNAIL_PADDING * 1.2;
      logoSprite.y = THUMBNAIL_HEIGHT * 0.3375;

      const logoScale = (THUMBNAIL_HEIGHT * 0.3) / logoSprite.height;
      logoSprite.scale.set(logoScale);

      app.stage.addChild(logoSprite);
    } catch (error) {
      console.error("❌ Failed to load logo:", error);
    }

    const phoneShadow = new Graphics();
    phoneShadow.roundRect(
      phoneX - strokeWidth / 2 - 25,
      phoneY - strokeWidth / 2 - 25,
      PHONE_WIDTH + strokeWidth + 50,
      PHONE_HEIGHT + strokeWidth + 50,
      THUMBNAIL_HEIGHT * 0.1
    );
    phoneShadow.fill({ color: 0x000000, alpha: 0.025 });
    app.stage.addChild(phoneShadow);

    const phoneFrame = new Graphics();
    phoneFrame.roundRect(
      phoneX - strokeWidth / 2,
      phoneY - strokeWidth / 2,
      PHONE_WIDTH + strokeWidth,
      PHONE_HEIGHT + strokeWidth,
      THUMBNAIL_HEIGHT * 0.075
    );
    phoneFrame.stroke({ color: 0x000000, width: strokeWidth });
    phoneFrame.fill(0x000000);
    app.stage.addChild(phoneFrame);

    // Phone screen content
    if (wallpaperImage) {
      try {
        const wallpaperSource = new ImageSource({ resource: wallpaperImage });
        const wallpaperTexture = new Texture({ source: wallpaperSource });
        const wallpaperSprite = new Sprite(wallpaperTexture);

        const scaleX = PHONE_WIDTH / wallpaperImage.width;
        const scaleY = PHONE_HEIGHT / wallpaperImage.height;
        const scale = Math.max(scaleX, scaleY);

        wallpaperSprite.scale.set(scale);
        wallpaperSprite.x = phoneX;
        wallpaperSprite.y = phoneY;

        const phoneMask = new Graphics();
        phoneMask.roundRect(
          phoneX,
          phoneY,
          PHONE_WIDTH,
          PHONE_HEIGHT,
          THUMBNAIL_HEIGHT * 0.06
        );
        phoneMask.fill(0xffffff);

        wallpaperSprite.mask = phoneMask;

        app.stage.addChild(wallpaperSprite);
        app.stage.addChild(phoneMask);
      } catch (error) {
        console.error("Failed to create wallpaper sprite:", error);
        const phoneScreen = new Graphics();
        phoneScreen.rect(phoneX, phoneY, PHONE_WIDTH, PHONE_HEIGHT);
        phoneScreen.fill(0xcccccc);
        app.stage.addChild(phoneScreen);
      }
    } else {
      console.log("🔴 Fallback phone screen");
      const phoneScreen = new Graphics();
      phoneScreen.rect(phoneX, phoneY, PHONE_WIDTH, PHONE_HEIGHT);
      phoneScreen.fill(0xf0f0f0);
      app.stage.addChild(phoneScreen);
    }

    app.stage.addChild(stageMask);
    
    // Force render to ensure everything is drawn
    app.render();
    
    // Wait a frame to ensure render is complete
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    console.log("✅ Basic scene setup complete, stage has", app.stage.children.length, "children");
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
          width: THUMBNAIL_WIDTH,
          height: THUMBNAIL_HEIGHT,
          backgroundColor: 0x000000,
          antialias: true,
          preference: "webgl",
          powerPreference: "default",
        });

        console.log("✅ Pixi app initialized", {
          rendererSize: `${app.renderer.width}x${app.renderer.height}`,
          canvasSize: `${app.canvas.width}x${app.canvas.height}`,
        });

        if (containerRef.current) {
          containerRef.current.innerHTML = "";
          containerRef.current.appendChild(app.canvas);

          app.canvas.style.width = `${THUMBNAIL_WIDTH * THUMBNAIL_SCALE}px`;
          app.canvas.style.height = `${THUMBNAIL_HEIGHT * THUMBNAIL_SCALE}px`;

          console.log("✅ Canvas added to DOM");
        }

        appRef.current = app;

        // Setup scene immediately
        await createThumbnail();
      } catch (error) {
        console.error("❌ Failed to initialize Pixi app:", error);
        setIsReady(true); // Set ready even on error to prevent hanging
      }
    };

    initApp();

    return () => {
      if (appRef.current) {
        console.log("🧹 Cleaning up Pixi app");
        appRef.current.destroy(true);
        appRef.current = null;
      }
      setIsReady(false);
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
      {/* Show loading indicator while not ready */}
      {!isReady && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "var(--text-secondary)",
            fontSize: "12px",
            pointerEvents: "none",
          }}
        >
          Rendering...
        </div>
      )}
    </div>
  );
});

export default Thumbnail;