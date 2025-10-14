import { useState, useEffect, useRef, Suspense, lazy } from "react";
import { QrCode, Proportions, Image, Download, Loader } from "lucide-react";
import CustomResizable from "./CustomResizable";
import QRGenerator from "./QRGenerator";
import DeviceTypeSelector from "./DeviceTypeSelector";
import CustomBackgroundSelector from "./CustomBackgroudSelector";
import Exporter from "./Exporter";
import { useDevice } from "../../contexts/DeviceContext";
import "./styles.css";

function Panel({
  isOpen,
  setIsOpen,
  panelSize,
  setPanelSize,
  wallpaperRef,
  canvasRef,
}) {
  const { isMobile, deviceInfo, qrConfig } = useDevice();
  const panelRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState(0);
  const resizableRef = useRef(null);

  const onResizeSide = (newWidth) => {
    setPanelSize({ width: newWidth, height: panelSize.height });
  };

  const onResizeBottom = (newHeight) => {
    setPanelSize({ width: panelSize.width, height: newHeight });
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
    setActiveTab(key);
    !isOpen && togglePanel();

    let panelHeight = panelSize.height;
    
    if (key === "1" ) {
      panelHeight = 275;
    }
      else if ( key === "2") {
        panelHeight = 275;
    } else if (key === "3") {
      panelHeight = 345;
    } else if (key === "4") {
      panelHeight = 300;
    }

    setPanelSize(prev => ({ ...prev, height: panelHeight }));

    if (isMobile && canvasRef?.current) {
      if (key === "1") {
        setTimeout(() => {
          canvasRef.current.centerTopInCanvas(0.55, panelHeight);
        }, 50);

    } else if (key === "2") {
        let deviceScale = 1.0;
        if (qrConfig.scale < 0.3) {
          deviceScale = 1.3;
        } else if (qrConfig.scale > 0.7) {
          deviceScale = 0.9;
        }
        setTimeout(() => {
          canvasRef.current.centerInVisibleArea(deviceScale, panelHeight);
        }, 50);
      } else if (key === "3") {
        setTimeout(() => {
          canvasRef.current.centerTopInCanvas(0.5, panelHeight);
        }, 50);
      } else if (key === "4") {
        setTimeout(() => {
          canvasRef.current.centerTopInCanvas(0.66, panelHeight);
        }, 50);
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isMobile && canvasRef?.current && !isOpen) {
        canvasRef.current.resetView();
        setActiveTab(null);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [isMobile, isOpen]);

  const items = [
    {
      key: "1",
      label: (
        <Proportions
          className={`size-7.5 m-2 w-full cursor-pointer hover:opacity-80 ${
            activeTab === "1" ? "text-[var(--accent)]" : ""
          }`}
          onClick={() => {
            handleTabClick("1");
          }}
        />
      ),
      children: <DeviceTypeSelector />,
    },
    {
      key: "2",
      label: (
        <QrCode
          className={`size-7.5 m-2 w-full cursor-pointer hover:opacity-80 ${
            activeTab === "2" ? "text-[var(--accent)]" : ""
          }`}
          onClick={() => {
            handleTabClick("2");
          }}
        />
      ),
      children: <QRGenerator panelSize={panelSize} />,
    },
    {
      key: "3",
      label: (
        <Image
          className={`size-7.5 m-2 w-full cursor-pointer hover:opacity-80 ${
            activeTab === "3" ? "text-[var(--accent)]" : ""
          }`}
          onClick={() => {
            handleTabClick("3");
          }}
        />
      ),
      children: <CustomBackgroundSelector panelSize={panelSize} />,
    },
    {
      key: "4",
      label: (
        <Download
          className={`size-7.5 m-2 w-full cursor-pointer hover:opacity-80 ${
            activeTab === "4" ? "text-[var(--accent)]" : ""
          }`}
          onClick={() => {
            handleTabClick("4");
          }}
        />
      ),
      children: <Exporter wallpaperRef={wallpaperRef} />,
    },
  ];

  return (
    <div className="relative w-[100vw] h-full">
      <div
        className={`fixed left-0 top-[52px] z-110 ${isMobile ? "hidden" : ""}`}
      >
        <div className="mt-1.5 p-1.5 w-[64px] items-center flex flex-col gap-2 border-r border-[var(--border-color)] text-[var(--text-primary)] bg-[var(--bg-main)] h-[calc(100vh-52px)] shadow-[2px_0_10px_0_rgba(0,0,0,0.075)]">
          {items.map((item) => item.label)}
        </div>
      </div>

      <CustomResizable
        direction="side"
        panelSize={panelSize}
        setPanelSize={setPanelSize}
        minSize={350}
        maxSize={600}
        toggleButton={togglePanel}
        className={`fixed ${
          isMobile ? "hidden" : ""
        } !h-[calc(100vh-52px)] z-100`}
        style={{
          left: isOpen ? 64 : `${(panelSize.width + 64) * -1}px`,
        }}
      >
        <div
          id="side-panel"
          ref={panelRef}
          className="[--body-scroll:true] transition-[left] duration-350 transform bg-[var(--bg-main)] shadow-[0_0_10px_0_rgba(0,0,0,0.075)] h-full w-full"
          role="dialog"
          aria-labelledby="hs-offcanvas-example-label"
        >
          <div className="h-full flex flex-row w-full">
            <div className="flex-1">
              {items[activeTab ? activeTab - 1 : 0].children}
            </div>
          </div>
        </div>
      </CustomResizable>

      <div
        className={`fixed bottom-0 left-0 right-0 z-110 ${
          isMobile ? "" : "hidden"
        }`}
      >
        <div className="p-0.5 items-center flex flex-row gap-2 bg-[var(--bg-main)] border-t border-[var(--border-color)] text-[var(--text-primary)] shadow-[0_-2px_10px_0_rgba(0,0,0,0.075)] h-[50px]">
          {items.map((item) => item.label)}
        </div>
      </div>

      <div
        className={`fixed bottom-0 w-full ${!isMobile ? "hidden" : ""} z-100`}
        style={{
          bottom: isOpen ? 50 : `${(panelSize.height + 50) * -1}px`,
        }}
      >
        <CustomResizable
          ref={resizableRef}
          direction="bottom"
          panelSize={panelSize}
          setPanelSize={setPanelSize}
          minSize={200}
          maxSize={600}
          className="w-full"
          toggleButton={togglePanel}
        >
          <div
            id="bottom-panel"
            className="transition-[bottom] duration-350 transform bg-[var(--bg-main)] shadow-[0_0_10px_0_rgba(0,0,0,0.225)] h-full w-full rounded-t-2xl"
            role="dialog"
            aria-labelledby="hs-offcanvas-example-label"
          >
            <div className="h-full flex flex-col w-full">
              {items[activeTab ? activeTab - 1 : 0].children}
            </div>
          </div>
        </CustomResizable>
      </div>
    </div>
  );
}
export default Panel;
