import { useState, useContext } from "react";
import "preline/preline";
// import { DeviceContext } from "../../App";
// import ImageUploader from "./ImageUpload";
import CustomBackgroundSelector from "./CustomBackgroudSelector"

function BackgroundSelector() {
  const [activeTab, setActiveTab] = useState(1);
    
    // useEffect(() => {

      // qrCodeRef.current.style.width = "100%";
      // qrCodeRef.current.style.maxWidth = "250px";
      // const currWidth = qrCodeRef.current.offsetWidth;
      // qrCodeRef.current.style.height = `${currWidth}px`;
  
      // const activeTab = document.querySelector(".bg-tab-1");
      // colorPickers.forEach((c) => {
      //   c.style.width = "100%";
      //   c.style.display = "flex";
      //   c.style.flexDirection = "row-reverse";
      //   c.style.justifyContent = "space-between";
      //   c.style.backgroundColor = "rgba(0,0,0,.1)";
      //   c.style.border = "0";
      //   c.style.color = "rgb(255,255,255)";
      // });
    // }, [panelSize]);

  return (
    <>
      <div className="border-b-[.5px] border-gray-200 dark:border-neutral-700">
        <nav
          className="flex gap-x-2.5 text-x px-4"
          aria-label="Tabs"
          role="tablist"
          aria-orientation="horizontal"
        >
          <button
            type="button"
            className="bg-tab-1 py-1 px-1 inline-flex items-center gap-x-2 text-sm whitespace-nowrap text-gray-500/50 hover:text-gray-500 focus:text-gray-500 dark:text-neutral-400/50 dark:focus:text-neutral-400 dark:hover:text-neutral-400/75 active"
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
            className="bg-tab-2 py-1 px-1 inline-flex items-center gap-x-2 text-sm whitespace-nowrap text-gray-500/50 hover:text-gray-500 focus:text-gray-500 dark:text-neutral-400/50 dark:focus:text-neutral-400 dark:hover:text-neutral-400/75 active"
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
      <div className="">
        <CustomBackgroundSelector/>
        <div
          id="tabs-with-underline-2"
          className="hidden"
          role="tabpanel"
          aria-labelledby="tabs-with-underline-item-2"
        >
          <p className="text-gray-500 dark:text-neutral-400">
            This is the{" "}
            <em className="font-semibold text-gray-800 dark:text-neutral-200">
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
