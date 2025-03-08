import { useEffect, useState, useRef, useContext } from "react";
import "preline/preline";
import { zoom, select, zoomIdentity } from "d3";
import { Resizable } from "react-resizable";
import { DeviceContext } from "../App";
import Wallpaper from "./wallpaper";

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
  
  function downloadURI(uri, name) { // Construct the <a> element
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  const exportImage = () => {
    const dataURL = wallpaperRef.current.toDataURL();
    downloadURI(dataURL, device.name);
    // const img = new Image();
    // img.src = dataURL;
    // console.log(
    //   img
    // )
  }

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
        <div
          id="save-as-dropdown"
          className="hs-dropdown w-fit right-5 absolute top-2 z-100"
        >
          <button
            type="button"
            id="hs-dropdown-custom-trigger"
            aria-haspopup="menu"
            aria-expanded="false"
            aria-label="Dropdown"
            class="py-2 hs-dropdown-toggle px-2 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
          >
            Export
            { isLoading ?
              <span
              class="animate-spin inline-block size-4 border-3 border-current border-t-transparent text-white rounded-full"
              role="status"
              aria-label="loading"
            ></span>:<svg
            className="size-4"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ margin: "auto" }}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" x2="12" y1="15" y2="3" />
          </svg> }
          </button>
          <div
            id="device-type-menu"
            className="hs-dropdown-menu z-1000 -translate-y-[12.5px] transition-[opacity,margin] duration hidden min-w-60 min-w-60 bg-white shadow-md rounded-lg mt-2 dark:bg-neutral-800 dark:border dark:border-neutral-700"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="hs-dropdown-custom-trigger"
          >
            <div
              // key={0}
              onClick={exportImage}
              className="flex text-xs w-full h-fit items-center gap-x-3.5 py-[7.5px] px-[5px] rounded-lg text-gray-800 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700"
            >
              Save as PNG
            </div>
            <div
              // key={0}
              onClick={() => {
                console.log(key);
              }}
              className="flex text-xs w-full h-fit items-center gap-x-3.5 py-[7.5px] px-[5px] rounded-lg text-gray-800 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700"
            >
              Save as JPEG
            </div>
          </div>
        </div>
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
