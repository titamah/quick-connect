import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useDevice } from "../../contexts/DeviceContext";
import "preline/preline";
import { zoom, select, zoomIdentity } from "d3";
import OptimizedWallpaper from '../Wallpaper/OptimizedWallpaper';
import PreviewButton from "./PreviewButton";
import ExportButton from "./ExportButton";

function Canvas({ isOpen, panelSize, wallpaperRef, setPalette }) {
  const { device, updateDeviceInfo } = useDevice();
  const previewRef = useRef(null);
  const canvasRef = useRef(null);
  const [scale, setScale] = useState(1);
  // const wallpaperRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);

  // Memoize function props to prevent unnecessary re-renders
  const memoizedSetIsZoomEnabled = useCallback(setIsZoomEnabled, []);

  // Memoized preview size calculation
  const previewSize = useMemo(() => {
    const scaleX = isOpen
      ? (0.85 * window.innerWidth - panelSize.width) / device.size.x
      : (0.85 * window.innerWidth) / device.size.x;
    const scaleY = isOpen
      ? (0.85 * (window.innerHeight - panelSize.height - 52)) / device.size.y
      : (0.85 * (window.innerHeight - 52)) / device.size.y;
    const scale = Math.min(scaleX, scaleY);
    return {
      x: device.size.x * scale,
      y: device.size.y * scale,
    };
  }, [isOpen, panelSize.width, panelSize.height, device.size.x, device.size.y]);

  // Memoized panel size update function
  const updatePanelSize = useCallback(() => {
    const screenWidth = window.innerWidth;
    if (screenWidth >= 640) {
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

  // Memoized zoom behavior setup
  const setupZoomBehavior = useCallback(() => {
    const canvasElement = select(canvasRef.current);
    const previewElement = select(previewRef.current);
    const zoomBehavior = zoom()
      .scaleExtent([0.25, 15])
      .on("zoom", (event) => {
        setScale(event.transform.k);
        previewElement.style(
          "transform",
          `translate(${event.transform.x}px, ${event.transform.y}px) scale(${event.transform.k})`
        );
      });

    if (isZoomEnabled) {
      canvasElement.call(zoomBehavior);
    } else {
      canvasElement.on(".zoom", null); // Disable zoom behavior
    }

    canvasElement.on("dblclick.zoom", null);
    canvasElement.on("dblclick", () => {
      canvasElement
        .transition()
        .duration(750)
        .call(zoomBehavior.transform, zoomIdentity);
    });

    return { canvasElement, zoomBehavior };
  }, [isZoomEnabled]);

  // Memoized resize handler
  const handleResize = useCallback(() => {
    updatePanelSize();
    const canvasElement = select(canvasRef.current);
    const zoomBehavior = zoom()
      .scaleExtent([0.25, 15]);
    
    canvasElement
      .transition()
      .duration(350)
      .call(zoomBehavior.transform, zoomIdentity);
  }, [updatePanelSize]);

  // Memoized outside click handler
  const handleOutsideClick = useCallback((event) => {
    try {
      if (isZoomEnabled && previewRef?.current && previewRef.current.contains && !previewRef.current.contains(event.target)) {
        setIsZoomEnabled(false);
      }
    } catch (error) {
      console.warn('Error in handleOutsideClick:', error);
    }
  }, [isZoomEnabled]);

  // Initialize component
  useEffect(() => {
    import("preline/preline").then(({ HSStaticMethods }) => {
      HSStaticMethods.autoInit();
    });
    updatePanelSize();
    setIsLoading(false);
  }, [updatePanelSize]);

  // Setup zoom behavior
  useEffect(() => {
    const { canvasElement, zoomBehavior } = setupZoomBehavior();

    // Add resize listener
    window.addEventListener("resize", handleResize);

    updatePanelSize();

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      canvasElement.on(".zoom", null);
      canvasElement.on("dblclick", null);
    };
  }, [setupZoomBehavior, handleResize, updatePanelSize]);

  // Add outside click listener after component is mounted
  useEffect(() => {
    if (previewRef.current) {
      document.addEventListener("click", handleOutsideClick);
      
      return () => {
        document.removeEventListener("click", handleOutsideClick);
      };
    }
  }, [handleOutsideClick]);

  // Memoized canvas styles
  const canvasStyles = useMemo(() => ({
    width: isOpen
      ? "calc(100% - var(--panel-width))"
      : "100%",
    height: isOpen
      ? "calc(100% - var(--panel-height))"
      : "100%",
  }), [isOpen]);

  // Memoized preview styles
  const previewStyles = useMemo(() => ({
    transition: "all duration-150 ease-linear",
    outline: isZoomEnabled ? "2px solid #3b82f6" : "none",
    outlineOffset: "15px",
  }), [isZoomEnabled]);

  // Memoized figure styles
  const figureStyles = useMemo(() => ({
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    outline: `${((previewSize.y + previewSize.x) *.0125)}px solid black`,
    borderRadius: `${((previewSize.y + previewSize.x) *.0375)}px`,
    backgroundColor: "rgba(0,0,0,0)",
    overflow: "hidden",
  }), [previewSize.x, previewSize.y]);

  return (
    <div
      className="w-screen h-[calc(100.5%-52px)] top-[51px] absolute
          bg-bg-main dark:bg-neutral-900 
          bg-[image:repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] 
          bg-[size:10px_10px] 
          bg-fixed 
          [--pattern-fg:theme(colors.gray.950/0.05)] 
          dark:[--pattern-fg:theme(colors.neutral.500/0.1)]
          z-0
          pointer-events-auto 
    "
    >
      <div
        id="Canvas"
        ref={canvasRef}
        className={`
          flex
          z-0
          relative
          min-md:h-full
          max-sm:w-full
          duration-300 ease-in-ease-out
          ml-auto
          items-center 
          justify-center
          pointer-events-auto
        `}
        style={canvasStyles}
      >
        <PreviewButton />
        {/* <ExportButton ref={wallpaperRef} /> */}
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
                className="bg-gray-300 rounded-[1.25rem] flex"
                style={{
                  height: `${previewSize.y}px`,
                  width: `${previewSize.x}px`,
                }}
              >
                <div
                  className="animate-spin m-auto size-12 border-[4px] border-current border-t-transparent text-blue-600 rounded-full dark:text-blue-500"
                  role="status"
                  aria-label="loading"
                ></div>
              </div>
            ) : (
              <OptimizedWallpaper
                ref={wallpaperRef}
                panelSize={panelSize}
                isOpen={isOpen}
                locked={!isZoomEnabled}
                setIsZoomEnabled={memoizedSetIsZoomEnabled}
              />
            )}
          </figure>
        </span>
      </div>
    </div>
  );
}

export default Canvas;
