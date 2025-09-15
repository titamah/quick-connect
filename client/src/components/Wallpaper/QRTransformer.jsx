import { Graphics, Container } from "pixi.js";

export class Transformer extends Container {
  constructor(options = {}) {
    super();
    
    this.target = null;
    this.qrSize = 0;
    this.borderSize = 0;
    this.selectionBorder = new Graphics();
    this.addChild(this.selectionBorder);
    
    this.rotationLine = new Graphics();
    this.addChild(this.rotationLine);
    
    this.rotationHandle = new Graphics();
    this.addChild(this.rotationHandle);
    
    // Store options for styling
    this.lineColor = options.lineColor || 0x7ed03b;
    this.handleColor = options.handleColor || 0xffffff;
    this.handleSize = options.handleSize || 60;
    
    this.cornerHandles = [];
    this.createCornerHandles();
    this.createRotationHandle();
    
    // ✅ Track active drag sessions to prevent overlaps
    this.activeDrag = null;
    
    this.visible = false;
  }
  
  createCornerHandles() {
    for (let i = 0; i < 4; i++) {
      const handle = new Graphics();
      handle
        .rect(-this.handleSize / 2, -this.handleSize / 2, this.handleSize, this.handleSize)
        .fill({ color: this.handleColor })
        .stroke({ color: this.lineColor, width: 1 });
      
      handle.eventMode = 'static';
      handle.cursor = 'pointer';
      handle.handleIndex = i;
      
      this.setupHandleDrag(handle);
      
      this.cornerHandles.push(handle);
      this.addChild(handle);
    }
  }
  
  createRotationHandle() {
    this.rotationHandle
      .circle(0, 0, this.handleSize / 2)
      .fill({ color: this.handleColor })
      .stroke({ color: this.lineColor, width: 1 });
    
    this.rotationHandle.eventMode = 'static';
    this.rotationHandle.cursor = 'pointer';
    
    this.setupRotationDrag();
  }
  
  // ✅ Guaranteed cleanup function
  cleanupActiveDrag() {
    if (this.activeDrag) {
      const { stage, onMove, onUp } = this.activeDrag;
      
      console.log("🧹 Cleaning up active drag session");
      
      // Remove all possible event listeners
      if (stage && onMove && onUp) {
        stage.off('globalpointermove', onMove);
        stage.off('globalpointerup', onUp);
        stage.off('pointerupoutside', onUp);
        stage.off('pointermove', onMove); // Backup cleanup
        stage.off('pointerup', onUp);     // Backup cleanup
      }
      
      this.activeDrag = null;
    }
  }
  
  setupHandleDrag(handle) {
    handle.on('pointerdown', (event) => {
      event.stopPropagation();
      
      // ✅ Clean up any existing drag before starting new one
      this.cleanupActiveDrag();
      
      const centerPoint = { x: this.target.x, y: this.target.y };
      const initialScale = this.target.scale.x;
      const initialGlobalPos = { x: event.global.x, y: event.global.y };
      
      const initialDistance = Math.sqrt(
        Math.pow(initialGlobalPos.x - centerPoint.x, 2) + 
        Math.pow(initialGlobalPos.y - centerPoint.y, 2)
      );
      
      const minDistance = 20;
      const safeInitialDistance = Math.max(initialDistance, minDistance);
      
      console.log("🎯 Professional scale drag started", { 
        initialScale, 
        initialDistance: safeInitialDistance,
        handleIndex: handle.handleIndex
      });
      
      this.emit('transformstart');
      
      // ✅ Create stable function references
      const onMove = (event) => {
        const currentDistance = Math.sqrt(
          Math.pow(event.global.x - centerPoint.x, 2) + 
          Math.pow(event.global.y - centerPoint.y, 2)
        );
        
        const safeCurrentDistance = Math.max(currentDistance, minDistance);
        const distanceRatio = safeCurrentDistance / safeInitialDistance;
        const newScale = Math.max(0.1, Math.min(2.0, initialScale * distanceRatio));
        
        this.target.scale.set(newScale, newScale);
        this.updateBorder();
        this.emit('transform', { scale: newScale });
      };
      
      const onUp = (event) => {
        console.log("🎯 Scale drag ended via:", event.type);
        
        // ✅ Use the cleanup function
        this.cleanupActiveDrag();
        this.emit('transformend');
      };
      
      const stage = this.target.parent;
      if (stage) {
        // ✅ Store drag session info for guaranteed cleanup
        this.activeDrag = { stage, onMove, onUp, type: 'scale' };
        
        // ✅ Add multiple event types for better coverage
        stage.on('globalpointermove', onMove);
        stage.on('globalpointerup', onUp);
        stage.on('pointerupoutside', onUp);
        
        // ✅ Add backup listeners in case global events fail
        stage.on('pointermove', onMove);
        stage.on('pointerup', onUp);
      }
    });
  }
  
  // ✅ Rotation snapping helper
  snapRotation(rotation) {
    const snapAngle = Math.PI / 4;
    const snapThreshold = Math.PI / 36;
    
    // Find the nearest snap point
    const nearestSnap = Math.round(rotation / snapAngle) * snapAngle;
    
    // Check if we're within the threshold
    const distanceToSnap = Math.abs(rotation - nearestSnap);
    
    if (distanceToSnap <= snapThreshold) {
      return {
        rotation: nearestSnap,
        snapped: true,
        snapDegrees: (nearestSnap * 180 / Math.PI) % 360
      };
    }
    
    return {
      rotation: rotation,
      snapped: false,
      snapDegrees: null
    };
  }

  setupRotationDrag() {
    this.rotationHandle.on('pointerdown', (event) => {
      event.stopPropagation();
      
      // ✅ Clean up any existing drag before starting new one
      this.cleanupActiveDrag();
      
      const centerPoint = { x: this.target.x, y: this.target.y };
      const initialRotation = this.target.rotation;
      
      const initialAngle = Math.atan2(
        event.global.y - centerPoint.y,
        event.global.x - centerPoint.x
      );
      
      console.log("🔄 Professional rotation drag started", { 
        initialRotation, 
        initialAngle: (initialAngle * 180 / Math.PI).toFixed(1) + "°"
      });
      
      this.emit('transformstart');
      
      // ✅ Create stable function references
      const onRotateMove = (event) => {
        const currentAngle = Math.atan2(
          event.global.y - centerPoint.y,
          event.global.x - centerPoint.x
        );
        
        let angleDelta = currentAngle - initialAngle;
        
        // Handle angle wrapping
        while (angleDelta > Math.PI) angleDelta -= 2 * Math.PI;
        while (angleDelta < -Math.PI) angleDelta += 2 * Math.PI;
        
        const rawRotation = initialRotation + angleDelta;
        
        // ✅ Apply rotation snapping
        const snapResult = this.snapRotation(rawRotation);
        const newRotation = snapResult.rotation;
        
        // ✅ Visual feedback for snapping
        if (snapResult.snapped) {
          console.log(`🧲 Snapped to ${snapResult.snapDegrees}°`);
          // You could add visual feedback here (like changing handle color)
          this.rotationHandle.tint = 0x7ed03b; // Green when snapped
        } else {
          this.rotationHandle.tint = 0xffffff; // White when free
        }
        
        this.target.rotation = newRotation;
        this.updateBorder();
        this.emit('transform', { 
          rotation: newRotation, 
          snapped: snapResult.snapped,
          snapDegrees: snapResult.snapDegrees 
        });
      };
      
      const onRotateUp = (event) => {
        console.log("🔄 Rotation drag ended via:", event.type);
        
        // ✅ Reset handle color
        this.rotationHandle.tint = 0xffffff;
        
        // ✅ Use the cleanup function
        this.cleanupActiveDrag();
        this.emit('transformend');
      };
      
      const stage = this.target.parent;
      if (stage) {
        // ✅ Store drag session info for guaranteed cleanup
        this.activeDrag = { stage, onMove: onRotateMove, onUp: onRotateUp, type: 'rotation' };
        
        // ✅ Add multiple event types for better coverage
        stage.on('globalpointermove', onRotateMove);
        stage.on('globalpointerup', onRotateUp);
        stage.on('pointerupoutside', onRotateUp);
        
        // ✅ Add backup listeners
        stage.on('pointermove', onRotateMove);
        stage.on('pointerup', onRotateUp);
      }
    });
  }
  
  attachTo(target, deviceInfo, qrConfig) {
    console.log("🎯 Attaching to target:", target);
    
    // ✅ Clean up any active drags when attaching to new target
    this.cleanupActiveDrag();
    
    this.target = target;
    this.visible = true;
    
    this.qrSize = Math.min(deviceInfo.size.x, deviceInfo.size.y);
    this.borderSize = this.qrSize * (qrConfig.custom.borderSizeRatio / 100);
    
    this.updateBorder();
    this.emit('transformstart');
  }
  
  detach() {
    console.log("❌ Detaching from target");
    
    // ✅ Clean up any active drags when detaching
    this.cleanupActiveDrag();
    
    this.target = null;
    this.visible = false;
    this.selectionBorder.clear();
  }
  
  // ✅ Emergency cleanup method you can call manually
  forceCleanup() {
    console.log("🚨 Force cleaning up transformer");
    this.cleanupActiveDrag();
  }
  
  updateBorder() {
    if (!this.target) return;
    
    this.x = this.target.x;
    this.y = this.target.y;
    this.rotation = this.target.rotation;
    this.scale.set(this.target.scale.x, this.target.scale.y);
    
    const totalSize = this.qrSize + this.borderSize;
    
    this.selectionBorder.clear();
    this.selectionBorder
      .rect(
        -totalSize / 2 - 20,
        -totalSize / 2 - 20,
        totalSize + 40,
        totalSize + 40
      )
      .stroke({ color: this.lineColor, width: 12 });
    
    this.rotationLine.clear();
    this.rotationLine
      .moveTo(0, -totalSize / 2 - 20)
      .lineTo(0, -totalSize / 2 - 160)
      .stroke({ color: this.lineColor, width: 12 });
    
    this.updateCornerHandles(totalSize);
    this.rotationHandle.position.set(0, -totalSize / 2 - 160);
  }
  
  updateCornerHandles(totalSize) {
    const halfSize = totalSize / 2 + 20;
    
    this.cornerHandles[0].position.set(-halfSize, -halfSize);
    this.cornerHandles[1].position.set(halfSize, -halfSize);
    this.cornerHandles[2].position.set(halfSize, halfSize);
    this.cornerHandles[3].position.set(-halfSize, halfSize);
  }
  
  updatePosition() {
    if (this.target && this.visible) {
      this.x = this.target.x;
      this.y = this.target.y;
      this.rotation = this.target.rotation;
      this.scale.set(this.target.scale.x, this.target.scale.y);
    }
  }
  
  destroy() {
    // ✅ Clean up everything before destroying
    this.cleanupActiveDrag();
    this.detach();
    super.destroy();
  }
}