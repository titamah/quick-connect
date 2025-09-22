import { Graphics, Sprite, Assets, Texture, TilingSprite } from "pixi.js";

export class BackgroundRenderer {
  constructor(app, deviceSize) {
    this.app = app;
    this.deviceSize = deviceSize;
    this.backgroundSprite = null;
    this.grainSprite = null;
    this.canvas = null;
    this.ctx = null;
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.objectUrls = new Set(); // Track object URLs for cleanup
  }

  async renderBackground(background) {
    this.clearBackground();

    switch (background.style) {
      case "solid":
        this.renderSolidBackground(background.color);
        break;
      case "gradient":
        await this.renderGradientBackground(background.gradient);
        break;
      case "image":
        if (background.bg) {
          await this.renderImageBackground(background.bg);
        }
        break;
    }

    if (background.grain) {
      await this.addGrainEffect(background.grain);
    }
  }

  renderSolidBackground(color) {
    const graphics = new Graphics();
    graphics.rect(0, 0, this.deviceSize.x, this.deviceSize.y);
    graphics.fill(color);

    this.backgroundSprite = graphics;
    this.app.stage.addChildAt(this.backgroundSprite, 0);
  }

  async renderGradientBackground(gradient) {
    this.canvas.width = this.deviceSize.x;
    this.canvas.height = this.deviceSize.y;

    let canvasGradient;

    if (gradient.type === "linear") {
      canvasGradient = this.createLinearGradient(gradient);
    } else if (gradient.type === "radial") {
      canvasGradient = this.createRadialGradient(gradient);
    }

    for (let i = 0; i < gradient.stops.length; i += 2) {
      const position = gradient.stops[i];
      const color = gradient.stops[i + 1];
      canvasGradient.addColorStop(position, color);
    }

    this.ctx.fillStyle = canvasGradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const texture = Texture.from(this.canvas, {
      resourceOptions: {
        autoGenerateMipmaps: false,
      },
    });

    texture.source.resource = this.canvas;
    texture.source.update();
    this.backgroundSprite = new Sprite(texture);
    this.app.stage.addChildAt(this.backgroundSprite, 0);
  }

  createLinearGradient(gradient) {
    const { angle } = gradient;
    const { x: width, y: height } = this.deviceSize;

    const angleRad = ((angle - 90) * Math.PI) / 180;

    const centerX = width / 2;
    const centerY = height / 2;

    const gradientLength =
      (Math.abs(Math.cos(angleRad)) * width +
        Math.abs(Math.sin(angleRad)) * height) /
      2;

    const startX = centerX - Math.cos(angleRad) * gradientLength;
    const startY = centerY - Math.sin(angleRad) * gradientLength;
    const endX = centerX + Math.cos(angleRad) * gradientLength;
    const endY = centerY + Math.sin(angleRad) * gradientLength;

    return this.ctx.createLinearGradient(startX, startY, endX, endY);
  }

  createRadialGradient(gradient) {
    const { pos } = gradient;
    const { x: width, y: height } = this.deviceSize;

    const centerX = width * pos.x;
    const centerY = height * pos.y;

    const radius = Math.max(width, height) / 1.5;

    return this.ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      radius
    );
  }

  async renderImageBackground(imageData) {
    try {
      let imageUrl;
      let isObjectUrl = false;
      
      if (imageData instanceof File) {
        imageUrl = URL.createObjectURL(imageData);
        isObjectUrl = true;
        this.objectUrls.add(imageUrl); // Track for cleanup
      } else if (typeof imageData === "string") {
        imageUrl = imageData;
      } else {
        throw new Error("Unsupported image data type");
      }

      const texture = await Assets.load(imageUrl);
      this.backgroundSprite = new Sprite(texture);

      const scaleX = this.deviceSize.x / texture.width;
      const scaleY = this.deviceSize.y / texture.height;
      const scale = Math.max(scaleX, scaleY);

      this.backgroundSprite.scale.set(scale);

      this.backgroundSprite.x = (this.deviceSize.x - texture.width * scale) / 2;
      this.backgroundSprite.y =
        (this.deviceSize.y - texture.height * scale) / 2;

      this.app.stage.addChildAt(this.backgroundSprite, 0);

      // Clean up object URL after texture is loaded
      if (isObjectUrl) {
        URL.revokeObjectURL(imageUrl);
        this.objectUrls.delete(imageUrl);
      }
    } catch (error) {
      console.error("Failed to load background image:", error);
      this.renderSolidBackground("#FFFFFF");
    }
  }

  async addGrainEffect(grain) {
    try {
      const grainTexture = await Assets.load("/grain.jpeg");
      this.grainSprite = new TilingSprite(grainTexture, this.deviceSize.x, this.deviceSize.y);

      this.grainSprite.blendMode = "overlay";
      this.grainSprite.alpha = 0.075 * grain;

      this.app.stage.addChildAt(this.grainSprite, 1);
    } catch (error) {
      console.error("Failed to load grain texture:", error);
    }
  }

  clearBackground() {
    if (this.backgroundSprite) {
      this.app.stage.removeChild(this.backgroundSprite);
      this.backgroundSprite.destroy();
      this.backgroundSprite = null;
    }

    if (this.grainSprite) {
      this.app.stage.removeChild(this.grainSprite);
      this.grainSprite.destroy();
      this.grainSprite = null;
    }
  }

  updateDeviceSize(newSize) {
    this.deviceSize = newSize;
  }

  // Clean up all object URLs
  cleanupObjectUrls() {
    this.objectUrls.forEach(url => {
      URL.revokeObjectURL(url);
    });
    this.objectUrls.clear();
  }

  destroy() {
    // Clean up object URLs first
    this.cleanupObjectUrls();
    
    this.clearBackground();
    if (this.canvas) {
      this.canvas = null;
      this.ctx = null;
    }
  }
}
