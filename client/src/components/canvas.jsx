import { useEffect, useState, useRef } from "react";
import "preline/preline";
import image from "../assets/example.jpg";
import { zoom, select, zoomIdentity } from "d3";
import Wallpaper from "./wallpaper";

function Canvas({ isOpen, panelSize, device }) {
  const previewRef = useRef(null);
  const canvasRef = useRef(null);
  const wallpaperRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [image, setImage] = useState(null);

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
    if (wallpaperRef.current) {
      const dataURL = wallpaperRef.current.toDataURL();
      setImage(dataURL);
    }
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

    canvasElement.call(zoomBehavior);
    canvasElement.on("dblclick.zoom", null);

    function detectDoubleTap(element, callback) {
      let lastTap = 0;
      element.on("touchend", (event) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        if (tapLength < 500 && tapLength > 0) {
          event.preventDefault();
          callback();
        }
        lastTap = currentTime;
      });
    }
    detectDoubleTap(canvasElement, () => {
      canvasElement
        .transition()
        .duration(750)
        .call(zoomBehavior.transform, zoomIdentity);
    });

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
    updatePanelSize();
    setIsLoading(false);
  }, [isOpen]);

  useEffect(() => {
    updatePanelSize();
  }, [panelSize]);

  const handleLoad = () => {
    setIsLoading(false);
    // Force a reflow of the preview element
    if (previewRef.current) {
      previewRef.current.style.display = "none";
      previewRef.current.offsetHeight; // Trigger reflow
      previewRef.current.style.display = "";
    }
  };

  return (
    <div
      className="w-screen h-[calc(100%-52px)] p-10
          bg-white dark:bg-neutral-900 
          bg-[image:repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] 
          bg-[size:10px_10px] 
          bg-fixed 
          [--pattern-fg:theme(colors.gray.950/0.05)] 
          dark:[--pattern-fg:theme(colors.neutral.500/0.1)]
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
        `}
      >
        <figure
          ref={previewRef}
          className="z-1 transition-all duration-150 ease-linear w-full h-full min-w-[50vw] min-h-[50vh] flex items-center justify-center"
        >
          <div
            id="preview"
            className="max-w-full max-h-fit w-fit h-full p-2 bg-gray-800 shadow-[0_2.75rem_5.5rem_-3.5rem_rgb(45_55_75_/_20%),_0_2rem_4rem_-2rem_rgb(45_55_75_/_30%),_inset_0_-0.1875rem_0.3125rem_0_rgb(45_55_75_/_20%)] dark:bg-neutral-600 dark:shadow-[0_2.75rem_5.5rem_-3.5rem_rgb(0_0_0_/_20%),_0_2rem_4rem_-2rem_rgb(0_0_0_/_30%),_inset_0_-0.1875rem_0.3125rem_0_rgb(0_0_0_/_20%)] rounded-3xl"
          >
            {isLoading ? (
              <div className=" h-[874px] w-[402px] bg-gray-300  rounded-[1.25rem]">
                <div
                  className="animate-spin inline-block m-auto size-20 border-[6px] border-current border-t-transparent text-blue-600 rounded-full dark:text-blue-500"
                  role="status"
                  aria-label="loading"
                >
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            ) : (
              <img
                className="rounded-[1.25rem] max-h-full max-w-full h-auto w-auto object-contain"
                onLoad={handleLoad}
                src={image}
                alt="Mobile Placeholder"
              />
            )}
            <div className="hidden">
              <Wallpaper ref={wallpaperRef} device={device} />
            </div>
          </div>
        </figure>
      </div>
    </div>
  );
}

export default Canvas;
