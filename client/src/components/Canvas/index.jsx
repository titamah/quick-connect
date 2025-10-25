import {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
  Suspense,
  lazy,
  useImperativeHandle,
  forwardRef,
} from "react";
import { useDevice } from "../../contexts/DeviceContext";
// import FullscreenPreview from "../Wallpaper/FullscreenPreview";
import PreviewButton from "./PreviewButton";
import UndoRedoButton from "./UndoRedoButton";
import { useStageCalculations } from "../../hooks/useStageCalculations";
import LoadingSpinner from "../LoadingSpinner";

// Lazy load heavy components
const Wallpaper = lazy(() => import("../Wallpaper/index"));
const ShareButton = lazy(() => import("./ShareButton"));

import WallpaperSkeleton from "../WallpaperSkeleton";

const Canvas = forwardRef(({ isOpen, panelSize, wallpaperRef }, ref) => {
  const { device, isMobile, isQRSelected, qrConfig } = useDevice();
  const previewRef = useRef(null);
  const canvasRef = useRef(null);
  const backgroundLayerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);

  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState(0);

  // Refs for tracking actual drag movement (not just touch start)
  const isDraggingRef = useRef(false);
  const hasMoved = useRef(false);

  // Double tap detection for mobile
  const [lastTapTime, setLastTapTime] = useState(0);
  const [lastTapPosition, setLastTapPosition] = useState({ x: 0, y: 0 });
  const [touchStartPosition, setTouchStartPosition] = useState({ x: 0, y: 0 });
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);

  // Baseline transform - the "home" position that double-tap returns to
  const [baseline, setBaseline] = useState({ x: 0, y: 0, scale: 1 });

  const memoizedSetIsZoomEnabled = useCallback(setIsZoomEnabled, []);
  const scale = useStageCalculations(device.size, panelSize, isOpen);

  // Helper function to calculate transform for different view modes
  const calculateTransform = useCallback((mode, panelHeight, scaleValue) => {
    if (!isMobile) {
      return { x: 0, y: 0, scale: scaleValue };
    }

    const canvasElement = canvasRef.current;
    if (!canvasElement) return { x: 0, y: 0, scale: scaleValue };

    const canvasRect = canvasElement.getBoundingClientRect();
    const visibleCanvasHeight = canvasRect.height - panelHeight;
    const visibleCenter = visibleCanvasHeight / 2;

    switch (mode) {
      case 'closed':
        return { x: 0, y: 0, scale: 1 };
      
      case 'centerTop':
        return {
          x: 0,
          y: canvasRect.height / 2 - visibleCenter - panelHeight,
          scale: scaleValue,
        };
      
      case 'centerInVisible':
        return {
          x: 0,
          y: canvasRect.height / 2 -
            visibleCenter -
            panelHeight +
            device.size.y * scale * (0.5 - qrConfig.positionPercentages.y),
          scale: scaleValue,
        };
      
      default:
        return { x: 0, y: 0, scale: scaleValue };
    }
  }, [isMobile, canvasRef, device.size.y, scale, qrConfig.positionPercentages.y]);

  // Animate to a specific transform
  const animateToTransform = useCallback((targetTransform, duration = 750) => {
    if (previewRef.current) {
      previewRef.current.style.transition = `all ${duration}ms ease-in-out`;
    }

    setTransform(targetTransform);

    setTimeout(() => {
      if (previewRef.current) {
        previewRef.current.style.transition = "none";
      }
    }, duration);
  }, []);

  // Add the imperative handle for programmatic control
  useImperativeHandle(
    ref,
    () => ({
      // Set the baseline transform that double-tap returns to
      setBaseline: (mode, panelHeight, scaleValue) => {
        const newBaseline = calculateTransform(mode, panelHeight, scaleValue);
        setBaseline(newBaseline);
        animateToTransform(newBaseline);
      },

      // Return to the current baseline
      returnToBaseline: () => {
        animateToTransform(baseline);
      },

      // Get current transform (useful for debugging)
      getCurrentTransform: () => transform,
      
      // Get current baseline
      getBaseline: () => baseline,
    }),
    [calculateTransform, animateToTransform, baseline, transform]
  );

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

  const handleMouseDown = useCallback(
    (e) => {
      // Skip pan/zoom if QR is selected or share menu is open
      if (isQRSelected || isShareMenuOpen) return;

      // if (!isZoomEnabled) return;
      setIsDragging(true);
      isDraggingRef.current = false; // Not actually dragging yet
      hasMoved.current = false;
      setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    },
    [isZoomEnabled, transform, isQRSelected, isShareMenuOpen]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      
      hasMoved.current = true;
      isDraggingRef.current = true; // NOW we're actually dragging
      
      setTransform((prev) => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      }));
    },
    [isDragging, isZoomEnabled, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    isDraggingRef.current = false;
    hasMoved.current = false;
  }, []);

  const handleWheel = useCallback(
    (e) => {
      // Skip zoom if QR is selected or share menu is open
      if (isQRSelected || isShareMenuOpen) return;

      // if (!isZoomEnabled) return;
      e.preventDefault();

      const delta = e.deltaY * -0.01;
      const newScale = Math.min(Math.max(0.25, transform.scale + delta), 15);

      setTransform((prev) => ({
        ...prev,
        scale: newScale,
      }));
    },
    [isZoomEnabled, transform.scale, isQRSelected, isShareMenuOpen]
  );

  const handleDoubleClick = useCallback(() => {
    animateToTransform(baseline, 450);
  }, [animateToTransform, baseline]);

  const getTouchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback(
    (e) => {
      // Skip pan/zoom if QR is selected or share menu is open
      if (isQRSelected || isShareMenuOpen) return;

      // if (!isZoomEnabled) return;
      if (e.touches.length === 1) {
        const touch = e.touches[0];

        // Store touch start position for movement detection
        setTouchStartPosition({ x: touch.clientX, y: touch.clientY });

        setIsDragging(true);
        isDraggingRef.current = false; // Not actually dragging yet
        hasMoved.current = false;
        setDragStart({
          x: touch.clientX - transform.x,
          y: touch.clientY - transform.y,
        });
      } else if (e.touches.length === 2) {
        setLastTouchDistance(getTouchDistance(e.touches));
      }
    },
    [isZoomEnabled, transform, isQRSelected, isShareMenuOpen]
  );

  const handleTouchMove = useCallback(
    (e) => {
      // if (!isZoomEnabled) return;
      e.preventDefault();
      e.stopPropagation() 

      if (e.touches.length === 1 && isDragging) {
        hasMoved.current = true;
        isDraggingRef.current = true; // NOW we're actually dragging
        
        setTransform((prev) => ({
          ...prev,
          x: e.touches[0].clientX - dragStart.x,
          y: e.touches[0].clientY - dragStart.y,
        }));
      } else if (e.touches.length === 2) {
        const distance = getTouchDistance(e.touches);
        const delta = (distance - lastTouchDistance) * 0.01;
        const newScale = Math.min(Math.max(0.25, transform.scale + delta), 15);

        setTransform((prev) => ({
          ...prev,
          scale: newScale,
        }));
        setLastTouchDistance(distance);
      }
    },
    [isZoomEnabled, isDragging, dragStart, lastTouchDistance, transform.scale]
  );

  const handleTouchEnd = useCallback(
    (e) => {
      // Skip if QR is selected or share menu is open
      if (isQRSelected || isShareMenuOpen) return;

      // if (!isZoomEnabled) return;
      const now = Date.now();
      const timeSinceLastTap = now - lastTapTime;

      // Only detect double tap if the user didn't actually drag
      if (!hasMoved.current && e.changedTouches.length === 1) {
        const touch = e.changedTouches[0];
        const distance = Math.sqrt(
          Math.pow(touch.clientX - lastTapPosition.x, 2) +
            Math.pow(touch.clientY - lastTapPosition.y, 2)
        );

        // Double tap detected: close enough in time and space
        if (timeSinceLastTap < 300 && distance < 50) {
          // Reset to baseline with animation
          animateToTransform(baseline, 450);
          
          // Reset tap tracking
          setLastTapTime(0);
          setLastTapPosition({ x: 0, y: 0 });
        } else {
          // Single tap: update tracking
          setLastTapTime(now);
          setLastTapPosition({ x: touch.clientX, y: touch.clientY });
        }
      }

      setIsDragging(false);
      isDraggingRef.current = false;
      hasMoved.current = false;
    },
    [
      isZoomEnabled,
      lastTapTime,
      lastTapPosition,
      touchStartPosition,
      baseline,
      isQRSelected,
      isShareMenuOpen,
      animateToTransform,
    ]
  );
  const handleResize = useCallback(() => {
    updatePanelSize();
    // Reset zoom on resize
    setTransform({ x: 0, y: 0, scale: 1 });
  }, [updatePanelSize]);
  const handleOutsideClick = useCallback(
    (event) => {
      try {
        if (
          // isZoomEnabled &&
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

  // Update CSS variables when panelSize changes
  useEffect(() => {
    updatePanelSize();
  }, [panelSize.width, panelSize.height, isMobile]);
  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;

    canvasElement.addEventListener("mousedown", handleMouseDown);
    canvasElement.addEventListener("mousemove", handleMouseMove);
    canvasElement.addEventListener("mouseup", handleMouseUp);
    canvasElement.addEventListener("wheel", handleWheel, { passive: false });
    canvasElement.addEventListener("dblclick", handleDoubleClick);

    canvasElement.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    canvasElement.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
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
  }, [
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleDoubleClick,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleResize,
    updatePanelSize,
  ]);
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
      transition: "transform 350ms ease-in-out",
      transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
      transformOrigin: "center center",
    }),
    [isZoomEnabled, transform]
  );

  const figureRef = useRef(null);
  const [dynamicBorderRadius, setDynamicBorderRadius] = useState("20px");
  const [dynamicOutlineWidth, setDynamicOutlineWidth] = useState("1px");

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
      height: `${Math.floor(previewSize.y)}px`,
      width: `${Math.floor(previewSize.x)}px`,
    }),
    [previewSize.x, previewSize.y, dynamicBorderRadius, dynamicOutlineWidth]
  );
  return (
    <div
      className={`
        ${
          !isMobile
            ? "h-[calc(100%-60px)] bottom-0 w-[calc(100%-64px)] right-0"
            : "h-[calc(100%-90px)] bottom-[50px] w-screen"
        } 
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
            onMenuStateChange={setIsShareMenuOpen}
          />
        </Suspense>
        <span
          ref={previewRef}
          className={`${isDraggingRef.current ? "!transition-none" : "transition-[scale] duration-250 ease-in-out"}`}
          style={previewStyles}
        >
          <figure
            ref={figureRef}
            className="flex items-center justify-center pointer-events-auto z-1"
            style={figureStyles}
          >
            <Suspense
              fallback={<WallpaperSkeleton previewSize={previewSize} />}
            >
              <Wallpaper
                ref={wallpaperRef}
                panelSize={panelSize}
                isOpen={isOpen}
                locked={!isZoomEnabled}
                setIsZoomEnabled={memoizedSetIsZoomEnabled}
                backgroundLayerRef={backgroundLayerRef}
              />
            </Suspense>
          </figure>
        </span>
      </div>
    </div>
  );
});

Canvas.displayName = "Canvas";

export default Canvas;