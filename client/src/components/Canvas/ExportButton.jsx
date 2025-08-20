import { useState, forwardRef } from "react";
import { useDevice } from "../../contexts/DeviceContext";
import { toast } from "react-toastify";

const ExportButton = forwardRef(({}, ref) => {
  const { device, updateBackground, updateQRConfig, updateDeviceInfo } = useDevice();
  const [downloadSettings, setDownloadSettings] = useState({
    isPng: true,
    size: 1,
    quality: 1,
  });

  function downloadURI(uri, name) {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const exportImage = () => {
    const mimeType = downloadSettings.isPng ? "image/png" : "image/jpeg";
    const dataURL = ref.current.toDataURL({
      mimeType: mimeType,
      pixelRatio: downloadSettings.size,
      quality: downloadSettings.quality,
    });
    downloadURI(dataURL, device.name);
    toast.success("Download complete", {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

    return (
        <div
          id="save-as-dropdown"
          className="hs-dropdown [--auto-close:inside] w-fit flex-col place-items-end right-5 absolute top-2 z-100"
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
            <svg
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
            </svg>
          </button>
          <div
            id="device-type-menu"
            className="hs-dropdown-menu hidden z-1000 transition-[opacity,margin] p-2 px-3 flex-col duration min-w-60 min-w-60 bg-white shadow-md rounded-lg mt-2 dark:bg-neutral-800 dark:border dark:border-neutral-700"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="hs-dropdown-custom-trigger"
          >
            <div className="flex-col text-xs w-full h-fit items-center py-[5px] rounded-lg text-gray-800 dark:text-neutral-400">
              File Type
              <ul className="flex flex-col sm:flex-row py-1 w-full">
                <li className="inline-flex items-center w-full py-1 px-4 text-sm font-medium bg-white border border-gray-200 text-gray-800 -mt-px first:rounded-t-lg first:mt-0 last:rounded-b-lg sm:-ms-px sm:mt-0 sm:first:rounded-se-none sm:first:rounded-es-lg sm:last:rounded-es-none sm:last:rounded-se-lg dark:bg-neutral-800 dark:border-neutral-700 dark:text-white">
                  <div className="flex items-center h-5">
                    <input
                      id="hs-horizontal-list-group-item-radio-1"
                      name="hs-horizontal-list-group-item-radio"
                      type="radio"
                      value={true}
                      className="border-gray-200 rounded-full disabled:opacity-50 dark:bg-neutral-800 dark:border-neutral-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800"
                      checked={downloadSettings.isPng}
                      onChange={() =>
                        setDownloadSettings({
                          ...downloadSettings,
                          isPng: true,
                        })
                      }
                    />
                  </div>
                  <label
                    htmlFor="hs-horizontal-list-group-item-radio-1"
                    className="ms-3 block w-full text-sm text-gray-600 dark:text-neutral-500"
                  >
                    PNG
                  </label>
                </li>
                <li className="inline-flex items-center w-full gap-x-2.5 py-1 px-4 text-sm font-medium bg-white border border-gray-200 text-gray-800 -mt-px first:rounded-t-lg first:mt-0 last:rounded-b-lg sm:-ms-px sm:mt-0 sm:first:rounded-se-none sm:first:rounded-es-lg sm:last:rounded-es-none sm:last:rounded-se-lg dark:bg-neutral-800 dark:border-neutral-700 dark:text-white">
                  <div className="relative flex items-start w-full">
                    <div className="flex items-center h-5">
                      <input
                        id="hs-horizontal-list-group-item-radio-2"
                        name="hs-horizontal-list-group-item-radio"
                        type="radio"
                        value={false}
                        className="border-gray-200 rounded-full disabled:opacity-50 dark:bg-neutral-800 dark:border-neutral-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800"
                        checked={!downloadSettings.isPng}
                        onChange={() =>
                          setDownloadSettings({
                            ...downloadSettings,
                            isPng: false,
                          })
                        }
                      />
                    </div>
                    <label
                      htmlFor="hs-horizontal-list-group-item-radio-2"
                      className="ms-3 block w-full text-sm text-gray-600 dark:text-neutral-500"
                    >
                      JPEG
                    </label>
                  </div>
                </li>
              </ul>
            </div>
            <div className="flex-col text-xs w-full h-fit items-center gap-x-3.5 py-[8px] rounded-lg text-gray-800 dark:text-neutral-400 ">
              <span className="flex place-content-between w-full">
                <span>Size</span>
                <span className="text-xs"> x{downloadSettings.size} </span>
                </span>
              <input
                type="range"
                className="w-full bg-transparent cursor-pointer appearance-none disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden
  [&::-webkit-slider-thumb]:w-2.5
  [&::-webkit-slider-thumb]:h-2.5
  [&::-webkit-slider-thumb]:-mt-0.5
  [&::-webkit-slider-thumb]:appearance-none
  [&::-webkit-slider-thumb]:bg-white
  [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(37,99,235,1)]
  [&::-webkit-slider-thumb]:rounded-full
  [&::-webkit-slider-thumb]:transition-all
  [&::-webkit-slider-thumb]:duration-150
  [&::-webkit-slider-thumb]:ease-in-out
  dark:[&::-webkit-slider-thumb]:bg-neutral-700

  [&::-moz-range-thumb]:w-2.5
  [&::-moz-range-thumb]:h-2.5
  [&::-moz-range-thumb]:appearance-none
  [&::-moz-range-thumb]:bg-white
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
                min=".25"
                max="3"
                step=".25"
                value={downloadSettings.size}
                title={downloadSettings.size}
                onChange={(e) =>
                  setDownloadSettings({
                    ...downloadSettings,
                    size: e.target.value,
                  })
                }
              ></input>
              <span className="flex place-content-end w-full">
                  <span className="italic opacity-50 text-[10px] h-2"> ({Math.ceil(device.size.x * downloadSettings.size)} x {Math.ceil(device.size.y * downloadSettings.size)})</span>
                </span>
            </div> 
            { !downloadSettings.isPng &&
            <div className="flex-col text-xs w-full h-fit items-center gap-x-3.5 py-[8px] rounded-lg text-gray-800 dark:text-neutral-400 ">
              <span className="flex place-content-between w-full">
                <span>Quality</span>
                <span className="text-xs">{Math.round(downloadSettings.quality * 100)}%</span>
                </span>
              <input
                type="range"
                className="w-full bg-transparent cursor-pointer appearance-none disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden
  [&::-webkit-slider-thumb]:w-2.5
  [&::-webkit-slider-thumb]:h-2.5
  [&::-webkit-slider-thumb]:-mt-0.5
  [&::-webkit-slider-thumb]:appearance-none
  [&::-webkit-slider-thumb]:bg-white
  [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(37,99,235,1)]
  [&::-webkit-slider-thumb]:rounded-full
  [&::-webkit-slider-thumb]:transition-all
  [&::-webkit-slider-thumb]:duration-150
  [&::-webkit-slider-thumb]:ease-in-out
  dark:[&::-webkit-slider-thumb]:bg-neutral-700

  [&::-moz-range-thumb]:w-2.5
  [&::-moz-range-thumb]:h-2.5
  [&::-moz-range-thumb]:appearance-none
  [&::-moz-range-thumb]:bg-white
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
                step=".01"
                value={downloadSettings.quality}
                title={downloadSettings.quality}
                onChange={(e) =>
                  setDownloadSettings({
                    ...downloadSettings,
                    quality: e.target.value,
                  })
                }
              ></input>
            </div> }
            <button
              type="button"
              onClick={exportImage}
              class="p-1 mt-5 mb-2.5 inline-flex justify-center w-full text-sm font-medium rounded-sm border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
            >
              Download
            </button>
          </div>
        </div>

    )
}
)

export default ExportButton