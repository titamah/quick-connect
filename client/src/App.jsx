import "./App.css";
import "preline/preline";
import { useState, useRef, createContext } from "react";
import { ToastContainer } from "react-toastify";
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
    isUpload: true,
    color: "blue",
    bg: "https://wallpapers.com/images/featured/iphone-12-pro-max-hknmpjtf3rmp9egv.jpg",
    qr: {url:"https://www.linkedin.com/in/titamah", custom: false},
  });

  return (
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
  );
}

export default App;
