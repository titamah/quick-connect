import "./App.css";
import "preline/preline";
import { useState, useRef, createContext, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { ConfigProvider, theme } from "antd";
import Header from "./components/Header/index"
import Panel from './components/Panel/index'
import Canvas from "./components/Canvas/index"

export const DeviceContext = createContext();

function App() {
  const [isOpen, setIsOpen] = useState(true);
  const [panelSize, setPanelSize] = useState({ width: window.innerWidth / 3, height: window.innerHeight / 3 });
  const wallpaperRef = useRef(null);
  const [device, setDevice] = useState({
    name: "Sample iPhone Wallpaper",
    type: "iPhone 12 Pro Max",
    size: { x: 1284, y: 2778 },
    style: "radial",
    color: "#ffffff",
    bg: "https://wallpapers.com/images/featured/iphone-12-pro-max-hknmpjtf3rmp9egv.jpg",
    gradient:[],
    qr: {url:"https://www.linkedin.com/in/titamah", custom: {borderSize:0, borderColor:"#000000", cornerRadius:0}},
  });

    const [isDarkMode, setIsDarkMode] = useState(false);
    useEffect(() => {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e) => setIsDarkMode(e.matches);
      setIsDarkMode(mediaQuery.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }, []);
  

    return (
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#00b96b',
            borderRadius: 4,
          },
          algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm
        }}
      >
    <DeviceContext.Provider value={{ device, setDevice }}>
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
    </DeviceContext.Provider>
    </ConfigProvider>
  );
}

export default App;
