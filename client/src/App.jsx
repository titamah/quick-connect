import "./App.css";
import "preline/preline";
import { useState, useRef, createContext, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { ConfigProvider, theme } from "antd";
import Header from "./components/Header/index";
import Panel from "./components/Panel/index";
import Canvas from "./components/Canvas/index";
import { Palette } from "lucide-react";

export const DeviceContext = createContext();

function App() {
  const [isOpen, setIsOpen] = useState(true);
  const [panelSize, setPanelSize] = useState({
    width: window.innerWidth / 3,
    height: window.innerHeight / 3,
  });
  const wallpaperRef = useRef(null);

  const rgbToHex = (rgb) => {
    const result = rgb.match(/\d+/g).map((num) => parseInt(num, 10).toString(16).padStart(2, '0'));
    return `#${result.join('')}`;
  };

  const [device, setDevice] = useState({
    name: "Sample iPhone Wallpaper",
    type: "iPhone 12 Pro Max",
    size: { x: 1284, y: 2778 },
    style: "solid",
    color: "#ffad6c",
    bg: "https://wallpapers.com/images/featured/iphone-12-pro-max-hknmpjtf3rmp9egv.jpg",
    gradient: {
      type: "linear",
      stops: [
        0,
        "rgb(255, 170, 0)",
        0.5,
        "rgb(228,88,191)",
        1,
        "rgb(177,99,232)",
      ],
      angle: { x: 0, y: 0 },
      pos: { x: 0, y: 0 },
    },
    qr: {
      url: "https://www.linkedin.com/in/titamah",
      custom: { borderSize: 0, borderColor: "#000000", cornerRadius: 0 },
    },
    grain: false,
    palette: {
      qr: "#000000",
      bg: "#FFFFFF",
      border: "#000000",
      solid: "#ffad6c",
      gradient: ["#ffaa00", "#e458bf", "#b163e8"],
      image: ["red", "orange", "yellow", "green", "blue"]
    },
  });

  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setIsDarkMode(e.matches);
    setIsDarkMode(mediaQuery.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return (
    // <ConfigProvider
    //   theme={{
    //     token: {
    //       colorPrimary: "#00b96b",
    //       borderRadius: 4,
    //     },
    //     algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    //   }}
    // >
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
