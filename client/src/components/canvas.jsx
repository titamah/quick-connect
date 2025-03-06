import { useEffect, useState, useRef } from "react";
import "preline/preline";
import { zoom, select, zoomIdentity } from "d3";
import Wallpaper from "./wallpaper";

function Canvas({ isOpen, panelSize, device }) {
  const previewRef = useRef(null);
  const canvasRef = useRef(null);
  const wallpaperRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);

  const updatePanelSize = () => {
    const screenWidth = window.innerWidth;
    
    if (screenWidth >= 640) {
      document.documentElement.style.setProperty("--panel-height", "0px");
      document.documentElement.style.setProperty("--panel-width", `${panelSize.width}px`);
    } else {
      document.documentElement.style.setProperty("--panel-width", "0px");
      document.documentElement.style.setProperty("--panel-height", `${panelSize.height}px`);
    }
  };

  useEffect(() => {
    import("preline/preline").then(({ HSStaticMethods }) => {
      HSStaticMethods.autoInit();
    });
    updatePanelSize();
    setIsLoading(false);
  }, []);

  useEffect(() => {
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
        canvasElement.on(".zoom", null); // Disable zoom behavior
      }

    canvasElement.on("dblclick.zoom", null);
    canvasElement.on("dblclick", () => {
      canvasElement
        .transition()
        .duration(750)
        .call(zoomBehavior.transform, zoomIdentity);
    });

    window.addEventListener("resize", () => {
      updatePanelSize();
      canvasElement
        .transition()
        .duration(350)
        .call(zoomBehavior.transform, zoomIdentity);
    });

    document.addEventListener("click", (event) => {
      if (isZoomEnabled && !previewRef.current.contains(event.target)) {
        setIsZoomEnabled(false);
      }
    });

    updatePanelSize();

  }, [isOpen, isZoomEnabled, panelSize]);

  return (
    <div
      className="w-screen h-[calc(100%-52px)] p-10
          bg-white dark:bg-neutral-900 
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
          ${
            isOpen
              ? "w-[calc(100%-var(--panel-width))] h-[calc(100%-var(--panel-height))]"
              : "w-full h-full"
          }
          flex
          z-0
          min-md:h-full
          max-sm:w-full
          duration-300 ease-in-ease-out
          ml-auto
          items-center 
          justify-center
          pointer-events-auto
        `}
      >
        <figure
          ref={previewRef}
          className={`
            transition-all duration-150 ease-linear flex items-center justify-center
            pointer-events-auto z-1
            ${isZoomEnabled ? "outline-2 outline-offset-40 outline-blue-500" : ""}
          `}
          onClick={()=>{
              setIsZoomEnabled(true)}}
          >
            {isLoading ? (
              <div className=" h-[874px] w-[402px] bg-gray-300 rounded-[1.25rem]">
                <div
                  className="animate-spin inline-block m-auto size-20 border-[6px] border-current border-t-transparent text-blue-600 rounded-full dark:text-blue-500"
                  role="status"
                  aria-label="loading"
                >
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            ) : (
                <Wallpaper
                  ref={wallpaperRef}
                  panelSize={panelSize}
                  device={device}
                  locked={!isZoomEnabled}
                  setIsZoomEnabled={setIsZoomEnabled}
                />
            )}
        </figure>
      </div>
    </div>
  );
}

export default Canvas;
