import { useState, useContext } from "react";
import "preline/preline";
import { DeviceContext } from "../../App";
import ImageUploader from "./ImageUpload";

function BackgroundSelector() {
  const [activeTab, setActiveTab] = useState(1);
  return (
    <>
      <div class="border-b-[.5px] border-gray-200 dark:border-neutral-700">
        <nav
          class="flex gap-x-2.5 text-x px-4"
          aria-label="Tabs"
          role="tablist"
          aria-orientation="horizontal"
        >
          <button
            type="button"
            class="hs-tab-active:font-semibold hs-tab-active:border-neutral-600 hs-tab-active:text-blue-600 py-1 px-1 inline-flex items-center gap-x-2 border-b-2 border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-blue-600 focus:outline-hidden focus:text-blue-600 disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:hover:text-blue-500 active"
            id="tabs-with-underline-item-1"
            aria-selected="true"
            data-hs-tab="#tabs-with-underline-1"
            aria-controls="tabs-with-underline-1"
            role="tab"
          >
            Custom
          </button>
          <button
            type="button"
            class="hs-tab-active:font-semibold hs-tab-active:border-blue-600 hs-tab-active:text-blue-600 py-1 px-1 inline-flex items-center gap-x-2 border-b-2 border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-blue-600 focus:outline-hidden focus:text-blue-600 disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:hover:text-blue-500"
            id="tabs-with-underline-item-2"
            aria-selected="false"
            data-hs-tab="#tabs-with-underline-2"
            aria-controls="tabs-with-underline-2"
            role="tab"
          >
            Library
          </button>
        </nav>
      </div>
      <div class="">
        <div
          id="tabs-with-underline-1"
          role="tabpanel"
          aria-labelledby="tabs-with-underline-item-1"
        >
          <div class="border-b-[.5px] border-gray-200 dark:border-neutral-700">
            <nav
              class="flex gap-x-2.5 text-x px-4 py-1"
              aria-label="Tabs"
              role="tablist"
              aria-orientation="horizontal"
            >
              <button
                type="button"
                class="hs-tab-active:font-semibold hs-tab-active:border-neutral-600 hs-tab-active:text-blue-600 inline-flex items-center gap-x-2 border-b-2 border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-blue-600 focus:outline-hidden focus:text-blue-600 disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:hover:text-blue-500 active"
                id="custom-tabs-with-underline-item-1"
                aria-selected="true"
                data-hs-tab="#custom-tabs-with-underline-1"
                aria-controls="custom-tabs-with-underline-1"
                role="tab"
              >
                <span onClick={()=>{setActiveTab(1)}} className={`inline-flex justify-center items-center size-7 rounded-md active:bg-black/20 ${activeTab == 1 ? "bg-white/20" : "hover:bg-black/20"} text-neutral-950 dark:text-white`}>
                <svg
                    class="shrink-0 size-4"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                </span>
              </button>
              <button
                type="button"
                class="hs-tab-active:font-semibold hs-tab-active:border-neutral-600 hs-tab-active:text-blue-600 inline-flex items-center gap-x-2 border-b-2 border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-blue-600 focus:outline-hidden focus:text-blue-600 disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:hover:text-blue-500 active"
                id="custom-tabs-with-underline-item-2"
                aria-selected="false"
                data-hs-tab="#custom-tabs-with-underline-2"
                aria-controls="custom-tabs-with-underline-2"
                role="tab"
              >
                <span onClick={()=>{setActiveTab(2)}} className={`inline-flex justify-center items-center size-7 rounded-md active:bg-black/20 ${activeTab == 2 ? "bg-white/20" : "hover:bg-black/20"} text-neutral-950 dark:text-white`}>
                <svg
                    class="shrink-0 size-4"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                </span>
              </button>
              <button
                type="button"
                class="hs-tab-active:font-semibold hs-tab-active:border-neutral-600 hs-tab-active:text-blue-600 inline-flex items-center gap-x-2 border-b-2 border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-blue-600 focus:outline-hidden focus:text-blue-600 disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:hover:text-blue-500 active"
                id="custom-tabs-with-underline-item-3"
                aria-selected="false"
                data-hs-tab="#custom-tabs-with-underline-3"
                aria-controls="custom-tabs-with-underline-3"
                role="tab"
              >
                <span onClick={()=>{setActiveTab(3)}} className={`inline-flex justify-center items-center size-7 rounded-md active:bg-black/20 ${activeTab == 3 ? "bg-white/20" : "hover:bg-black/20"} text-neutral-950 dark:text-white`}>
                  <svg
                    class="shrink-0 size-4"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                </span>
              </button>
            </nav>
          </div>
          <div class="mt-3">
            <div
              id="custom-tabs-with-underline-1"
              role="tabpanel"
              aria-labelledby="custom-tabs-with-underline-item-1"
            >
              <input type="color" class="p-1 h-10 w-14 block bg-white border border-gray-200 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700" id="hs-color-input" value="#2563eb" title="Choose your color"/>
            </div>
            <div
              id="custom-tabs-with-underline-2"
              class="hidden"
              role="tabpanel"
              aria-labelledby="custom-tabs-with-underline-item-2"
            >
              GRADIENT MAKER
            </div>
            <div
              id="custom-tabs-with-underline-3"
              class="hidden"
              role="tabpanel"
              aria-labelledby="custom-tabs-with-underline-item-3"
            >
              <ImageUploader/>
            </div>
          </div>
        </div>
        <div
          id="tabs-with-underline-2"
          class="hidden"
          role="tabpanel"
          aria-labelledby="tabs-with-underline-item-2"
        >
          <p class="text-gray-500 dark:text-neutral-400">
            This is the{" "}
            <em class="font-semibold text-gray-800 dark:text-neutral-200">
              second
            </em>{" "}
            item's tab body.
          </p>
        </div>
      </div>
    </>
  );
}

export default BackgroundSelector;
