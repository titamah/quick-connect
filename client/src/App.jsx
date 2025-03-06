import "./App.css";
import "preline/preline";
import { useState, useEffect, use } from "react";
import Header from "./components/header";
import Panel from "./components/panel";
import Canvas from "./components/canvas";
import Wallpaper from "./components/wallpaper";

function App() {
  const [screenSize, setScreenSize] = useState({x: window.innerWidth, y: window.innerHeight});
  const [isOpen, setIsOpen] = useState(true);
  const [panelSize, setPanelSize] = useState({ width: screenSize.x/4, height: screenSize.y/4 });
  const [device, setDevice] = useState({
    name: "iPhone 12 Pro Max",
    size: { x: 1284, y: 2778 },
    // size: { y: 284, x: 778 },
    isUpload: true,
    color: "blue",
    bg: "https://wallpapers.com/images/featured/iphone-12-pro-max-hknmpjtf3rmp9egv.jpg",
        // bg: "https://images.unsplash.com/photo-1500964757637-c85e8a162699?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aXBob25lJTIwMTIlMjBwcm8lMjBtYXglMjB3YWxscGFwZXJ8ZW58MHx8MHx8fDA%3D",
    qr: "https://www.linkedin.com/in/titamah",
  });
  
  return (
    <>
    {/* <Wallpaper device={device} /> */}
      <Header />
      <Panel
        setIsOpen={setIsOpen}
        isOpen={isOpen}
        panelSize={panelSize}
        setPanelSize={setPanelSize}
        device={device}
        setDevice={setDevice}
      />
      <Canvas
        isOpen={isOpen}
        panelSize={panelSize}
        device={device}
      />
    </>
  );
}

export default App;
