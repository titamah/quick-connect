import { useState, useEffect, useRef, useContext } from "react";
import "preline/preline";
import { Resizable } from "react-resizable";
import { DeviceContext } from "../../App";
import QRGenerator from "./QRGenerator"
import DeviceTypeSelector from "./DeviceTypeSelector"
import ToggleButtonArrow from "./ToggleButtonArrow";
import BackgroundSelector from "./BackgroundSelector"

function Panel({ isOpen, setIsOpen, panelSize, setPanelSize, wallpaperRef }) {
  const { device, setDevice } = useContext(DeviceContext);
  const [activeAccordions, setActiveAccordions] = useState([
    "accordion-one",
    "accordion-two",
    "accordion-three",
  ]);

  const handleNameChange = (event) => {
    setDevice((prevDevice) => ({
      ...prevDevice,
      name: event.target.value,
    }));
  };


  // Panel Box
  const panelRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState(0);

  const onResizeSide = (event, { size }) => {
    setPanelSize({ width: size.width, height: panelSize.height });
  };
  const onResizeBottom = (event, { size }) => {
    setPanelSize({ width: panelSize.width, height: size.height });
  };

  useEffect(() => {
    import("preline/preline").then((module) => {
      module.HSStaticMethods.autoInit();
    });
    const canvas = document.getElementById("Canvas");
    setMaxHeight(canvas.clientHeight);
    console.log(maxHeight);
  }, []);

  const togglePanel = () => {
    setIsOpen(!isOpen);
    const canvas = document.getElementById("Canvas");
    setMaxHeight(canvas.clientHeight);
    console.log(maxHeight);
  };

  const toggleAccordion = (accordionId) => {
    activeAccordions.includes(accordionId)
      ? setActiveAccordions(activeAccordions.filter((id) => id !== accordionId))
      : setActiveAccordions([...activeAccordions, accordionId]);
  };

  return (
    <>
      <Resizable
        className="duration-100"
        width={panelSize.width}
        height={0}
        minConstraints={[100, 0]}
        onResize={onResizeSide}
        resizeHandles={["e"]}
        handle={
          <div className="fixed z-1500 right-0 top-0 h-full w-[10px] cursor-col-resize">
            <div className="fixed right-0 top-1/2 cursor-pointer z-200">
            </div>
          </div>
        }
      >
        <div
          id="side-panel"
          ref={panelRef}
          className={` hs-overlay fixed max-sm:hidden [--body-scroll:true] transition-[left] duration-350 transform h-[calc(100vh-52px)] z-100 bg-white shadow-[3px_0_8px_1px_rgba(0,0,0,0.075)] dark:bg-neutral-800 dark:border-neutral-700`}
          style={{
            left: isOpen ? 0 : `${panelSize.width * -1}px`,
            width: `${panelSize.width}px`,
          }}
          role="dialog"
          aria-labelledby="hs-offcanvas-example-label"
        >
        <span
          className="absolute top-1/2 right-0 translate-x-1/2 block w-5 h-7 flex items-center bg-white border border-gray-200 text-gray-400 rounded-md  hover:bg-gray-100 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-600 dark:hover:bg-neutral-900"
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
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="8" cy="12" r="1" />
            <circle cx="8" cy="5" r="1" />
            <circle cx="8" cy="19" r="1" />
            <circle cx="16" cy="12" r="1" />
            <circle cx="16" cy="5" r="1" />
            <circle cx="16" cy="19" r="1" />
          </svg>
        </span>
        <span className="overflow-hidden" >
          <div
            id="device-info"
            className="flex-col justify-between items-center py-1  px-5"
          >
            <h3 className="font-bold text-gray-800 dark:text-white block">
              <input
                type="text"
                className="text-xl w-full py-[5px] border-b-2 dark:border-neutral-700 dark:text-neutral-400 "
                value={device.name}
                onChange={handleNameChange}
              />
            </h3>
            <DeviceTypeSelector/>
          </div>
          <div
            id="panel-sections"
            className="hs-accordion-group"
            data-hs-accordion-always-open
          >
            <div
              className={`hs-accordion border-t border-neutral-300/50 dark:border-neutral-700/50 py-2  px-5 ${
                activeAccordions.includes("accordion-one") ? "active" : ""
              }`}
              id="hs-basic-with-title-and-arrow-stretched-heading-one"
            >
              <button
                className={`${
                  activeAccordions.includes("accordion-one")
                    ? "opacity-100"
                    : "opacity-66"
                } hs-accordion-toggle inline-flex text-sm items-center justify-between gap-x-3 w-full font-medium text-gray-800 hover:text-gray-500 dark:text-neutral-200 dark:hover:text-neutral-400`}
                aria-expanded={activeAccordions.includes("accordion-one")}
                aria-controls="hs-basic-with-title-and-arrow-stretched-collapse-one"
                onClick={() => toggleAccordion("accordion-one")}
              >
                <text> QR Code</text>
                <ToggleButtonArrow isOpen={activeAccordions.includes("accordion-one")}/>
              </button>
              <div
                id="hs-basic-with-title-and-arrow-stretched-collapse-one"
                className={`hs-accordion-content w-full overflow-hidden transition-[height] duration-300 ${
                  activeAccordions.includes("accordion-one")
                    ? "block"
                    : "hidden"
                }`}
                role="region"
                aria-labelledby="hs-basic-with-title-and-arrow-stretched-heading-one"
              >
                <QRGenerator panelSize={panelSize}/>
              </div>
            </div>
            <div
              className={`hs-accordion  border-y  border-neutral-300/50 dark:border-neutral-700/50  ${
                activeAccordions.includes("accordion-two") ? "active" : ""
              }`}
              id="hs-basic-with-title-and-arrow-stretched-heading-one"
            >
              <button
                className={`${
                  activeAccordions.includes("accordion-two")
                    ? "opacity-100"
                    : "opacity-66"
                } hs-accordion-toggle py-3 px-5 inline-flex text-sm items-center justify-between gap-x-3 w-full font-medium text-gray-800 hover:text-gray-500 dark:text-neutral-200 dark:hover:text-neutral-400`}
                aria-expanded={activeAccordions.includes("accordion-two")}
                aria-controls="hs-basic-with-title-and-arrow-stretched-collapse-one"
                onClick={() => toggleAccordion("accordion-two")}
              >
                <text> Background </text>
                <ToggleButtonArrow isOpen={activeAccordions.includes("accordion-two")}/>
              </button>
              <div
                id="hs-basic-with-title-and-arrow-stretched-collapse-one"
                className={`hs-accordion-content w-full overflow-hidden transition-[height] duration-300 ${
                  activeAccordions.includes("accordion-two")
                    ? "block"
                    : "hidden"
                }`}
                role="region"
                aria-labelledby="hs-basic-with-title-and-arrow-stretched-heading-one"
              >
                 <BackgroundSelector/>
              </div>
            </div>
            <div 
              className={`hs-accordion  py-3  px-5  ${
                activeAccordions.includes("accordion-three") ? "active" : ""
              }`}
              id="hs-basic-with-title-and-arrow-stretched-heading-one"
            >
              <button
                className={`${
                  activeAccordions.includes("accordion-three")
                    ? "opacity-100"
                    : "opacity-66"
                } hs-accordion-toggle inline-flex text-sm items-center justify-between gap-x-3 w-full font-medium text-gray-800 hover:text-gray-500 dark:text-neutral-200 dark:hover:text-neutral-400`}
                aria-expanded={activeAccordions.includes("accordion-three")}
                aria-controls="hs-basic-with-title-and-arrow-stretched-collapse-one"
                onClick={() => toggleAccordion("accordion-three")}
              >
                <text> Border </text>
                
                <ToggleButtonArrow isOpen={activeAccordions.includes("accordion-three")}/>
              </button>
              <div
                id="hs-basic-with-title-and-arrow-stretched-collapse-one"
                className={`hs-accordion-content w-full overflow-hidden transition-[height] duration-300 ${
                  activeAccordions.includes("accordion-three")
                    ? "block"
                    : "hidden"
                }`}
                role="region"
                aria-labelledby="hs-basic-with-title-and-arrow-stretched-heading-one"
              >
                QR Code Visual Stuff
              </div>
            </div>
          </div>
          </span>
        </div>
      </Resizable>
      {/* <Resizable // Bottom Panel
        className="duration-100"
        width={0}
        height={panelSize.height}
        minConstraints={[0, 100]}
        maxConstraints={[0, maxHeight]}
        onResize={onResizeBottom}
        resizeHandles={["n"]}
        handle={
          <div className="fixed z-150 right-0 top-0 h-[10px] w-full cursor-row-resize">
            <div className="cursor-pointer z-200" onClick={togglePanel}>
              <span className="absolute start-1/2 -translate-x-1/2 -translate-y-1/2 block w-7 h-5 flex justify-center items-center bg-white border border-gray-200 text-gray-400 rounded-md hover:bg-gray-100 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-600 dark:hover:bg-neutral-900">
                <svg
                  className="shrink-0 size-4.5"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
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
              Some text as placeholder. In real life you can have the elements
              you have chosen. Like, text, images, lists, etc.
            </p>
          </div>
        </div>
      </Resizable> */}
    </>
  );
}

export default Panel;
