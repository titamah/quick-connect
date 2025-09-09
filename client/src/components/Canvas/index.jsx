import { useEffect, useState, useRef, useMemo, useCallback, Suspense, lazy } from "react";
import { useDevice } from "../../contexts/DeviceContext";
// Removed D3 - using custom zoom/drag implementation
import Konva from "konva";
import { Loader } from "lucide-react";
import PreviewButton from "./PreviewButton";
import UndoRedoButton from "./UndoRedoButton";
import { useStageCalculations } from "../../hooks/useStageCalculations";
import LoadingSpinner from "../LoadingSpinner";

// Lazy load heavy components
const Wallpaper = lazy(() => import("../Wallpaper/index"));
const ShareButton = lazy(() => import("./ShareButton"));

// Import skeleton
import WallpaperSkeleton from "../WallpaperSkeleton";

function Canvas({ isOpen, panelSize, wallpaperRef }) {
  const { device, isMobile } = useDevice();
  const previewRef = useRef(null);
  const canvasRef = useRef(null);
  const backgroundLayerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);
  
  // Custom zoom/drag state
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  // rAF throttling and epsilon guards
  const rafIdRef = useRef(null);
  const pendingTransformRef = useRef({ x: 0, y: 0, scale: 1 });
  const MOVE_EPS = 2; // pixels - more aggressive to reduce micro-updates
  const SCALE_EPS = 0.01; // scale units - more aggressive

  // Keep pending ref in sync with state
  useEffect(() => {
    pendingTransformRef.current = transform;
  }, [transform]);

  const scheduleTransformCommit = useCallback(() => {
    if (rafIdRef.current != null) return;
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      const next = pendingTransformRef.current;
      setTransform(prev => (prev.x !== next.x || prev.y !== next.y || prev.scale !== next.scale ? next : prev));
    });
  }, []);

  const memoizedSetIsZoomEnabled = useCallback(setIsZoomEnabled, []);
  const scale = useStageCalculations(device.size, panelSize, isOpen);

  const previewSize = useMemo(
    () => ({
      x: device.size.x * scale,
      y: device.size.y * scale,
    }),
    [device.size.x, device.size.y, scale]
  );
  const updatePanelSize = useCallback(() => {
    if (!isMobile) {
      document.documentElement.style.setProperty("--panel-height", "0px");
      document.documentElement.style.setProperty(
        "--panel-width",
        `${panelSize.width}px`
      );
    } else {
      document.documentElement.style.setProperty("--panel-width", "0px");
      document.documentElement.style.setProperty(
        "--panel-height",
        `${panelSize.height}px`
      );
    }
  }, [panelSize.width, panelSize.height]);
  // Custom zoom/drag handlers
  const handleMouseDown = useCallback((e) => {
    if (!isZoomEnabled) return;
    setIsDragging(true);
    setIsInteracting(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  }, [isZoomEnabled, transform]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !isZoomEnabled) return;
    const current = pendingTransformRef.current;
    let nextX = e.clientX - dragStart.x;
    let nextY = e.clientY - dragStart.y;
    
    // Clamp translate to keep phone on canvas (rough bounds)
    const maxTranslate = 200;
    nextX = Math.min(Math.max(nextX, -maxTranslate), maxTranslate);
    nextY = Math.min(Math.max(nextY, -maxTranslate), maxTranslate);
    
    if (Math.abs(nextX - current.x) < MOVE_EPS && Math.abs(nextY - current.y) < MOVE_EPS) return;
    pendingTransformRef.current = { ...current, x: nextX, y: nextY };
    scheduleTransformCommit();
  }, [isDragging, isZoomEnabled, dragStart, scheduleTransformCommit]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    // Delay to prevent transition flicker
    setTimeout(() => setIsInteracting(false), 100);
  }, []);

  const handleWheel = useCallback((e) => {
    if (!isZoomEnabled) return;
    e.preventDefault();
    const current = pendingTransformRef.current;
    const delta = e.deltaY * -0.005; // Reduced sensitivity
    // clamp scale and prevent runaway translate by limiting x/y based on scale range
    const newScale = Math.min(Math.max(0.25, current.scale + delta), 3);
    if (Math.abs(newScale - current.scale) < SCALE_EPS) return;
    pendingTransformRef.current = { ...current, scale: newScale };
    scheduleTransformCommit();
  }, [isZoomEnabled, scheduleTransformCommit]);

  const handleDoubleClick = useCallback(() => {
    // Reset to original position/scale with smooth transition
    pendingTransformRef.current = { x: 0, y: 0, scale: 1 };
    scheduleTransformCommit();
  }, [scheduleTransformCommit]);

  // Touch handlers for mobile
  const getTouchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e) => {
    if (!isZoomEnabled) return;
    setIsInteracting(true);
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - transform.x, y: e.touches[0].clientY - transform.y });
    } else if (e.touches.length === 2) {
      setLastTouchDistance(getTouchDistance(e.touches));
    }
  }, [isZoomEnabled, transform]);

  const handleTouchMove = useCallback((e) => {
    if (!isZoomEnabled) return;
    e.preventDefault();
    const current = pendingTransformRef.current;
    if (e.touches.length === 1 && isDragging) {
      let nextX = e.touches[0].clientX - dragStart.x;
      let nextY = e.touches[0].clientY - dragStart.y;
      
      // Clamp translate to keep phone on canvas (rough bounds)
      const maxTranslate = 200;
      nextX = Math.min(Math.max(nextX, -maxTranslate), maxTranslate);
      nextY = Math.min(Math.max(nextY, -maxTranslate), maxTranslate);
      
      if (Math.abs(nextX - current.x) < MOVE_EPS && Math.abs(nextY - current.y) < MOVE_EPS) return;
      pendingTransformRef.current = { ...current, x: nextX, y: nextY };
      scheduleTransformCommit();
    } else if (e.touches.length === 2) {
      const distance = getTouchDistance(e.touches);
      const delta = (distance - lastTouchDistance) * 0.01;
      const newScale = Math.min(Math.max(0.25, current.scale + delta), 3);
      if (Math.abs(newScale - current.scale) >= SCALE_EPS) {
        pendingTransformRef.current = { ...current, scale: newScale };
        scheduleTransformCommit();
      }
      setLastTouchDistance(distance);
    }
  }, [isZoomEnabled, isDragging, dragStart, lastTouchDistance, scheduleTransformCommit]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setLastTouchDistance(0);
    // Delay to prevent transition flicker
    setTimeout(() => setIsInteracting(false), 100);
  }, []);
  const handleResize = useCallback(() => {
    updatePanelSize();
    // Reset zoom on resize
    pendingTransformRef.current = { x: 0, y: 0, scale: 1 };
    scheduleTransformCommit();
  }, [updatePanelSize, scheduleTransformCommit]);
  const handleOutsideClick = useCallback(
    (event) => {
      try {
        if (
          isZoomEnabled &&
          previewRef?.current &&
          previewRef.current.contains &&
          !previewRef.current.contains(event.target)
        ) {
          setIsZoomEnabled(false);
        }
      } catch (error) {
        console.warn("Error in handleOutsideClick:", error);
      }
    },
    [isZoomEnabled]
  );
  const getBackgroundImage = useCallback(async () => {
    if (!backgroundLayerRef?.current) {
      throw new Error("Background layer reference not available");
    }
    if (!wallpaperRef?.current) {
      throw new Error("Wallpaper stage reference not available");
    }
    try {
      const stage = wallpaperRef.current;
      const backgroundLayer = backgroundLayerRef.current;
      console.log("Using direct background layer reference:", backgroundLayer);
      const tempStage = new Konva.Stage({
        container: document.createElement("div"),
        width: stage.width(),
        height: stage.height(),
      });
      const clonedLayer = backgroundLayer.clone();
      tempStage.add(clonedLayer);
      const dataURL = tempStage.toDataURL({
        mimeType: "image/png",
        quality: 0.8,
        pixelRatio: 1,
      });
      tempStage.destroy();
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = dataURL;
      });
    } catch (error) {
      console.error("Error generating background image:", error);
      throw error;
    }
  }, [wallpaperRef, backgroundLayerRef]);
  useEffect(() => {
    updatePanelSize();
    setIsLoading(false);
  }, [updatePanelSize]);
  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;

    // Add custom event listeners
    canvasElement.addEventListener("mousedown", handleMouseDown);
    canvasElement.addEventListener("mousemove", handleMouseMove);
    canvasElement.addEventListener("mouseup", handleMouseUp);
    canvasElement.addEventListener("wheel", handleWheel, { passive: false });
    canvasElement.addEventListener("dblclick", handleDoubleClick);
    
    // Touch events for mobile
    canvasElement.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvasElement.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvasElement.addEventListener("touchend", handleTouchEnd);
    
    window.addEventListener("resize", handleResize);
    updatePanelSize();
    
    return () => {
      window.removeEventListener("resize", handleResize);
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
      
      // Remove custom event listeners
      canvasElement.removeEventListener("mousedown", handleMouseDown);
      canvasElement.removeEventListener("mousemove", handleMouseMove);
      canvasElement.removeEventListener("mouseup", handleMouseUp);
      canvasElement.removeEventListener("wheel", handleWheel);
      canvasElement.removeEventListener("dblclick", handleDoubleClick);
      canvasElement.removeEventListener("touchstart", handleTouchStart);
      canvasElement.removeEventListener("touchmove", handleTouchMove);
      canvasElement.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, handleWheel, handleDoubleClick, handleTouchStart, handleTouchMove, handleTouchEnd, handleResize, updatePanelSize]);
  useEffect(() => {
    if (previewRef.current) {
      document.addEventListener("click", handleOutsideClick);
      return () => {
        document.removeEventListener("click", handleOutsideClick);
      };
    }
  }, [handleOutsideClick]);
  const canvasStyles = useMemo(
    () => ({
      width: isMobile
        ? "100%"
        : isOpen
        ? "calc(100% - var(--panel-width))"
        : "100%",
      height: "100%",
    }),
    [isOpen, isMobile]
  );
  const previewStyles = useMemo(
    () => ({
      transition: !isInteracting && transform.scale === 1 && transform.x === 0 && transform.y === 0 
        ? "all 0.75s ease-in-out" // Smooth transition when resetting
        : "none", // No transition during drag/zoom for responsiveness
      outline: isZoomEnabled ? "2px solid #7ED03B" : "none",
      outlineOffset: "30px",
      transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
      transformOrigin: "center center",
      willChange: isInteracting ? "transform" : "auto", // Optimize for transforms during interaction
    }),
    [isZoomEnabled, transform, isInteracting]
  );
  const figureStyles = useMemo(
    () => ({
      position: "relative",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      outline: `${Math.max(1, previewSize.x * 0.05)}px solid black`,
      borderRadius: `${Math.max(20, previewSize.x * 0.1)}px`,
      backgroundColor: "rgba(0,0,0,0)",
      overflow: "hidden",
    }),
    [previewSize.x, previewSize.y]
  );
  return (
    <div
      className={`
        ${!isMobile ? "h-[calc(100%-60px)] bottom-0 w-[calc(100%-64px)] right-0" : "h-[calc(100%-90px)] bottom-[50px] w-screen"} 
      absolute
      overflow-y-hidden
          bg-[var(--bg-main)]
          bg-[image:repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] 
          bg-[size:10px_10px] 
          bg-fixed 
          [--pattern-fg:var(--bg-secondary)]
          z-0
          pointer-events-auto 
    `}
    >
      <div
        id="Canvas"
        ref={canvasRef}
        className={`
          h-full
          flex
          z-0
          relative
          duration-300 ease-in-ease-out
          ml-auto
          items-center 
          justify-center
          pointer-events-auto
        `}
        style={canvasStyles}
      >
        <PreviewButton />
        <UndoRedoButton />
        <Suspense fallback={<LoadingSpinner size="small" variant="logo" />}>
          <ShareButton
            wallpaperRef={wallpaperRef}
            getBackgroundImage={getBackgroundImage}
            backgroundLayerRef={backgroundLayerRef}
          />
        </Suspense>
        <span
          ref={previewRef}
          className="transition-all duration-150 ease-linear"
          style={previewStyles}
        >
          <figure
            className="flex items-center justify-center pointer-events-auto z-1"
            style={figureStyles}
          >
            {isLoading ? (
              <div
                className="bg-[var(--bg-secondary)] rounded-[1.25rem] flex"
                style={{
                  height: `${previewSize.y}px`,
                  width: `${previewSize.x}px`,
                }}
              >
                <div
                  className="animate-spin m-auto size-12 border-[4px] border-current border-t-transparent text-[var(--accent)] rounded-full "
                  role="status"
                  aria-label="loading"
                ></div>
              </div>
            ) : (
              <Suspense fallback={<WallpaperSkeleton previewSize={previewSize} />}>
                <Wallpaper
                  ref={wallpaperRef}
                  panelSize={panelSize}
                  isOpen={isOpen}
                  locked={!isZoomEnabled}
                  setIsZoomEnabled={memoizedSetIsZoomEnabled}
                  backgroundLayerRef={backgroundLayerRef}
                />
              </Suspense>
            )}
          </figure>
        </span>
      </div>
    </div>
  );
}
export default Canvas;
