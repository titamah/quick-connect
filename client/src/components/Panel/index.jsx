import { useState, useEffect, useRef } from "react";
import "preline/preline";
import { Tabs } from "antd";
import { QrCode, Proportions, Image } from "lucide-react";
import { Resizable } from "react-resizable";
import { useDevice } from "../../contexts/DeviceContext";
import QRGenerator from "./QRGenerator";
import DeviceTypeSelector from "./DeviceTypeSelector";
import ToggleButtonArrow from "./ToggleButtonArrow";
import CustomBackgroundSelector from "./CustomBackgroudSelector";
import "./styles.css";

function Panel({ isOpen, setIsOpen, panelSize, setPanelSize, wallpaperRef }) {
  const { device, updateDeviceInfo } = useDevice();
  const [activeAccordions, setActiveAccordions] = useState([
    // "accordion-one",
    "accordion-two",
    // "accordion-three",
  ]);

  const handleNameChange = (event) => {
    updateDeviceInfo({ name: event.target.value });
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

  const [activeTab, setActiveTab] = useState("1");

  useEffect(() => {
    const timer = setTimeout(() => {
      const panelElement = panelRef.current;
      if (!panelElement) return;
      const tabpanels = panelElement.querySelectorAll('[role="tabpanel"]');
      tabpanels.forEach((el) => {
        el.style.paddingLeft = "0px";
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [activeTab]);

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

  const items = [
    {
      key: "1",
      label: <Proportions className="size-7.5" />,
      children: <DeviceTypeSelector />,
    },
    {
      key: "2",
      label: <QrCode className="size-7.5" />,
      children: <QRGenerator panelSize={panelSize} />,
    },
    {
      key: "3",
      label: <Image className="size-7.5" />,
      children: <CustomBackgroundSelector panelSize={panelSize} />,
    },
  ];

  return (
    <>
      <Resizable
        className="duration-100"
        width={panelSize.width}
        height={0}
        minConstraints={[350, 0]}
        onResize={onResizeSide}
        // onResizeStop={onResizeSide}
        resizeHandles={["e"]}
        handle={
          <div className="fixed z-1500 right-0 top-0 h-full w-[10px] cursor-col-resize">
            <div className="fixed right-0 top-1/2 cursor-pointer z-200"></div>
          </div>
        }
      >
        <div
          id="side-panel"
          ref={panelRef}
          className={`hs-overlay fixed max-sm:hidden [--body-scroll:true] transition-[left] duration-350 transform h-[calc(100vh-52px)] z-100 bg-white shadow-[3px_0_8px_1px_rgba(0,0,0,0.075)] dark:bg-neutral-800 dark:border-neutral-700`}
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
          <div className="h-full">
            <Tabs
              onTabClick={(key) => {
                setActiveTab(key);
              }}
              tabBarStyle={{ marginTop: "24px" }}
              className="h-full"
              tabPosition="left"
              items={items}
            />
          </div>
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