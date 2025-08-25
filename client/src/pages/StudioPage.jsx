import React from 'react';
import Panel from "../components/Panel/index";
import Canvas from "../components/Canvas/index.jsx";

const StudioPage = () => {
  const [isOpen, setIsOpen] = React.useState(true);
  const [panelSize, setPanelSize] = React.useState({
    width: 450,
    height: window.innerHeight / 3,
  });
  const wallpaperRef = React.useRef(null);

  return (
    <>
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
    </>
  );
};

export default StudioPage;
