import { Graphics, Container } from "pixi.js";

export class Transformer extends Container {
  constructor(options = {}) {
    super();
    
    this.target = null;
    this.selectionBorder = new Graphics();
    this.addChild(this.selectionBorder);
    
    // Store options for styling
    this.lineColor = options.lineColor || 0x7ed03b;
    this.handleColor = options.handleColor || 0xffffff;
    this.handleSize = options.handleSize || 12;
    
    this.visible = false;
  }
  
  attachTo(target) {
    console.log("🎯 Attaching to target:", target);
    this.target = target;
    this.visible = true;
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
    
    const bounds = this.target.getBounds();
    console.log("🎯 Target bounds:", bounds);
    
    // ✅ Position the transformer to follow the target
    this.x = this.target.x;
    this.y = this.target.y;
    
    // ✅ Clear and redraw with correct size
    this.selectionBorder.clear();
    this.selectionBorder
      .rect(
        -bounds.width / 2 - 10,  // Center the rectangle
        -bounds.height / 2 - 10, 
        bounds.width + 20,       // Make it slightly bigger than the QR
        bounds.height + 20
      )
      .stroke({ color: this.lineColor, width: 5 });
    
    console.log("📐 Border updated - size:", bounds.width, bounds.height);
  }
  
  // ✅ Add a method to update position when target moves
  updatePosition() {
    if (this.target && this.visible) {
      this.x = this.target.x;
      this.y = this.target.y;
    }
  }
  
  destroy() {
    this.detach();
    super.destroy();
  }
}