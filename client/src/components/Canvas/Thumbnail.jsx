import React, {
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useState, // ADDED
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
  const [isRenderComplete, setIsRenderComplete] = useState(false); // ADDED

  const exportAsBlob = async (options = {}) => {
    const { quality = 0.8, format = "image/webp" } = options;

    // ADDED: Wait for rendering to complete
    console.log("🖼️ Waiting for thumbnail render to complete...");
    let waitAttempts = 0;
    while (!isRenderComplete && waitAttempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      waitAttempts++;
    }
    
    if (!isRenderComplete) {
      console.warn("⚠️ Thumbnail render timeout, exporting anyway");
    } else {
      console.log("✅ Thumbnail render complete, exporting...");
    }
    // END ADDED

    // Wait for app to be fully ready
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max wait
    while (attempts < maxAttempts && !appRef.current) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    if (!appRef.current) {
      throw new Error("Thumbnail not ready for export - app never initialized");
    }

    try {
      console.log("🖼️ Starting thumbnail export...");
      
      // Wait for stage to have content (don't call createThumbnail again)
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max wait
      
      while (attempts < maxAttempts && appRef.current.stage.children.length === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
        console.log(`🖼️ Waiting for stage content... attempt ${attempts}/${maxAttempts}`);
      }
      
      if (appRef.current.stage.children.length === 0) {
        throw new Error("Stage never populated with content");
      }
      
      console.log("🖼️ Stage has content, proceeding with export");
      
      // Force a render before extracting
      appRef.current.renderer.render(appRef.current.stage);
      console.log("🖼️ Render completed");
      
      const canvas = appRef.current.renderer.extract.canvas(
        appRef.current.stage
      );

      console.log("🖼️ Thumbnail export - Stage children:", appRef.current.stage.children.length);
      console.log("🖼️ Thumbnail export - Canvas size:", canvas.width, "x", canvas.height);

      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to export thumbnail"));
              return;
            }
            console.log("🖼️ Thumbnail blob size:", blob.size, "bytes");
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

  const createThumbnail = async () => {
    console.log("🖼️ createThumbnail called");
    setIsRenderComplete(false); // ADDED: Reset on new render
    
    if (!wallpaperRef.current.exportImage) {
      console.log("🖼️ exportImage not ready, using fallback");
      setupBasicScene(null);
      return;
    }
    if (!appRef.current) {
      console.log("🖼️ app ref not ready, using fallback");
      setupBasicScene(null);
      return;
    }

    try {
      // Export the main wallpaper at a reasonable size for thumbnail
      console.log("🖼️ Exporting wallpaper image...");
      const wallpaperBlob = await wallpaperRef.current.exportImage({
        format: "png",
        quality: 0.8,
        scale: 1, // Smaller for performance
      });

      console.log("🖼️ Wallpaper exported, creating image...");
      // Convert blob to image
      const wallpaperImage = new Image();
      
      await new Promise((resolve, reject) => {
        wallpaperImage.onload = () => {
          console.log("🖼️ Wallpaper image loaded successfully");
          setupBasicScene(wallpaperImage);
          resolve();
        };
        wallpaperImage.onerror = () => {
          console.log("🖼️ Failed to load wallpaper image, using fallback");
          setupBasicScene(null);
          resolve(); // Don't reject, just use fallback
        };
        wallpaperImage.src = URL.createObjectURL(wallpaperBlob);
      });
    } catch (error) {
      console.log("🖼️ Failed to create thumbnail from wallpaper:", error);
      setupBasicScene(null);
    }
    console.log("🖼️ createThumbnail function completed");
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
      phoneX - strokeWidth / 2 - 25, // Offset shadow slightly
      phoneY - strokeWidth / 2 - 25,
      PHONE_WIDTH + strokeWidth + 50,
      PHONE_HEIGHT + strokeWidth + 50,
      THUMBNAIL_HEIGHT * 0.1
    );
    phoneShadow.fill({ color: 0x000000, alpha: 0.025 }); // Semi-transparent black
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
    phoneFrame.fill({alpha:0});
    app.stage.addChild(phoneFrame);

    // Phone screen content
    if (wallpaperImage) {
      try {
        // Create ImageSource and Texture manually for the wallpaper
        const wallpaperSource = new ImageSource({ resource: wallpaperImage });
        const wallpaperTexture = new Texture({ source: wallpaperSource });
        const wallpaperSprite = new Sprite(wallpaperTexture);

        // Scale to fit phone screen (cover the entire screen)
        const scaleX = PHONE_WIDTH / wallpaperImage.width;
        const scaleY = PHONE_HEIGHT / wallpaperImage.height;
        const scale = Math.max(scaleX, scaleY); // Cover entire screen

        wallpaperSprite.scale.set(scale);
        wallpaperSprite.x = phoneX;
        wallpaperSprite.y = phoneY;

        // Create clipping mask for phone screen
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
        // Fallback to gray screen
        const phoneScreen = new Graphics();
        phoneScreen.rect(phoneX, phoneY, PHONE_WIDTH, PHONE_HEIGHT);
        phoneScreen.fill(0xcccccc);
        app.stage.addChild(phoneScreen);
      }
    } else {
      // Fallback phone screen
      console.log("🔴 Fallback phone screen for some reason");
      const phoneScreen = new Graphics();
      phoneScreen.rect(phoneX, phoneY, PHONE_WIDTH, PHONE_HEIGHT);
      phoneScreen.fill(0xf0f0f0);
      app.stage.addChild(phoneScreen);
    }

    // Add stage mask to stage so it's rendered
    app.stage.addChild(stageMask);
    app.render();
    
    // ADDED: Mark render as complete
    setIsRenderComplete(true);
    console.log("✅ Thumbnail render marked as complete");
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
          preference: "webgl", // or 'webgpu'
          powerPreference: "default", // Add this
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
        createThumbnail();
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