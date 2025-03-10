import { useState, useEffect, useRef, useContext } from "react";
import "preline/preline";
import { Resizable } from "react-resizable";
import { DeviceContext } from "../../App";

function Panel({ isOpen, setIsOpen, panelSize, setPanelSize }) {
  const { device, setDevice } = useContext(DeviceContext);
  const [deviceName, setDeviceName] = useState(device.name);
  const [deviceSize, setDeviceSize] = useState(device.size);
  const [activeAccordions, setActiveAccordions] = useState([
    "accordion-one",
    "accordion-two",
    "accordion-three",
  ]);
  const [tempQr, setTempQr] = useState(device.qr);

  const handleNameChange = (event) => {
    setDevice((prevDevice) => ({
      ...prevDevice,
      name: event.target.value,
    }));
  };

  const handleQrChange = () => {
    setDevice((prevDevice) => ({
      ...prevDevice,
      qr: tempQr,
    }));
  };

  const devicesSizes = [
    { name: "test phone", size: { x: 124, y: 778 } },
    { name: "iPhone 14 Pro Max", size: { x: 1284, y: 2778 } },
    { name: "iPhone 16 Pro", size: { x: 1179, y: 2556 } },
    { name: "iPhone 16 Pro Max", size: { x: 1290, y: 2796 } },
    { name: "Samsung Galaxy S23 Ultra", size: { x: 1440, y: 3088 } },
    { name: "Samsung Galaxy S24 Ultra", size: { x: 1440, y: 3120 } },
    { name: "Samsung Galaxy S25", size: { x: 1179, y: 2556 } },
    { name: "Samsung Galaxy Z Flip 5", size: { x: 1080, y: 2640 } },
    { name: "Google Pixel 8a", size: { x: 1080, y: 2400 } },
    { name: "Google Pixel 9", size: { x: 1080, y: 2340 } },
    { name: "Google Pixel 9 Pro", size: { x: 1344, y: 2992 } },
    { name: "OnePlus 12", size: { x: 1440, y: 3168 } },
    { name: "Sony Xperia 5 V", size: { x: 1080, y: 2520 } },
    { name: "Xiaomi 14 Ultra", size: { x: 1440, y: 3200 } },
  ];

  function deviceList() {
    const updateDevice = (i) => {
      setDeviceName(i.name);
      setDeviceSize(i.size);
      setDevice((prevDevice) => ({
        ...prevDevice,
        type: i.name,
        size: i.size,
      }));
    };

    let deviceCount = -1;
    const deviceSizeOptions = devicesSizes.map((i) => {
      deviceCount++;
      return (
        <div
          key={deviceCount}
          onClick={(e) => updateDevice(i, e)}
          className="flex justify-between text-xs w-full h-fit items-center gap-x-3.5 py-[7.5px] px-[5px] rounded-lg text-gray-800 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700"
        >
          <span>{`${i.name} `}</span>
          <span className="font-thin text-xs italic">{`(${i.size.x} x ${i.size.y})`}</span>
        </div>
      );
    });
    return (
      <div className="p-1 w-max max-h-[40vh] overflow-y-scroll space-y-0.5">
        <div
          key={0}
          onClick={() => {
            console.log(key);
          }}
          className="flex text-xs w-full h-fit items-center gap-x-3.5 py-[7.5px] px-[5px] rounded-lg text-gray-800 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700"
        >
          <span className="font-thin text-xl">{"+"}</span>
          Custom Size
        </div>

        {deviceSizeOptions}
      </div>
    );
  }

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
          <div className="fixed z-150 right-0 top-0 h-full w-[10px] cursor-col-resize">
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
            <div
              id="device-type-dropdown"
              className="hs-dropdown relative -mx-1 py-2 "
            >
              <button
                id="hs-dropdown-custom-trigger"
                type="button"
                className="hs-dropdown-toggle max-w-full py-1 px-2 inline-flex items-center gap-x-2 text-sm font-medium rounded-full border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
                aria-haspopup="menu"
                aria-expanded="false"
                aria-label="Dropdown"
              >
                <span className="text-gray-600 text-xs truncate  dark:text-neutral-400">
                  {`${device.type} `}
                  {
                    <span className="font-thin">{`(${device.size.x} x ${device.size.y})`}</span>
                  }
                </span>
                <svg
                  className="hs-dropdown-open:rotate-180 size-4"
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
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <div
                id="device-type-menu"
                className="hs-dropdown-menu z-1000 -translate-y-[12.5px] transition-[opacity,margin] duration hidden min-w-60 min-w-60 bg-white shadow-md rounded-lg mt-2 dark:bg-neutral-800 dark:border dark:border-neutral-700"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="hs-dropdown-custom-trigger"
              >
                {deviceList()}
              </div>
            </div>
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
                <svg
                  className={`${
                    !activeAccordions.includes("accordion-one")
                      ? "hidden"
                      : "block"
                  } size-4`}
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
                  <path d="m6 9 6 6 6-6"></path>
                </svg>
                <svg
                  className={`${
                    !activeAccordions.includes("accordion-one")
                      ? "block"
                      : "hidden"
                  } size-4`}
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
                  <path d="m18 15-6-6-6 6"></path>
                </svg>
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
                <div id="qr-input-box" className="flex py-2">
                  <input
                    id="qr-input"
                    type="text"
                    className="text-sm !select-all w-full p-[5px] me-[7.5px] -mx-[2.5px] inline-flex rounded-md bg-black/10 dark:border-neutral-700 dark:text-neutral-400 "
                    value={tempQr}
                    onChange={(e) => setTempQr(e.target.value)}
                  />
                  <button
                    id="qr-input-submit"
                    onClick={handleQrChange}
                    className=" inline-flex m-auto h-fit w-fit rounded-[100%] p-[2.5px] bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-check"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </button>
                </div>
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
                <svg
                  className={`${
                    !activeAccordions.includes("accordion-two")
                      ? "hidden"
                      : "block"
                  } size-4`}
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
                  <path d="m6 9 6 6 6-6"></path>
                </svg>
                <svg
                  className={`${
                    !activeAccordions.includes("accordion-two")
                      ? "block"
                      : "hidden"
                  } size-4`}
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
                  <path d="m18 15-6-6-6 6"></path>
                </svg>
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
                    {/* <button type="button" class="hs-tab-active:font-semibold hs-tab-active:border-blue-600 hs-tab-active:text-blue-600 py-1 px-1 inline-flex items-center gap-x-2 border-b-2 border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-blue-600 focus:outline-hidden focus:text-blue-600 disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:hover:text-blue-500" id="tabs-with-underline-item-3" aria-selected="false" data-hs-tab="#tabs-with-underline-3" aria-controls="tabs-with-underline-3" role="tab">
                  Tab 3
                </button> */}
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
                <text> QR Code</text>
                <svg
                  className={`${
                    !activeAccordions.includes("accordion-three")
                      ? "hidden"
                      : "block"
                  } size-4`}
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
                  <path d="m6 9 6 6 6-6"></path>
                </svg>
                <svg
                  className={`${
                    !activeAccordions.includes("accordion-three")
                      ? "block"
                      : "hidden"
                  } size-4`}
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
                  <path d="m18 15-6-6-6 6"></path>
                </svg>
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
                <div id="qr-input-box" className="flex">
                  <input
                    id="qr-input"
                    type="text"
                    className="text-sm w-full p-[5px] me-[7.5px] -mx-[2.5px] inline-flex rounded-md bg-black/10 dark:border-neutral-700 dark:text-neutral-400 "
                    value={device.qr}
                    onChange={handleQrChange}
                  />
                  <button
                    id="qr-input-submit"
                    className=" inline-flex m-auto h-fit w-fit rounded-[100%] p-[2.5px] bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-check"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Resizable>
      <Resizable // Bottom Panel
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
      </Resizable>
    </>
  );
}

export default Panel;
