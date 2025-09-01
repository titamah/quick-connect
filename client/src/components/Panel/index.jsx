import { useState, useEffect, useRef } from "react";

import Tabs from "antd/es/tabs/index.js";
import { QrCode, Proportions, Image, Download } from "lucide-react";
import { Resizable } from "react-resizable";
import QRGenerator from "./QRGenerator";
import DeviceTypeSelector from "./DeviceTypeSelector";
import CustomBackgroundSelector from "./CustomBackgroudSelector";
import Exporter from "./Exporter";
import { useDevice } from "../../contexts/DeviceContext";
import "./styles.css";

function Panel({ isOpen, setIsOpen, panelSize, setPanelSize, wallpaperRef }) {
  const { isMobile } = useDevice();
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
    const canvas = document.getElementById("Canvas");
    setMaxHeight(canvas.clientHeight);
    console.log(maxHeight);
  }, []);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    console.log("IS OPEN?", isOpen, panelSize);
  }, [isOpen]);

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
    {
      key: "4",
      label: <Download className="size-7.5" />,
      children: <Exporter ref={wallpaperRef} />,
    },
  ];

  return (
    <div className="relative w-[100vw] h-full">
      <Resizable
        className="duration-100"
        width={panelSize.width}
        height={0}
        minConstraints={[350, 0]}
        maxConstraints={[600, 0]}
        onResize={onResizeSide}
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
          className={`fixed  ${
            isMobile ? "hidden" : ""
          }  [--body-scroll:true] transition-[left] duration-350 transform h-[calc(100vh-52px)] z-100 bg-[var(--bg-main)] shadow-[0_0_10px_0_rgba(0,0,0,0.075)]`}
          style={{
            left: isOpen ? 0 : `${panelSize.width * -1}px`,
            width: `${panelSize.width}px`,
          }}
          role="dialog"
          aria-labelledby="hs-offcanvas-example-label"
        >
          <span
            className="absolute top-1/2 right-0 translate-x-1/2 block w-5 h-7 flex items-center border border-[var(--border-color)] text-[var(--contrast)]/50 rounded-md bg-[var(--bg-main)] hover:text-[var(--contrast-sheer)] z-100"
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
              destroyInactiveTabPane={false}
            />
          </div>
        </div>
      </Resizable>
      {/* <Resizable // Bottom Panel
        className="duration-100 fixed bottom-0 left-0 right-0"
        width={0}
        height={panelSize.height}
        minConstraints={[0, 100]}
        maxConstraints={[0, maxHeight]}
        onResize={onResizeBottom}
        resizeHandles={["n"]}
        handle={
          <div className="absolute z-150 right-0 top-0 h-[10px] w-full cursor-row-resize">
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
      > */}
      <div
        id="bottom-panel"
        className={`fixed bottom-0 rounded-t-2xl w-full ${
          !isMobile ? "hidden" : ""
        } transition-[bottom] duration-350 transform z-100 bg-[var(--bg-main)] shadow-[0_0_10px_0_rgba(0,0,0,0.225)]`}
        style={{
          bottom: isOpen ? 0 : `-${panelSize.height}px`,
          height: `450px`,
        }}
        role="dialog"
        aria-labelledby="hs-offcanvas-example-label"
      >
        <div className="absolute z-150 right-0 top-0 h-[10px] w-full cursor-row-resize ">
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
          <div className="overflow-auto">
            <Tabs
              onTabClick={(key) => {
                setActiveTab(key);
              }}
              centered
              size="small"
              tabPosition="bottom"
              items={items}
              destroyInactiveTabPane={false}
              className="absolute bottom-0 w-full h-full"
            />
          </div>
      </div>
    </div>
  );
}

export default Panel;