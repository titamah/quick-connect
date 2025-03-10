import { useState, useContext } from "react";
import "preline/preline";
import { DeviceContext } from "../../App";

function BackgroundSelector() {
  const { device, setDevice } = useContext(DeviceContext);
  const [tempQr, setTempQr] = useState(device.qr);

  const handleQrChange = () => {
    setDevice((prevDevice) => ({
      ...prevDevice,
      qr: tempQr,
    }));
  };


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
      <div class="border-b border-gray-200 dark:border-neutral-700">
        <nav
          class="flex gap-x-1"
          aria-label="Tabs"
          role="tablist"
          aria-orientation="horizontal"
        >
          <button
            type="button"
            class="hs-tab-active:font-semibold hs-tab-active:border-blue-600 hs-tab-active:text-blue-600 py-4 px-1 inline-flex items-center gap-x-2 border-b-2 border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-blue-600 focus:outline-hidden focus:text-blue-600 disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:hover:text-blue-500 active"
            id="custom-tabs-with-underline-item-1"
            aria-selected="true"
            data-hs-tab="#custom-tabs-with-underline-1"
            aria-controls="custom-tabs-with-underline-1"
            role="tab"
          >
            Color Pick
          </button>
          <button
            type="button"
            class="hs-tab-active:font-semibold hs-tab-active:border-blue-600 hs-tab-active:text-blue-600 py-4 px-1 inline-flex items-center gap-x-2 border-b-2 border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-blue-600 focus:outline-hidden focus:text-blue-600 disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:hover:text-blue-500"
            id="custom-tabs-with-underline-item-2"
            aria-selected="false"
            data-hs-tab="#custom-tabs-with-underline-2"
            aria-controls="custom-tabs-with-underline-2"
            role="tab"
          >
            Tab 2
          </button>
          <button
            type="button"
            class="hs-tab-active:font-semibold hs-tab-active:border-blue-600 hs-tab-active:text-blue-600 py-4 px-1 inline-flex items-center gap-x-2 border-b-2 border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-blue-600 focus:outline-hidden focus:text-blue-600 disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:hover:text-blue-500"
            id="custom-tabs-with-underline-item-3"
            aria-selected="false"
            data-hs-tab="#custom-tabs-with-underline-3"
            aria-controls="custom-tabs-with-underline-3"
            role="tab"
          >
            Tab 3
          </button>
        </nav>
      </div>
      <div class="mt-3">
        <div
          id="custom-tabs-with-underline-1"
          role="tabpanel"
          aria-labelledby="custom-tabs-with-underline-item-1"
        >
          CUSTOM COLOR PICKER
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
          UPLOAD AN IMAGE
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

export default BackgroundSelector