import { useEffect, useState, useRef, useMemo, useCallback, Suspense, lazy } from "react";
import { useDevice } from "../../contexts/DeviceContext";
import FullscreenPreview from "../Wallpaper/FullscreenPreview";
import Konva from "konva";
import PreviewButton from "./PreviewButton";
import UndoRedoButton from "./UndoRedoButton";
import { useStageCalculations } from "../../hooks/useStageCalculations";
import LoadingSpinner from "../LoadingSpinner";

// Lazy load heavy components
const Wallpaper = lazy(() => import("../Wallpaper/index"));
const WallpaperPixi = lazy(() => import("../Wallpaper/pixi"));
const ShareButton = lazy(() => import("./ShareButton"));

import WallpaperSkeleton from "../WallpaperSkeleton";

function Canvas({ isOpen, panelSize, wallpaperRef }) {
  const { device, isMobile } = useDevice();
  const previewRef = useRef(null);
  const canvasRef = useRef(null);
  const backgroundLayerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);
  
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState(0);

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

  const handleMouseDown = useCallback((e) => {
    if (!isZoomEnabled) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  }, [isZoomEnabled, transform]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !isZoomEnabled) return;
    setTransform(prev => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    }));
  }, [isDragging, isZoomEnabled, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e) => {
    if (!isZoomEnabled) return;
    e.preventDefault();
    
    const delta = e.deltaY * -0.01;
    const newScale = Math.min(Math.max(0.25, transform.scale + delta), 15);
    
    setTransform(prev => ({
      ...prev,
      scale: newScale
    }));
  }, [isZoomEnabled, transform.scale]);

  const handleDoubleClick = useCallback(() => {
    setTransform({ x: 0, y: 0, scale: 1 });
  }, []);

  const getTouchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e) => {
    if (!isZoomEnabled) return;
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
    
    if (e.touches.length === 1 && isDragging) {
      setTransform(prev => ({
        ...prev,
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      }));
    } else if (e.touches.length === 2) {
      const distance = getTouchDistance(e.touches);
      const delta = (distance - lastTouchDistance) * 0.01;
      const newScale = Math.min(Math.max(0.25, transform.scale + delta), 15);
      
      setTransform(prev => ({
        ...prev,
        scale: newScale
      }));
      setLastTouchDistance(distance);
    }
  }, [isZoomEnabled, isDragging, dragStart, lastTouchDistance, transform.scale]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setLastTouchDistance(0);
  }, []);
  const handleResize = useCallback(() => {
    updatePanelSize();
    // Reset zoom on resize
    setTransform({ x: 0, y: 0, scale: 1 });
  }, [updatePanelSize]);
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

    canvasElement.addEventListener("mousedown", handleMouseDown);
    canvasElement.addEventListener("mousemove", handleMouseMove);
    canvasElement.addEventListener("mouseup", handleMouseUp);
    canvasElement.addEventListener("wheel", handleWheel, { passive: false });
    canvasElement.addEventListener("dblclick", handleDoubleClick);
    
    canvasElement.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvasElement.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvasElement.addEventListener("touchend", handleTouchEnd);
    
    window.addEventListener("resize", handleResize);
    updatePanelSize();
    
    return () => {
      window.removeEventListener("resize", handleResize);
      
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
      transition: transform.scale === 1 && transform.x === 0 && transform.y === 0 
        ? "all 0.75s ease-in-out" // Smooth transition when resetting
        : "none", // No transition during drag/zoom for responsiveness
      outline: isZoomEnabled ? "2px solid #7ED03B" : "none",
      outlineOffset: "30px",
      transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
      transformOrigin: "center center",
    }),
    [isZoomEnabled, transform]
  );

  const figureRef = useRef(null);
  const [dynamicBorderRadius, setDynamicBorderRadius] = useState('20px');
  const [dynamicOutlineWidth, setDynamicOutlineWidth] = useState('1px');

  useEffect(() => {
    if (figureRef.current) {
      const updateStyles = () => { 
        if (figureRef.current) {
          const width = figureRef.current.offsetWidth;
          const radius = width * 0.1;
          const outlineWidth = Math.max(1, width * 0.05);
          setDynamicBorderRadius(`${radius}px`);
          setDynamicOutlineWidth(`${outlineWidth}px`);
        }
      };
      
      updateStyles();
      const resizeObserver = new ResizeObserver(updateStyles);
      resizeObserver.observe(figureRef.current);
      
      return () => resizeObserver.disconnect();
    }
  }, []);

  const figureStyles = useMemo(
    () => ({
      position: "relative",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      outline: `${dynamicOutlineWidth} solid black`,
      borderRadius: dynamicBorderRadius,
      backgroundColor: "rgba(0,0,0,0)",
      overflow: "hidden",
    }),
    [previewSize.x, previewSize.y, dynamicBorderRadius, dynamicOutlineWidth]
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
            ref={figureRef}
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
              <FullscreenPreview wallpaperRef={wallpaperRef}>
              <Suspense fallback={<WallpaperSkeleton previewSize={previewSize} />}>
                <WallpaperPixi
                  ref={wallpaperRef}
                  panelSize={panelSize}
                  isOpen={isOpen}
                  locked={!isZoomEnabled}
                  setIsZoomEnabled={memoizedSetIsZoomEnabled}
                  backgroundLayerRef={backgroundLayerRef}
                />
              </Suspense>
              </FullscreenPreview>
            )}
          </figure>
        </span>
      </div>
    </div>
  );
}
export default Canvas;
