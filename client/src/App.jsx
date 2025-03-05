import "./App.css";
import "preline/preline";
import { useState, useEffect } from "react";
import Header from "./components/header";
import Panel from "./components/panel";
import Canvas from "./components/canvas";

function App() {
  const [isOpen, setIsOpen] = useState(true);
  const [panelSize, setPanelSize] = useState({ width: 200, height: 200 });
  const [device, setDevice] = useState({
    name: "iPhone 12 Pro Max",
    size: { x: 1284, y: 2778 },
    bg: "blue",
    qr: "https://www.linkedin.com/in/titamah",
  });

  return (
    <>
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
