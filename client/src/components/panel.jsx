import { useState, useEffect } from "react";
import "preline/preline";
import { IStaticMethods } from "preline/preline";
import './styles.css';

function Panel({isOpen, setIsOpen}) {
  useEffect(() => {
    import("preline/preline").then((module) => {
      module.HSStaticMethods.autoInit();
    });
  }, []);


  const togglePanel = () => {
    setIsOpen(!isOpen);
    console.log("toggled")
  };
  return (
    <>
    <div
          id="side-panel"
          className={`hs-overlay fixed max-sm:hidden [--body-scroll:true] transition-all duration-300 transform h-full w-xs z-100 bg-white shadow-[3px_0_8px_1px_rgba(0,0,0,0.075)] dark:bg-neutral-800 dark:border-neutral-700  ${isOpen ? "left-0" : "-left-[20rem]"
          }`}
          role="dialog"
          aria-labelledby="hs-offcanvas-example-label"
        >
          <button
            type="button"
            className="h-full w-full inline-flex items-center fixed"
            onClick={togglePanel}>
          <div>
            <span className="absolute start-1/1 -translate-x-1/2 block w-5 h-7 flex items-center bg-white border border-gray-200 text-gray-400 rounded-md cursor-col-resize hover:bg-gray-100 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-600 dark:hover:bg-neutral-900">
              <svg
                className="shrink-0 size-4.5"
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
                <circle cx="8" cy="12" r="1" />
                <circle cx="8" cy="5" r="1" />
                <circle cx="8" cy="19" r="1" />
                <circle cx="16" cy="12" r="1" />
                <circle cx="16" cy="5" r="1" />
                <circle cx="16" cy="19" r="1" />
              </svg>
            </span>
          </div>
          </button>
          <div className="flex justify-between items-center py-3 px-4 border-b dark:border-neutral-700">
            <h3
              id="hs-offcanvas-example-label"
              className="font-bold text-gray-800 dark:text-white"
            >
              Offcanvas title
            </h3>
          </div>
          <div className="p-4">
            <p className="text-gray-800 dark:text-neutral-400">
              Some text as placeholder. In real life you can have the elements
              you have chosen. Like, text, images, lists, etc.
            </p>
          </div>
        </div>

        <div
          id="bottom-panel"
          className={`hs-overlay min-sm:hidden fixed [--body-scroll:true] transition-all duration-300 transform h-1/2 w-screen z-100 bg-white shadow-[0_-1px_5px_0px_rgba(0,0,0,0.1)] rounded-t-2xl
dark:bg-neutral-800 dark:border-neutral-700 ${
            isOpen ? "bottom-0" : "-bottom-1/2"
          }`}
          role="dialog"
          aria-labelledby="hs-offcanvas-example-label"
        >
          <button
            type="button"
            className="w-full inline-flex items-center fixed"
            onClick={togglePanel}
          >
            <div>
              <span className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 block w-7 h-5 flex justify-center items-center bg-white border border-gray-200 text-gray-400 rounded-md cursor-col-resize hover:bg-gray-100 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-600 dark:hover:bg-neutral-900">
                <svg
                  className="shrink-0 size-4.5"
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
                  <circle cx="5" cy="8" r="1" />
                  <circle cx="12" cy="8" r="1" />
                  <circle cx="19" cy="8" r="1" />
                  <circle cx="5" cy="16" r="1" />
                  <circle cx="12" cy="16" r="1" />
                  <circle cx="19" cy="16" r="1" />
                </svg>
              </span>
            </div>
          </button>
          <div className="flex justify-between items-center py-3 px-4 border-b dark:border-neutral-700">
            <h3
              id="hs-offcanvas-example-label"
              className="font-bold text-gray-800 dark:text-white"
            >
              Offcanvas title
            </h3>
          </div>
          <div className="p-4">
            <p className="text-gray-800 dark:text-neutral-400">
              Some text as placeholder. In real life you can have the elements
              you have chosen. Like, text, images, lists, etc.
            </p>
          </div>
        </div>
    </>
  );
}

export default Panel;
