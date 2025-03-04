import { useState, useEffect, useRef } from "react";
import "preline/preline";
import { IStaticMethods } from "preline/preline";
import "./styles.css";
import { Resizable } from 'react-resizable';


function Panel({ isOpen, setIsOpen, panelSize, setPanelSize }) {
const panelRef = useRef(null);

const onResize = (event, {size}) => {
  setPanelSize({width:size.width, height:size.height});
};

  useEffect(() => {
    import("preline/preline").then((module) => {
      module.HSStaticMethods.autoInit();
    });
  }, []);

  const togglePanel = () => {
    setIsOpen(!isOpen);
    console.log("toggled");
  };

  return (
    <>
  <Resizable
  className="duration-100"
    width={panelSize.width}
    height={0}
    minConstraints={[100,0]}
    onResize={onResize}
    resizeHandles={['e']}
    handle={
      <div className="fixed z-150 right-0 top-0 h-full w-[10px] cursor-col-resize">
        <div className="fixed right-0 top-1/2 cursor-pointer z-200">
            <span className="absolute start-1/2 -translate-x-1/2 block w-5 h-7 flex items-center bg-white border border-gray-200 text-gray-400 rounded-md  hover:bg-gray-100 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-600 dark:hover:bg-neutral-900"
            onClick={togglePanel}
            >
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
      </div>
    }>
      <div
        id="side-panel"
        ref={panelRef}
        className={`hs-overlay fixed max-sm:hidden [--body-scroll:true] transition-[left] duration-350 transform h-full z-100 bg-white shadow-[3px_0_8px_1px_rgba(0,0,0,0.075)] dark:bg-neutral-800 dark:border-neutral-700`}
        style={{
          left: isOpen ? 0 : `${panelSize.width * -1}px`,
          width: `${panelSize.width}px`,
        }}
        role="dialog"
        aria-labelledby="hs-offcanvas-example-label"
      >
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
            Some text as placeholder. In real life you can have the elements you
            have chosen. Like, text, images, lists, etc.
          </p>
        </div>
      </div>
      </Resizable>
  <Resizable
  className="duration-100"
    width={0}
    height={panelSize.height}
    minConstraints={[0,100]}
    onResize={onResize}
    resizeHandles={['n']}
    handle={
      <div className="fixed z-150 right-0 top-0 h-[10px] w-full cursor-row-resize"> 
      <div className="cursor-pointer z-200"
          onClick={togglePanel}>
      <span className="absolute start-1/2 -translate-x-1/2 -translate-y-1/2 block w-7 h-5 flex justify-center items-center bg-white border border-gray-200 text-gray-400 rounded-md hover:bg-gray-100 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-600 dark:hover:bg-neutral-900">
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
    </div>
    }
    >
      <div
        id="bottom-panel"
        className={`hs-overlay min-sm:hidden fixed [--body-scroll:true] transition-bottom duration-375 transform w-screen z-100 bg-white shadow-[0_-1px_5px_0px_rgba(0,0,0,0.1)] rounded-t-2xl
dark:bg-neutral-800 dark:border-neutral-700`}
        style={{
          bottom: isOpen ? 0 : `${panelSize.height * -1}px`,
          height: `${panelSize.height}px`,
        }}
        role="dialog"
        aria-labelledby="hs-offcanvas-example-label"
      >
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
            Some text as placeholder. In real life you can have the elements you
            have chosen. Like, text, images, lists, etc.
          </p>
        </div>
      </div>
      </Resizable>
    </>
  );
}

export default Panel;
