import { useState, forwardRef } from "react";
import { useDevice } from "../../contexts/DeviceContext";
import { toast } from "react-toastify";
import Slider from "../Slider.jsx";

const Exporter = forwardRef(({}, ref) => {
  const { device } = useDevice();
  const [downloadSettings, setDownloadSettings] = useState({
    isPng: true,
    size: 1,
    quality: 1,
  });

  function dataURLtoBlob(dataURL) {
    if (!dataURL) throw new Error("Invalid data URL");
    const arr = dataURL.split(",");
    if (arr.length < 2) throw new Error("Invalid data URL format");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) throw new Error("Could not extract MIME type from data URL");
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

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

  const exportImage = () => {
    try {
      const mimeType = downloadSettings.isPng ? "image/png" : "image/jpeg";
      const extension = downloadSettings.isPng ? ".png" : ".jpg";

      const dataURL = ref.current.toDataURL({
        mimeType,
        pixelRatio: downloadSettings.size,
        quality: downloadSettings.quality,
      });

      if (!dataURL) throw new Error("Failed to generate image data");

      const blob = dataURLtoBlob(dataURL);
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
    }
  };

  return (
    <div
      id="save-as-menu"
      className="z-1000 transition-[opacity,margin] p-2 px-3 flex-col duration min-w-60 bg-white shadow-md rounded-lg mt-2 dark:bg-neutral-800 dark:border dark:border-neutral-700 absolute right-5 top-2"
      role="menu"
      aria-orientation="vertical"
    >
      {/* File Type */}
      <div className="flex-col text-xs w-full h-fit items-center py-[5px] rounded-lg text-gray-800 dark:text-neutral-400">
        File Type
        <ul className="flex flex-col sm:flex-row py-1 w-full">
          <li className="inline-flex items-center w-full py-1 px-4 text-sm font-medium bg-white border border-gray-200 text-gray-800 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white">
            <input
              id="export-radio-png"
              name="export-filetype"
              type="radio"
              value="png"
              checked={downloadSettings.isPng}
              onChange={() =>
                setDownloadSettings({ ...downloadSettings, isPng: true })
              }
              className="border-gray-200 rounded-full dark:bg-neutral-800 dark:border-neutral-700 dark:checked:bg-blue-500"
            />
            <label
              htmlFor="export-radio-png"
              className="ms-3 block w-full text-sm text-gray-600 dark:text-neutral-500"
            >
              PNG
            </label>
          </li>
          <li className="inline-flex items-center w-full py-1 px-4 text-sm font-medium bg-white border border-gray-200 text-gray-800 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white">
            <input
              id="export-radio-jpeg"
              name="export-filetype"
              type="radio"
              value="jpeg"
              checked={!downloadSettings.isPng}
              onChange={() =>
                setDownloadSettings({ ...downloadSettings, isPng: false })
              }
              className="border-gray-200 rounded-full dark:bg-neutral-800 dark:border-neutral-700 dark:checked:bg-blue-500"
            />
            <label
              htmlFor="export-radio-jpeg"
              className="ms-3 block w-full text-sm text-gray-600 dark:text-neutral-500"
            >
              JPEG
            </label>
          </li>
        </ul>
      </div>

      {/* Size Slider */}
      <div className="flex-col text-xs w-full h-fit items-center py-[8px] rounded-lg text-gray-800 dark:text-neutral-400">
        <span className="flex place-content-between w-full">
          <span>Size</span>
          <span className="text-xs">x{downloadSettings.size}</span>
        </span>
        <input
          type="range"
          min=".25"
          max="3"
          step=".25"
          value={downloadSettings.size}
          onChange={(e) =>
            setDownloadSettings({ ...downloadSettings, size: e.target.value })
          }
          className="w-full bg-transparent cursor-pointer appearance-none"
        />
        <span className="flex place-content-end w-full">
          <span className="italic opacity-50 text-[10px]">
            ({Math.ceil(device.size.x * downloadSettings.size)} x{" "}
            {Math.ceil(device.size.y * downloadSettings.size)})
          </span>
        </span>
      </div>

      {/* Quality Slider (JPEG only) */}
      {!downloadSettings.isPng && (
        <div className="flex-col text-xs w-full h-fit items-center py-[8px] rounded-lg text-gray-800 dark:text-neutral-400">
          <span className="flex place-content-between w-full">
            <span>Quality</span>
            <span className="text-xs">
              {Math.round(downloadSettings.quality * 100)}%
            </span>
          </span>
  <Slider
    min="0.1"
    max="1"
    step=".01"
            value={downloadSettings.quality}
            onChange={(e) =>
              setDownloadSettings({
                ...downloadSettings,
                quality: e.target.value,
              })
            }
  />
          <input
            type="range"
            min="0.1"
            max="1"
            step=".01"
            value={downloadSettings.quality}
            onChange={(e) =>
              setDownloadSettings({
                ...downloadSettings,
                quality: e.target.value,
              })
            }
            className="w-full bg-transparent cursor-pointer appearance-none"
          />
        </div>
      )}

      {/* Download Button */}
      <button
        type="button"
        onClick={exportImage}
        className="p-1 mt-5 mb-2.5 inline-flex justify-center w-full text-sm font-medium rounded-sm border border-transparent bg-blue-600 text-white hover:bg-blue-700"
      >
        Download
      </button>
    </div>
  );
});

export default Exporter;
