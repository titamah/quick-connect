import { useState, useEffect, useRef, Suspense, lazy } from "react";
import { QrCode, Proportions, Image, Download, Loader } from "lucide-react";
import { Resizable } from "react-resizable";
import QRGenerator from "./QRGenerator";
import DeviceTypeSelector from "./DeviceTypeSelector";
import CustomBackgroundSelector from "./CustomBackgroudSelector";
import Exporter from "./Exporter";
import { useDevice } from "../../contexts/DeviceContext";
import "./styles.css";

// Lazy load heavy components
const ImageInput = lazy(() => import("./ImageInput"));
const GradientSelector = lazy(() => import("./GradientSelector"));

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

  const handleTabClick = (key) => {
    if (key === 1 || key === 2) {
      setPanelSize({ ...panelSize, height: 450 });
    } else if (key === 3) {
      setPanelSize({ ...panelSize, height: 375 });
    }
  };

  const items = [
    {
      key: "1",
      label: <Proportions className={`size-7.5 m-2 w-full cursor-pointer ${activeTab === "1" ? "text-[var(--accent)]" : ""}`} onClick={() => {setActiveTab("1"); !isOpen && togglePanel()}}/>,
      children: <DeviceTypeSelector />,
    },
    {
      key: "2",
      label: <QrCode className={`size-7.5 m-2 w-full cursor-pointer ${activeTab === "2" ? "text-[var(--accent)]" : ""}`} onClick={() => {setActiveTab("2"); !isOpen && togglePanel()}}/>,
      children: <QRGenerator panelSize={panelSize} />,
    },
    {
      key: "3",
      label: <Image className={`size-7.5 m-2 w-full cursor-pointer ${activeTab === "3" ? "text-[var(--accent)]" : ""}`} onClick={() => {setActiveTab("3"); !isOpen && togglePanel()}}/>,
      children: <CustomBackgroundSelector panelSize={panelSize} />,
    },
    {
      key: "4",
      label: <Download className={`size-7.5 m-2 w-full cursor-pointer ${activeTab === "4" ? "text-[var(--accent)]" : ""}`} onClick={() => {setActiveTab("4"); !isOpen && togglePanel()}}/>,
      children: <Exporter wallpaperRef={wallpaperRef} />,
    },
  ];

  return (
    <div className="relative w-[100vw] h-full">
      {/* Side Panel Tab Bar - Always Visible */}
      <div className={`fixed left-0 top-[52px] z-110 ${
        isMobile ? "hidden" : ""
      }`}>
        <div className="p-1.5 w-[64px] items-center flex flex-col gap-2 border-r border-[var(--border-color)] text-[var(--text-primary)] bg-[var(--bg-main)] h-[calc(100vh-52px)] shadow-[2px_0_10px_0_rgba(0,0,0,0.075)]">
          {items.map((item) => (
            item.label
          ))}
        </div>
      </div>
      
      <Resizable
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
          }  [--body-scroll:true] transition-[left] duration-350 transform h-[calc(100vh-52px)] z-100 bg-[var(--bg-main)] shadow-[0_0_10px_0_rgba(0,0,0,0.075)] `}
          style={{
            left: isOpen ? 64 : `${(panelSize.width + 64) * -1}px`,
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
          <div className="h-full flex flex-row w-full">
            <div className="flex-1">
              {items[activeTab - 1].children}
            </div>
          </div>
        </div>
      </Resizable>
      
      {/* Bottom Panel Tab Bar - Always Visible */}
      <div className={`fixed bottom-0 left-0 right-0 z-110 ${
        isMobile ? "" : "hidden"
      }`}>
        <div className="p-0.5 items-center flex flex-row gap-2 bg-[var(--bg-main)] border-t border-[var(--border-color)] text-[var(--text-primary)] shadow-[0_-2px_10px_0_rgba(0,0,0,0.075)] h-[50px]">
          {items.map((item) => (
            item.label
          ))}
        </div>
      </div>
      
      <Resizable
className=""
        width={panelSize.width}
        height={panelSize.height}
        minConstraints={[0, 200]}
        maxConstraints={[0, 600]}
        onResize={onResizeBottom}
        resizeHandles={["n"]}
        handle={
          <div className="fixed z-1500 left-0 top-0 w-full h-[20px] cursor-row-resize">
            <div className="fixed left-0 top-0 cursor-pointer z-200"></div>
          </div>
        }
      >
      <div
        id="bottom-panel"
        className={`fixed bottom-0 rounded-t-2xl w-full ${
          !isMobile ? "hidden" : ""
        } transition-[bottom] duration-350 transform z-100 bg-[var(--bg-main)] shadow-[0_0_10px_0_rgba(0,0,0,0.225)]`}
        style={{
          bottom: isOpen ? 50 : `${(panelSize.height + 50) * -1}px`,
          height: `${panelSize.height}px`,
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
        <div className="h-full flex flex-col w-full">
          {items[activeTab - 1].children}
        </div>
      </div>
      </Resizable>
    </div>
  );
}
export default Panel;