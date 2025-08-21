import { useState, useEffect } from "react";
import { useDevice } from "../../contexts/DeviceContext";
import "preline/preline";
import ImageUploader from "./ImageUploader";
import OptimizedColorSelector from "./OptimizedColorSelector";
import GradientSelector from "./GradientSelector";

function CustomBackgroundSelector(panelSize) {
  const [activeTab, setActiveTab] = useState(1);
  const { device, updateBackground, updateQRConfig, updateDeviceInfo } = useDevice();

  const setBGStyle = (index) => {
    if (index == 1) {
      updateBackground({ style: "solid" });
    } else if (index == 2) {
      updateBackground({ style: "gradient" });
    } else if (index == 3) {
      updateBackground({ style: "image" });
    }
  };

  return (
    <div
      id="tabs-with-underline-1"
      role="tabpanel"
      aria-labelledby="tabs-with-underline-item-1"
      // onClick={setActive(0}
    >
      <div className="border-b-[.5px] border-gray-200 dark:border-neutral-700 px-4 py-1">
        Background
        <nav
          className="flex gap-x-2.5 text-x py-1"
          aria-label="Tabs"
          role="tablist"
          aria-orientation="horizontal"
        >
          <button
            type="button"
            className="hs-tab-active:font-semibold hs-tab-active:border-neutral-600 hs-tab-active:text-blue-600 inline-flex items-center gap-x-2 border-b-2 border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-blue-600 focus:outline-hidden focus:text-blue-600 disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:hover:text-blue-500 active"
            id="custom-tabs-with-underline-item-1"
            aria-selected="true"
            data-hs-tab="#custom-tabs-with-underline-1"
            aria-controls="custom-tabs-with-underline-1"
            role="tab"
              onClick={() => {
                setBGStyle(1);
                setActiveTab(1);
              }}
              className={`inline-flex justify-center items-center rounded-md active:bg-black/20 w-full max-w-[150px] ${
                activeTab == 1 ? "bg-neutral-400/20" : "hover:bg-black/20"
              } text-neutral-950 dark:text-white`}
          >
             Solid
          </button>
          <button
            type="button"
            className="hs-tab-active:font-semibold hs-tab-active:border-neutral-600 hs-tab-active:text-blue-600 inline-flex items-center gap-x-2 border-b-2 border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-blue-600 focus:outline-hidden focus:text-blue-600 disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:hover:text-blue-500 active"
            id="custom-tabs-with-underline-item-2"
            aria-selected="false"
            data-hs-tab="#custom-tabs-with-underline-2"
            aria-controls="custom-tabs-with-underline-2"
            role="tab"
            onClick={() => {
                setBGStyle(2);
                setActiveTab(2);
              }}
              className={`inline-flex justify-center items-center size-7 rounded-md active:bg-black/20 w-full max-w-[150px] ${
                activeTab == 2 ? "bg-neutral-400/20" : "hover:bg-black/20"
              } text-neutral-950 dark:text-white`}
          >
              Gradient
          </button>
          <button
            type="button"
            className="hs-tab-active:font-semibold hs-tab-active:border-neutral-600 hs-tab-active:text-blue-600 inline-flex items-center gap-x-2 border-b-2 border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-blue-600 focus:outline-hidden focus:text-blue-600 disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:hover:text-blue-500 active"
            id="custom-tabs-with-underline-item-3"
            aria-selected="false"
            data-hs-tab="#custom-tabs-with-underline-3"
            aria-controls="custom-tabs-with-underline-3"
            role="tab"
              onClick={() => {
                setBGStyle(3);
                setActiveTab(3);
              }}
              className={`inline-flex justify-center items-center size-7 rounded-md active:bg-black/20 w-full max-w-[150px] ${
                activeTab == 3 ? "bg-neutral-400/20" : "hover:bg-black/20"
              } text-neutral-950 dark:text-white`}
          >
              Image
          </button>
        </nav>
      </div>
      <div className="mt-3">
  {activeTab === 1 && <OptimizedColorSelector panelSize={panelSize}/>}
  {activeTab === 2 && <GradientSelector/>}
  {activeTab === 3 && <ImageUploader />}
</div>
    </div>
  );
}

export default CustomBackgroundSelector;
