import React, { useEffect } from "react";
import { useDevice } from "../contexts/DeviceContext";
import useWindowSize from "../hooks/useWindowSize";
import Panel from "../components/Panel/index";
import Canvas from "../components/Canvas/index.jsx";

const StudioPage = () => {
  const { isMobile, undo, redo, canUndo, canRedo } = useDevice();

  const wallpaperRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  const [isOpen, setIsOpen] = React.useState(true);
  const [breakpoint, setBreakpoint] = React.useState(null);
  const [panelSize, setPanelSize] = React.useState({
    width: isMobile ? 0 : 450,
    height: 275,
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
  
    const checkBreakpoint = () => {
      const currentBreakpoint = mediaQuery.matches ? "mobile" : "desktop";
  
      if (currentBreakpoint !== breakpoint) {
        if (currentBreakpoint === "mobile" && panelSize.width > 0) {
          setPanelSize((prev) => ({ ...prev, width: 0 }));
        } else if (currentBreakpoint === "desktop" && panelSize.width === 0) {
          setPanelSize((prev) => ({ ...prev, width: 350 }));
        }
  
        setBreakpoint(currentBreakpoint);
      }
    };
      checkBreakpoint();
      mediaQuery.addEventListener("change", checkBreakpoint);
  
    return () => {
      mediaQuery.removeEventListener("change", checkBreakpoint);
    };
  }, [breakpoint, panelSize.width]);
  

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
      if (!isMobile) return;
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      }
    };

    if (Math.min(screen.width, screen.height) <= 768) {
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
        canvasRef={canvasRef}
      />
      <Canvas
        ref={canvasRef}
        isOpen={isOpen}
        panelSize={panelSize}
        wallpaperRef={wallpaperRef}
      />
    </div>
  );
};

export default StudioPage;
