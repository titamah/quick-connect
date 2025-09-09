import React, { useEffect } from "react";
import { useDevice } from "../contexts/DeviceContext";
import useWindowSize from "../hooks/useWindowSize";
import Panel from "../components/Panel/index";
import Canvas from "../components/Canvas/index.jsx";

const StudioPage = () => {
  const { isMobile, undo, redo, canUndo, canRedo } = useDevice();

  const wallpaperRef = React.useRef(null);

  const [isOpen, setIsOpen] = React.useState(true);
  const windowSize = useWindowSize();
  const [breakpoint, setBreakpoint] = React.useState(null);
  const [panelSize, setPanelSize] = React.useState({
    width: isMobile ? 0 : 450,
    height: 450,
  });

  useEffect(() => {
    const currentBreakpoint = isMobile ? "mobile" : "desktop";

    if (currentBreakpoint !== breakpoint) {
      if (currentBreakpoint === "mobile" && panelSize.width > 0) {
        setPanelSize((prev) => ({ ...prev, width: 0 }));
      } else if (currentBreakpoint === "desktop" && panelSize.width === 0) {
        setPanelSize((prev) => ({ ...prev, width: 450 }));
      }

      setBreakpoint(currentBreakpoint);
    }
  }, [windowSize.width, breakpoint, panelSize.width]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const isInputField =
        event.target.tagName === "INPUT" ||
        event.target.tagName === "TEXTAREA" ||
        event.target.contentEditable === "true";

      if (isInputField) return;
      const isModifierPressed = event.ctrlKey || event.metaKey;
      if (isModifierPressed && event.key === "z" && !event.shiftKey) {
        event.preventDefault();
        if (canUndo) {
          undo();
        }
      }

      if (
        (isModifierPressed && event.key === "y") ||
        (isModifierPressed && event.shiftKey && event.key.toLowerCase() === "z")
      ) {
        event.preventDefault();
        if (canRedo) {
          redo();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [undo, redo, canUndo, canRedo]);

  useEffect(() => {
    const requestFullscreen = () => {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      }
    };

    if (window.innerWidth <= 768) {
      const timer = setTimeout(requestFullscreen, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="">
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
    </div>
  );
};

export default StudioPage;
