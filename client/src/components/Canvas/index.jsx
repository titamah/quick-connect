import { useEffect, useState, useRef, useContext } from "react";
import "preline/preline";
import { zoom, select, zoomIdentity } from "d3";
import { DeviceContext } from "../../App";
import Wallpaper from '../Wallpaper/index'
import ExportButton from "./ExportButton";

function Canvas({ isOpen, panelSize }) {
  const { device } = useContext(DeviceContext);
  const previewRef = useRef(null);
  const canvasRef = useRef(null);
  const wallpaperRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);

  const [previewSize, setPreviewSize] = useState({ x: 0, y: 0 });

  const updatePanelSize = () => {
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
  };

  useEffect(() => {
    import("preline/preline").then(({ HSStaticMethods }) => {
      HSStaticMethods.autoInit();
    });
    updatePanelSize();
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const scaleX = (0.95 * window.innerWidth - panelSize.width) / device.size.x;
    const scaleY =
      (0.95 * window.innerHeight - panelSize.height) / device.size.y;
    const scale = Math.min(scaleX, scaleY);
    setPreviewSize({
      x: device.size.x * scale,
      y: device.size.y * scale,
    });
  }, [device]);

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
      if (isZoomEnabled && !previewRef?.current.contains(event.target)) {
        setIsZoomEnabled(false);
      }
    });

    updatePanelSize();
  }, [isOpen, isZoomEnabled, panelSize, device]);


  return (
    <div
      className="w-screen h-[calc(100%-52px)]
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
          relative
          min-md:h-full
          max-sm:w-full
          duration-300 ease-in-ease-out
          ml-auto
          items-center 
          justify-center
          pointer-events-auto
        `}
      >
        <ExportButton ref={wallpaperRef}/>
        <span
          ref={previewRef}
          className={`
            transition-all duration-150 ease-linear
             ${
               isZoomEnabled
                 ? "outline-2 outline-offset-15 outline-blue-500"
                 : ""
             }`}
        >
          <figure
            className={` flex items-center justify-center
            pointer-events-auto z-1`}
            style={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              outline: "10px solid black",
              backgroundColor: "rgba(0,0,0,0)",
              overflow: "hidden",
              borderRadius: "24px",
            }}
            onClick={() => {
              setIsZoomEnabled(true);
            }}
          >
            {isLoading ? (
              <div
                className={`bg-gray-300 rounded-[1.25rem] flex`}
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
                device={device}
                locked={!isZoomEnabled}
                setIsZoomEnabled={setIsZoomEnabled}
              />
            )}
          </figure>
        </span>
      </div>
    </div>
  );
}

export default Canvas;
