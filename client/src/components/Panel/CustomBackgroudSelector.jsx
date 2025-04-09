import { useState, useContext, useEffect } from "react";
import "preline/preline";
import { DeviceContext } from "../../App";
import ImageUploader from "./ImageUploader";
import ColorSelector from "./ColorSelector";
import GradientSelector from "./GradientSelector";

function CustomBackgroundSelector() {
  const [activeTab, setActiveTab] = useState(1);
  const { device, setDevice } = useContext(DeviceContext);

  // useEffect(()=>{
  //   const customTab = document.querySelector(".bg-tab-1");
  //   const libraryTab = document.querySelector(".bg-tab-2");
  //   customTab.classList.add("!text-gray-500");
  // },[])

  // const setActive = (index) => {
  //   if (index == 1){
  //     setDevice((prevDevice) => ({
  //       ...prevDevice,
  //       style: "solid",
  //     }));
  //   } else if (index == 2){
  //     setDevice((prevDevice) => ({
  //       ...prevDevice,
  //       style: "gradient",
  //     }));
  //   }
  //   else if (index == 3){
  //     setDevice((prevDevice) => ({
  //       ...prevDevice,
  //       style: "image",
  //     }));
  //   }
  // };

  return (
    <div
      id="tabs-with-underline-1"
      role="tabpanel"
      aria-labelledby="tabs-with-underline-item-1"
      // onClick={setActive(0}
    >
      <div className="border-b-[.5px] border-gray-200 dark:border-neutral-700">
        <nav
          className="flex gap-x-2.5 text-x px-4 py-1"
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
          >
            <span
              onClick={() => {
                setActiveTab(1);
              }}
              className={`inline-flex justify-center items-center size-7 rounded-md active:bg-black/20 ${
                activeTab == 1 ? "bg-neutral-400/20" : "hover:bg-black/20"
              } text-neutral-950 dark:text-white`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                strokeLinecap="round"
                stroke-linejoin="round"
                className="lucide lucide-square-square"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <rect x="8" y="8" width="8" height="8" rx="1" />
              </svg>
            </span>
          </button>
          <button
            type="button"
            className="hs-tab-active:font-semibold hs-tab-active:border-neutral-600 hs-tab-active:text-blue-600 inline-flex items-center gap-x-2 border-b-2 border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-blue-600 focus:outline-hidden focus:text-blue-600 disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:hover:text-blue-500 active"
            id="custom-tabs-with-underline-item-2"
            aria-selected="false"
            data-hs-tab="#custom-tabs-with-underline-2"
            aria-controls="custom-tabs-with-underline-2"
            role="tab"
          >
            <span
              onClick={() => {
                setActiveTab(2);
              }}
              className={`inline-flex justify-center items-center size-7 rounded-md active:bg-black/20 ${
                activeTab == 2 ? "bg-neutral-400/20" : "hover:bg-black/20"
              } text-neutral-950 dark:text-white`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                strokeLinecap="round"
                stroke-linejoin="round"
                className="lucide lucide-panel-left-dashed"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M7 14v1" />
                <path d="M7 19v2" />
                <path d="M7 3v2" />
                <path d="M7 9v1" />
                <path d="M12 16v1" />
                <path d="M12 6v1" />
                <path d="M12 11v1" />
              <path d="M17 14v1" />
              <path d="M17 19v2" />
              <path d="M17 3v2" />
              <path d="M17 9v1" />
              </svg>
            </span>
          </button>
          <button
            type="button"
            className="hs-tab-active:font-semibold hs-tab-active:border-neutral-600 hs-tab-active:text-blue-600 inline-flex items-center gap-x-2 border-b-2 border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-blue-600 focus:outline-hidden focus:text-blue-600 disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:hover:text-blue-500 active"
            id="custom-tabs-with-underline-item-3"
            aria-selected="false"
            data-hs-tab="#custom-tabs-with-underline-3"
            aria-controls="custom-tabs-with-underline-3"
            role="tab"
          >
            <span
              onClick={() => {
                setActiveTab(3);
              }}
              className={`inline-flex justify-center items-center size-7 rounded-md active:bg-black/20 ${
                activeTab == 3 ? "bg-neutral-400/20" : "hover:bg-black/20"
              } text-neutral-950 dark:text-white`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                strokeLinecap="round"
                stroke-linejoin="round"
                className="lucide lucide-image"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </span>
          </button>
        </nav>
      </div>
      <div className="mt-3">
        <div
          id="custom-tabs-with-underline-1"
          role="tabpanel"
          aria-labelledby="custom-tabs-with-underline-item-1"
        >
          <ColorSelector/>
        </div>
        <div
          id="custom-tabs-with-underline-2"
          className="hidden"
          role="tabpanel"
          aria-labelledby="custom-tabs-with-underline-item-2"
        >
          <GradientSelector/>
        </div>
        <div
          id="custom-tabs-with-underline-3"
          className="hidden"
          role="tabpanel"
          aria-labelledby="custom-tabs-with-underline-item-3"
        >
          <ImageUploader />
        </div>
      </div>
    </div>
  );
}

export default CustomBackgroundSelector;
