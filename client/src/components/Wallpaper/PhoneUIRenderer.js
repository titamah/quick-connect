import { Container, Graphics, Text, TextStyle, BlurFilter } from "pixi.js";

export class PhoneUIRenderer {
  constructor(app, deviceSize) {
    this.app = app;
    this.deviceSize = deviceSize;
    this.container = new Container();
    this.container.zIndex = 2000; // Above QR and background
    this.container.visible = false;
    this.container.alpha = 0;
    
    // UI Elements
    this.statusBar = null;
    this.timeDisplay = null;
    this.notificationPanel = null;
    this.homeIndicator = null;
    
    // Blur filter for glassmorphism effect
    this.blurFilter = new BlurFilter({
      strength: 8,
      quality: 4,
      kernelSize: 5
    });
    
    this.app.stage.addChild(this.container);
    this.createPhoneUI();
  }

  createPhoneUI() {
    this.createStatusBar();
    this.createTimeDisplay();
    this.createNotificationPanel();
    this.createHomeIndicator();
  }

  createStatusBar() {
    const statusBar = new Container();
    statusBar.y = this.deviceSize.y * 0.01;

    // Dynamic island / notch
    const notch = new Graphics();
    const notchWidth = this.deviceSize.x * 0.3;
    const notchHeight = this.deviceSize.x * 0.065;
    const notchRadius = this.deviceSize.x * 0.15;
    
    notch.roundRect(
      this.deviceSize.x / 2 - notchWidth / 2,
      0,
      notchWidth,
      notchHeight,
      notchRadius
    );
    notch.fill({ color: 0x000000, alpha: 0.9 });

    // Status icons container
    const statusIcons = new Container();
    statusIcons.x = this.deviceSize.x * 0.05;
    statusIcons.y = this.deviceSize.y * 0.015;

    // Time in status bar (left side)
    const timeStyle = new TextStyle({
      fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif",
      fontSize: this.deviceSize.x * 0.04,
      fill: 0xffffff,
      fontWeight: "600"
    });
    
    const timeText = new Text({
      text: "9:41",
      style: timeStyle
    });
    timeText.anchor.set(0, 0.5);
    timeText.y = this.deviceSize.y * 0.025;

    // Signal bars
    const signalContainer = new Container();
    signalContainer.x = this.deviceSize.x * 0.72;
    signalContainer.y = this.deviceSize.y * 0.0175;
    
    for (let i = 0; i < 4; i++) {
      const bar = new Graphics();
      const barWidth = this.deviceSize.x * 0.008;
      const barHeight = this.deviceSize.x * (0.01 + i * 0.008);
      const barX = i * this.deviceSize.x * 0.015;
      
      bar.rect(barX, this.deviceSize.x * 0.0375 - barHeight, barWidth, barHeight);
      bar.fill({ 
        color: 0xffffff, 
        alpha: i < 3 ? 1 : 0.3 // Show 3/4 bars
      });
      signalContainer.addChild(bar);
    }

    // Battery indicator
    const batteryContainer = new Container();
    batteryContainer.x = this.deviceSize.x * 0.82;
    batteryContainer.y = this.deviceSize.y * 0.0175;

    const batteryBody = new Graphics();
    const batteryWidth = this.deviceSize.x * 0.06;
    const batteryHeight = this.deviceSize.x * 0.025;
    
    // Battery outline
    batteryBody.roundRect(0, 0, batteryWidth, batteryHeight, this.deviceSize.x * 0.004);
    batteryBody.stroke({ color: 0xffffff, width: this.deviceSize.x * 0.002, alpha: 0.6 });
    
    // Battery fill (80% charged)
    const batteryFill = new Graphics();
    batteryFill.roundRect(
      this.deviceSize.x * 0.002, 
      this.deviceSize.x * 0.002, 
      batteryWidth * 0.8 - this.deviceSize.x * 0.004, 
      batteryHeight - this.deviceSize.x * 0.004, 
      this.deviceSize.x * 0.002
    );
    batteryFill.fill({ color: 0xffffff });
    
    // Battery tip
    const batteryTip = new Graphics();
    batteryTip.roundRect(
      batteryWidth + this.deviceSize.x * 0.001,
      batteryHeight * 0.3,
      this.deviceSize.x * 0.003,
      batteryHeight * 0.4,
      this.deviceSize.x * 0.001
    );
    batteryTip.fill({ color: 0xffffff, alpha: 0.6 });

    batteryContainer.addChild(batteryBody);
    batteryContainer.addChild(batteryFill);
    batteryContainer.addChild(batteryTip);

    statusBar.addChild(notch);
    statusBar.addChild(timeText);
    statusBar.addChild(signalContainer);
    statusBar.addChild(batteryContainer);

    this.container.addChild(statusBar);
    this.statusBar = statusBar;
  }

  createTimeDisplay() {
    const timeContainer = new Container();
    timeContainer.y = this.deviceSize.y / 6;

    const timeStyle = new TextStyle({
      fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif",
      fontSize: this.deviceSize.x * 0.28,
      fill: 0xffffff,
      fontWeight: "200",
      stroke: { color: 0xffffff, width: this.deviceSize.x * 0.002 }
    });

    const currentTime = new Date();
    const timeString = currentTime.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });

    const timeText = new Text({
      text: timeString,
      style: timeStyle
    });
    
    timeText.anchor.set(0.5, 0);
    timeText.x = this.deviceSize.x / 2;

    timeContainer.addChild(timeText);
    this.container.addChild(timeContainer);
    this.timeDisplay = timeContainer;

    // Update time every minute
    this.timeInterval = setInterval(() => {
      const newTime = new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      timeText.text = newTime;
    }, 60000);
  }

  createNotificationPanel() {
    const notificationContainer = new Container();
    notificationContainer.y = this.deviceSize.y * 0.75;

    // Glassmorphism background
    const panelBG = new Graphics();
    const panelWidth = this.deviceSize.x * 0.9;
    const panelHeight = this.deviceSize.y * 0.16;
    const panelX = this.deviceSize.x * 0.05;
    const cornerRadius = this.deviceSize.x * 0.045;

    // Create blur background
    panelBG.roundRect(panelX, 0, panelWidth, panelHeight, cornerRadius);
    panelBG.fill({ 
      color: 0xffffff, 
      alpha: 0.15 
    });
    panelBG.stroke({ 
      color: 0xffffff, 
      width: this.deviceSize.x * 0.002, 
      alpha: 0.3 
    });

    // Apply blur filter for glassmorphism
    panelBG.filters = [this.blurFilter];

    // App icon
    const appIcon = new Graphics();
    const iconSize = this.deviceSize.y * 0.08;
    const iconX = this.deviceSize.x * 0.1;
    const iconY = this.deviceSize.x * 0.04;
    
    appIcon.roundRect(iconX, iconY, iconSize, iconSize, this.deviceSize.x * 0.02);
    appIcon.fill({ color: 0xF0F66E });

    // Notification text
    const titleStyle = new TextStyle({
      fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif",
      fontSize: this.deviceSize.x * 0.055,
      fill: 0x000000,
      fontWeight: "600"
    });

    const bodyStyle = new TextStyle({
      fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif",
      fontSize: this.deviceSize.x * 0.04,
      fill: 0x000000,
      fontWeight: "400"
    });

    const timeStampStyle = new TextStyle({
      fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif",
      fontSize: this.deviceSize.x * 0.035,
      fill: 0x666666,
      fontWeight: "400"
    });

    const titleText = new Text({
      text: "QRKI",
      style: titleStyle
    });
    titleText.x = iconX + iconSize + this.deviceSize.x * 0.025;
    titleText.y = iconY + this.deviceSize.x * 0.005;

    const bodyText = new Text({
      text: "Your wallpaper looks amazing!",
      style: bodyStyle
    });
    bodyText.x = titleText.x;
    bodyText.y = titleText.y + this.deviceSize.x * 0.06;

    const timeStamp = new Text({
      text: "now",
      style: timeStampStyle
    });
    timeStamp.anchor.set(1, 0);
    timeStamp.x = panelX + panelWidth - this.deviceSize.x * 0.025;
    timeStamp.y = iconY;

    notificationContainer.addChild(panelBG);
    notificationContainer.addChild(appIcon);
    notificationContainer.addChild(titleText);
    notificationContainer.addChild(bodyText);
    notificationContainer.addChild(timeStamp);

    this.container.addChild(notificationContainer);
    this.notificationPanel = notificationContainer;
  }

  createHomeIndicator() {
    const indicatorContainer = new Container();
    indicatorContainer.y = this.deviceSize.y * 0.95;

    const indicator = new Graphics();
    const indicatorWidth = this.deviceSize.x * 0.35;
    const indicatorHeight = this.deviceSize.y * 0.008;
    const indicatorX = this.deviceSize.x / 2 - indicatorWidth / 2;

    indicator.roundRect(
      indicatorX, 
      0, 
      indicatorWidth, 
      indicatorHeight, 
      indicatorHeight / 2
    );
    indicator.fill({ color: 0xffffff, alpha: 0.6 });

    indicatorContainer.addChild(indicator);
    this.container.addChild(indicatorContainer);
    this.homeIndicator = indicatorContainer;
  }

  show(opacity = 1, animate = true) {
    this.container.visible = true;
    
    if (animate) {
      // Smooth fade in animation
      const startAlpha = this.container.alpha;
      const targetAlpha = opacity;
      const duration = 300; // ms
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const eased = 1 - Math.pow(1 - progress, 3);
        
        this.container.alpha = startAlpha + (targetAlpha - startAlpha) * eased;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    } else {
      this.container.alpha = opacity;
    }
  }

  hide(animate = true) {
    if (animate) {
      const startAlpha = this.container.alpha;
      const duration = 200; // ms
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const eased = 1 - Math.pow(1 - progress, 3);
        this.container.alpha = startAlpha * (1 - eased);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.container.visible = false;
        }
      };
      
      requestAnimationFrame(animate);
    } else {
      this.container.alpha = 0;
      this.container.visible = false;
    }
  }

  setOpacity(opacity) {
    this.container.alpha = opacity;
  }

  updateDeviceSize(newSize) {
    this.deviceSize = newSize;
    this.container.removeChildren();
    this.createPhoneUI();
  }

  destroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
    this.container.destroy({ children: true, texture: true });
  }
}