// App.jsx - Simplified and optimized
import "./App.css";
import "preline/preline";
import { useState, useRef, useEffect, useMemo } from "react";
import { ToastContainer } from "react-toastify";
import { ConfigProvider, theme } from "antd";
import { DeviceProvider } from "./contexts/DeviceContext";
import Header from "./components/Header/index";
import Panel from "./components/Panel/index";
import Canvas from "./components/Canvas/index";

function App() {
  // UI state - keep this local since it's UI-specific
  const [isOpen, setIsOpen] = useState(true);
  const [panelSize, setPanelSize] = useState({
    width: window.innerWidth / 3,
    height: window.innerHeight / 3,
  });
  const wallpaperRef = useRef(null);

  // Theme detection
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setIsDarkMode(e.matches);
    
    setIsDarkMode(mediaQuery.matches);
    mediaQuery.addEventListener("change", handler);
    
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const antdConfig = useMemo(() => ({
    components: {
      Tabs: {
        horizontalItemPadding: 0,
      },
    },
    token: {
      colorPrimary: "#FC6524",
      borderRadius: 4,
    },
    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
  }), [isDarkMode]);

  return (
    <ConfigProvider theme={antdConfig}>
      <DeviceProvider>
        <ToastContainer />
        <Header />
        <Panel
          setIsOpen={setIsOpen}
          isOpen={isOpen}
          panelSize={panelSize}
          setPanelSize={setPanelSize}
          wallpaperRef={wallpaperRef}
        />
        <Canvas
          isOpen={isOpen}
          panelSize={panelSize}
          wallpaperRef={wallpaperRef}
        />
      </DeviceProvider>
    </ConfigProvider>
  );
}

export default App;