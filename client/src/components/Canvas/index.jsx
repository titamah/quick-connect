import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useDevice } from "../../contexts/DeviceContext";
import { zoom, zoomIdentity } from "d3-zoom";
import { select } from "d3-selection";
import Wallpaper from "../Wallpaper/index";
import PreviewButton from "./PreviewButton";
import UndoRedoButton from "./UndoRedoButton";
import ShareButton from "./ShareButton";
import useWindowSize from "../../hooks/useWindowSize";
import { useStageCalculations } from "../../hooks/useStageCalculations";

function Canvas({ isOpen, panelSize, wallpaperRef }) {
  const { device, isMobile } = useDevice();
  const previewRef = useRef(null);
  const canvasRef = useRef(null);
  const windowSize = useWindowSize();

  const [isLoading, setIsLoading] = useState(true);
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);

  const memoizedSetIsZoomEnabled = useCallback(setIsZoomEnabled, []);

  const scale = useStageCalculations(device.size, panelSize, isOpen);
  
  const previewSize = useMemo(() => ({
    x: device.size.x * scale,
    y: device.size.y * scale,
  }), [device.size.x, device.size.y, scale]);

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

  const setupZoomBehavior = useCallback(() => {
    const canvasElement = select(canvasRef.current);
    const previewElement = select(previewRef.current);
    const zoomBehavior = zoom()
      .scaleExtent([0.25, 15])
      .on("zoom", (event) => {
        previewElement.style(
          "transform",
          `translate(${event.transform.x}px, ${event.transform.y}px) scale(${event.transform.k})`
        );
      });

    if (isZoomEnabled) {
      canvasElement.call(zoomBehavior);
    } else {
      canvasElement.on(".zoom", null);
    }

    canvasElement.on("dblclick.zoom", null);
    canvasElement.on("dblclick", () => {
      canvasElement
        .transition()
        .duration(750)
        .call(zoomBehavior.transform, zoomIdentity);
    });

    return canvasElement;
  }, [isZoomEnabled]);

  const handleResize = useCallback(() => {
    updatePanelSize();
    const canvasElement = select(canvasRef.current);
    const zoomBehavior = zoom().scaleExtent([0.25, 15]);

    canvasElement
      .transition()
      .duration(350)
      .call(zoomBehavior.transform, zoomIdentity);
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

  useEffect(() => {
    updatePanelSize();
    setIsLoading(false);
  }, [updatePanelSize]);

  useEffect(() => {
    const canvasElement = setupZoomBehavior();

    window.addEventListener("resize", handleResize);

    updatePanelSize();

    return () => {
      window.removeEventListener("resize", handleResize);
      canvasElement.on(".zoom", null);
      canvasElement.on("dblclick", null);
    };
  }, [setupZoomBehavior, handleResize, updatePanelSize]);

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
      width: isMobile ? "100%" : isOpen ? "calc(100% - var(--panel-width))" : "100%",
      // height: isOpen ? "calc(100% - var(--panel-height))" : "100%",
    }),
    [isOpen]
  );

  const previewStyles = useMemo(
    () => ({
      transition: "all duration-150 ease-linear",
      outline: isZoomEnabled ? "2px solid #3b82f6" : "none",
      outlineOffset: "15px",
    }),
    [isZoomEnabled]
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
      className="w-screen h-[calc(100.5%-40px)] top-[39px] right-0 absolute
      overflow-hidden
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
          h-full
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
        <ShareButton />
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
              <Wallpaper
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
