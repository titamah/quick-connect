import { Graphics, Container } from "pixi.js";

export class Transformer extends Container {
  constructor(options = {}) {
    super();
    
    this.target = null;
    this.qrSize = 0; // Store the base QR size
    this.borderSize = 0; // Store the border size
    this.selectionBorder = new Graphics();
    this.addChild(this.selectionBorder);
    
    // Store options for styling
    this.lineColor = options.lineColor || 0x7ed03b;
    this.handleColor = options.handleColor || 0xffffff;
    this.handleSize = options.handleSize || 12;
    
    this.visible = false;
  }
  
  attachTo(target, deviceInfo, qrConfig) {
    console.log("🎯 Attaching to target:", target);
    this.target = target;
    this.visible = true;
    
    // ✅ Get the actual QR size and border size (same calculation as in Pixi.jsx)
    this.qrSize = Math.min(deviceInfo.size.x, deviceInfo.size.y);
    this.borderSize = this.qrSize * (qrConfig.custom.borderSizeRatio / 100);
    
    this.updateBorder();
    
    this.emit('transformstart');
  }
  
  detach() {
    console.log("❌ Detaching from target");
    this.target = null;
    this.visible = false;
    this.selectionBorder.clear();
  }
  
  select(target) {
    this.attachTo(target);
  }
  
  deselect() {
    this.detach();
  }
  
  updateBorder() {
    if (!this.target) return;
    
    // ✅ Position the transformer to follow the target
    this.x = this.target.x;
    this.y = this.target.y;
    
    // ✅ Copy the target's rotation AND scale
    this.rotation = this.target.rotation;
    this.scale.set(this.target.scale.x, this.target.scale.y);
    
    // ✅ Use the total size (QR + border) just like in Pixi.jsx
    const totalSize = this.qrSize + this.borderSize;
    
    this.selectionBorder.clear();
    this.selectionBorder
      .rect(
        -totalSize / 2 - 20,   // Use total size (QR + border)
        -totalSize / 2 - 20,   // Same for height
        totalSize + 40,        // Add padding around the total size
        totalSize + 40
      )
      .stroke({ color: this.lineColor, width: 5 });
    
    console.log("📐 Border updated - QR size:", this.qrSize, "border size:", this.borderSize, "total size:", totalSize);
  }
  
  // ✅ Add a method to update position when target moves
  updatePosition() {
    if (this.target && this.visible) {
      this.x = this.target.x;
      this.y = this.target.y;
      this.rotation = this.target.rotation;
      this.scale.set(this.target.scale.x, this.target.scale.y);
    }
  }
  
  destroy() {
    this.detach();
    super.destroy();
  }
}