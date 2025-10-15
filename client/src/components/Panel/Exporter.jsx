import { useState, forwardRef, useEffect } from "react";
import { useDevice } from "../../contexts/DeviceContext";
import { usePreview } from "../../contexts/PreviewContext";
import { useToast } from "../Toast";
import Slider from "../Slider";

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
    <div className={`w-full${isMobile ? "rounded-t-2xl h-full" : ""} flex-1 overflow-y-scroll min-h-0`}>
      
      <div
        className={`flex-shrink-0 bg-[#f2f2f2] dark:bg-[#1a1818] ${
          isMobile
            ? "pb-2 pt-5 px-2 mb-3 rounded-t-2xl sticky top-0 z-100"
            : "px-2.5 pt-3.5 pb-2"
        }`}
      >
        <h3 className={`${isMobile ? "mb-1.5 px-1" : "px-1 mb-2"}`}>File Name</h3>
        <input
          id="qr-input"
          type="text"
          className={`w-full px-2 py-0.5 text-sm bg-[var(--bg-main)] border border-[var(--border-color)]/50 focus:outline-none focus:border-[var(--accent)]/50 rounded-xl`}
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
      
      <h2 className={`${isMobile ? "hidden" : ""} p-3.5`}>Save Wallpaper</h2>

      <div className="flex-col rounded-lg pb-3.5 px-3.5">
        <h4 className="pb-1.5">File Type</h4>
        <ul className="flex flex-row bg-black/5 dark:bg-black/15 rounded-lg ">
          <li
            className="inline-flex w-full py-0.5 px-4 border border-[var(--border-color)]/50 border-r-[var(--border-color)]/25 rounded-tl-lg rounded-bl-lg cursor-pointer hover:bg-[var(--border-color)]/10"
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
            <div className="ms-2 block w-full text-sm text-gray-600 dark:text-neutral-500 cursor-pointer">
              PNG
            </div>
          </li>
          <li
            className="inline-flex w-full py-0.5 px-4 border border-[var(--border-color)]/50 border-l-[var(--border-color)]/25 rounded-tr-lg rounded-br-lg cursor-pointer hover:bg-[var(--border-color)]/10"
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
            <div className="ms-2 block w-full text-sm text-gray-600 dark:text-neutral-500 cursor-pointer">
              JPEG
            </div>
          </li>
        </ul>
      </div>

      <div className="flex-col text-xs pb-2.5 px-3.5">
        <span className="flex place-content-between">
          <h4>Size</h4>
          <span className="text-xs text-[var(--text-secondary)]">x{downloadSettings.size}</span>
        </span>
        <div className="relative">
          <Slider
            id="export-size"
            value={downloadSettings.size}
            min={0.25}
            max={3}
            step={0.25}
            onChange={(e) =>
              setDownloadSettings((s) => ({
                ...s,
                size: parseFloat(e.target.value),
              }))
            }
          />
        </div>
        <span className="flex place-content-end w-full">
          <span className="italic opacity-50 text-[10px] h-2  text-[var(--text-secondary)]">
            ({Math.ceil(device.size.x * downloadSettings.size)} x{" "}
            {Math.ceil(device.size.y * downloadSettings.size)})
          </span>
        </span>
      </div>

      {!downloadSettings.isPng && (
        <div className="flex-col text-xs pb-1.5 px-3.5">
          <span className="flex place-content-between">
            <h4>Quality</h4>
            <span className="text-[var(--text-secondary)]">
              {Math.round(downloadSettings.quality * 100)}%
            </span>
          </span>
          <div className="relative">
            <Slider
              id="export-quality"
              value={downloadSettings.quality}
              min={0.1}
              max={1}
              step={0.01}
              onChange={(e) =>
                setDownloadSettings((s) => ({
                  ...s,
                  quality: parseFloat(e.target.value),
                }))
              }
            />
          </div>
        </div>
      )}
      <div className="px-3.5 mb-5">
      <button
        type="button"
        onClick={exportImage}
        className="p-1 mt-3.5 inline-flex items-center justify-center w-full text-sm font-medium rounded-2xl bg-[var(--accent)] text-white hover:opacity-80 cursor-pointer transition-opacity duration-200 ease-in-out"
      >
        Download
      </button></div>
    </div>
  );
});

export default Exporter;