import { useState, forwardRef, useEffect } from "react";
import { useDevice } from "../../contexts/DeviceContext";
import { usePreview } from "../../contexts/PreviewContext";
import { useToast } from "../Toast";

const Exporter = forwardRef(({ wallpaperRef }, ref) => {
  const { device, updateDeviceInfo, takeSnapshot, isMobile } = useDevice();
  const { setExportState } = usePreview();
  const { toast } = useToast();
  const [downloadSettings, setDownloadSettings] = useState({
    isPng: true,
    size: 1.0, 
    quality: 1, 
  });

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = filename;
    link.href = url;
    link.style.display = "none";
    document.body.appendChild(link);
    setTimeout(() => {
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }, 0);
  }

  const exportImage = async () => {
    if (!wallpaperRef?.current?.exportImage) {
      toast.error("Export function not available. Please wait for the canvas to load.", {
        position: "bottom-right",
        autoClose: 3000,
      });
      return;
    }

    setExportState(true);
    
    try {
      const format = downloadSettings.isPng ? 'png' : 'jpeg';
      const extension = downloadSettings.isPng ? '.png' : '.jpg';

      // Call the exposed exportImage method
      const blob = await wallpaperRef.current.exportImage({
        format,
        quality: downloadSettings.quality,
        scale: parseFloat(downloadSettings.size)
      });

      const filename = device.name + extension;
      downloadBlob(blob, filename);
      
      toast.success("Download complete", {
        position: "bottom-right",
        autoClose: 2000,
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export image. Please try again.", {
        position: "bottom-right",
        autoClose: 3000,
      });
    } finally {
      setExportState(false);
    }
  };

  const [name, setName] = useState(device.name);
  
  useEffect(() => {
    setName(device.name);
  }, [device.name]);

  return (
    <div className={`w-full${isMobile ? "rounded-t-2xl h-full" : ""} flex-1 overflow-y-scroll min-h-0 gap-y-3.5 p-3.5`}>
      <h2 className={`${isMobile ? "hidden" : ""}`}>Save Wallpaper</h2>
      
      <div>
        <h4 className="py-1.5">File Name</h4>
        <input
          id="qr-input"
          type="text"
          className="w-full px-2 py-1 text-xs bg-black/5 dark:bg-black/15 border border-[var(--border-color)]/50 focus:outline-none focus:border-[var(--accent)]/50 rounded-xl"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          onBlur={(e) => {
            takeSnapshot("Change file name");
            updateDeviceInfo({
              name: e.target.value,
            });
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.target.blur();
            }
          }}
        />
      </div>

      <div className="flex-col rounded-lg">
        <h4 className="py-1.5">File Type</h4>
        <ul className="flex flex-row bg-black/5 dark:bg-black/15 rounded-lg">
          <li
            className="inline-flex w-full py-1 px-4 border border-[var(--border-color)]/50 border-r-[var(--border-color)]/25 rounded-tl-lg rounded-bl-lg cursor-pointer hover:bg-[var(--border-color)]/10"
            onClick={() =>
              setDownloadSettings({ ...downloadSettings, isPng: true })
            }
          >
            <div className="flex items-center h-5">
              <div
                className={`w-4 h-4 rounded-full border-2 bg-[var(--bg-main)] transition-all duration-200 ease-in-out ${
                  downloadSettings.isPng
                    ? " border-[var(--accent)] border-5"
                    : "border-[var(--border-color)]"
                }`}
              ></div>
            </div>
            <div className="ms-3 block w-full text-sm text-gray-600 dark:text-neutral-500 cursor-pointer">
              PNG
            </div>
          </li>
          <li
            className="inline-flex w-full py-1 px-4 border border-[var(--border-color)]/50 border-l-[var(--border-color)]/25 rounded-tr-lg rounded-br-lg cursor-pointer hover:bg-[var(--border-color)]/10"
            onClick={() =>
              setDownloadSettings({ ...downloadSettings, isPng: false })
            }
          >
            <div className="flex items-center h-5">
              <div
                className={`w-4 h-4 rounded-full border-2 bg-[var(--bg-main)] transition-all duration-200 ease-in-out ${
                  !downloadSettings.isPng
                    ? " border-[var(--accent)] border-5"
                    : "border-[var(--border-color)]"
                }`}
              ></div>
            </div>
            <div className="ms-3 block w-full text-sm text-gray-600 dark:text-neutral-500 cursor-pointer">
              JPEG
            </div>
          </li>
        </ul>
      </div>

      <div className="flex-col text-xs py-1.5">
        <span className="flex place-content-between">
          <h4>Size</h4>
          <span className="text-xs">x{downloadSettings.size}</span>
        </span>
        <input
          type="range"
          className="w-full bg-transparent cursor-pointer appearance-none disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden
  [&::-webkit-slider-thumb]:w-2.5
  [&::-webkit-slider-thumb]:h-2.5
  [&::-webkit-slider-thumb]:-mt-0.5
  [&::-webkit-slider-thumb]:appearance-none
  [&::-webkit-slider-thumb]:bg-[var(--accent)]
  [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(37,99,235,1)]
  [&::-webkit-slider-thumb]:rounded-full
  [&::-webkit-slider-thumb]:transition-all
  [&::-webkit-slider-thumb]:duration-150
  [&::-webkit-slider-thumb]:ease-in-out
  dark:[&::-webkit-slider-thumb]:bg-neutral-700
  [&::-moz-range-thumb]:w-2.5
  [&::-moz-range-thumb]:h-2.5
  [&::-moz-range-thumb]:appearance-none
  [&::-moz-range-thumb]:bg-[var(--accent)]
  [&::-moz-range-thumb]:border-4
  [&::-moz-range-thumb]:border-blue-600
  [&::-moz-range-thumb]:rounded-full
  [&::-moz-range-thumb]:transition-all
  [&::-moz-range-thumb]:duration-150
  [&::-moz-range-thumb]:ease-in-out
  [&::-webkit-slider-runnable-track]:w-full
  [&::-webkit-slider-runnable-track]:h-2
  [&::-webkit-slider-runnable-track]:bg-gray-100
  [&::-webkit-slider-runnable-track]:rounded-full
  dark:[&::-webkit-slider-runnable-track]:bg-neutral-700
  [&::-moz-range-track]:w-full
  [&::-moz-range-track]:h-2
  [&::-moz-range-track]:bg-gray-100
  [&::-moz-range-track]:rounded-full"
          id="steps-range-slider-usage"
          aria-orientation="horizontal"
          min="0.25"
          max="3"
          step="0.25"
          value={downloadSettings.size}
          title={downloadSettings.size}
          onChange={(e) =>
            setDownloadSettings({
              ...downloadSettings,
              size: e.target.value,
            })
          }
        />
        <span className="flex place-content-end w-full">
          <span className="italic opacity-50 text-[10px] h-2">
            ({Math.ceil(device.size.x * downloadSettings.size)} x{" "}
            {Math.ceil(device.size.y * downloadSettings.size)})
          </span>
        </span>
      </div>

      {!downloadSettings.isPng && (
        <div className="flex-col text-xs pt-1.5">
          <span className="flex place-content-between">
            <h4>Quality</h4>
            <span className="text-xs">
              {Math.round(downloadSettings.quality * 100)}%
            </span>
          </span>
          <input
            type="range"
            className="w-full bg-transparent cursor-pointer appearance-none disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden
  [&::-webkit-slider-thumb]:w-2.5
  [&::-webkit-slider-thumb]:h-2.5
  [&::-webkit-slider-thumb]:-mt-0.5
  [&::-webkit-slider-thumb]:appearance-none
  [&::-webkit-slider-thumb]:bg-[var(--accent)]
  [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(37,99,235,1)]
  [&::-webkit-slider-thumb]:rounded-full
  [&::-webkit-slider-thumb]:transition-all
  [&::-webkit-slider-thumb]:duration-150
  [&::-webkit-slider-thumb]:ease-in-out
  dark:[&::-webkit-slider-thumb]:bg-neutral-700
  [&::-moz-range-thumb]:w-2.5
  [&::-moz-range-thumb]:h-2.5
  [&::-moz-range-thumb]:appearance-none
  [&::-moz-range-thumb]:bg-[var(--accent)]
  [&::-moz-range-thumb]:border-4
  [&::-moz-range-thumb]:border-blue-600
  [&::-moz-range-thumb]:rounded-full
  [&::-moz-range-thumb]:transition-all
  [&::-moz-range-thumb]:duration-150
  [&::-moz-range-thumb]:ease-in-out
  [&::-webkit-slider-runnable-track]:w-full
  [&::-webkit-slider-runnable-track]:h-2
  [&::-webkit-slider-runnable-track]:bg-gray-100
  [&::-webkit-slider-runnable-track]:rounded-full
  dark:[&::-webkit-slider-runnable-track]:bg-neutral-700
  [&::-moz-range-track]:w-full
  [&::-moz-range-track]:h-2
  [&::-moz-range-track]:bg-gray-100
  [&::-moz-range-track]:rounded-full"
            id="steps-range-slider-usage"
            aria-orientation="horizontal"
            min="0.1"
            max="1"
            step="0.01"
            value={downloadSettings.quality}
            title={downloadSettings.quality}
            onChange={(e) =>
              setDownloadSettings({
                ...downloadSettings,
                quality: parseFloat(e.target.value),
              })
            }
          />
        </div>
      )}

      <button
        type="button"
        onClick={exportImage}
        className="p-1 mt-5 mb-2.5 inline-flex justify-center w-full text-sm font-medium rounded-2xl bg-[var(--accent)] text-white hover:opacity-80 cursor-pointer transition-opacity duration-200 ease-in-out"
      >
        Download
      </button>
    </div>
  );
});

export default Exporter;