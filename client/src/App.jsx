import "./App.css";
import "preline/preline";
import { useState, useEffect, createContext } from "react";
import Header from "./components/header";
import Panel from "./components/panel/";
import Canvas from "./components/canvas";

export const DeviceContext = createContext();

function App() {
  const [screenSize, setScreenSize] = useState({ x: window.innerWidth, y: window.innerHeight });
  const [isOpen, setIsOpen] = useState(true);
  // const [panelSize, setPanelSize] = useState({ width: screenSize.x / 2, height: screenSize.y / 2 });
  const [panelSize, setPanelSize] = useState({ width:100, height:100 });
  const [device, setDevice] = useState({
    name: "Sample iPhone Wallpaper",
    type: "iPhone 12 Pro Max",
    size: { x: 1284, y: 2778 },
    isUpload: true,
    color: "blue",
    bg: "file:///Users/titamah/repos/quick-connect/client/src/assets/example.jpg",
    qr: "https://www.linkedin.com/in/titamah",
  });

  return (
    <DeviceContext.Provider value={{ device, setDevice }}>
      <Header />
      <Panel
        setIsOpen={setIsOpen}
        isOpen={isOpen}
        panelSize={panelSize}
        setPanelSize={setPanelSize}
      />
      <Canvas
        isOpen={isOpen}
        panelSize={panelSize}
      />
    </DeviceContext.Provider>
  );
}

export default App;
