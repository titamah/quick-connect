import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDevice } from "../contexts/DeviceContext";
import useWindowSize from "../hooks/useWindowSize";
import Panel from "../components/Panel/index";
import Canvas from "../components/Canvas/index.jsx";

const StudioPage = () => {
  const navigate = useNavigate();

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
    const currentBreakpoint = isMobile ? 'mobile' : 'desktop';
    
    if (currentBreakpoint !== breakpoint) {
      console.log(`Breakpoint changed: ${breakpoint} → ${currentBreakpoint}`);
      
      if (currentBreakpoint === 'mobile' && panelSize.width > 0) {
        setPanelSize(prev => ({ ...prev, width: 0 }));
      } else if (currentBreakpoint === 'desktop' && panelSize.width === 0) {
        setPanelSize(prev => ({ ...prev, width: 450 }));
      }
      
      setBreakpoint(currentBreakpoint);
    }
  }, [windowSize.width, breakpoint, panelSize.width]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check if we're in an input field or textarea
      const isInputField = event.target.tagName === 'INPUT' || 
                          event.target.tagName === 'TEXTAREA' || 
                          event.target.contentEditable === 'true';
      
      // Don't trigger shortcuts when typing in input fields
      if (isInputField) return;

      // Handle Mac Cmd key as well as Ctrl
      const isModifierPressed = event.ctrlKey || event.metaKey;

      // Ctrl/Cmd+Z for undo
      if (isModifierPressed && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        if (canUndo) {
          undo();
        }
      }
      
      // Ctrl/Cmd+Y or Ctrl/Cmd+Shift+Z for redo
      if ((isModifierPressed && event.key === 'y') || 
          (isModifierPressed && event.shiftKey && event.key.toLowerCase() === 'z')) {
        event.preventDefault();
        if (canRedo) {
          redo();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo, canUndo, canRedo]);

  // Request fullscreen when Studio page loads on mobile
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

    // Auto-request fullscreen on mobile
    if (window.innerWidth <= 768) {
      // Small delay to let page load
      const timer = setTimeout(requestFullscreen, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="">
      {/* Debug panel - remove this in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-20 left-4 z-50 bg-black/80 text-white p-3 rounded-lg text-xs">
          <div>Breakpoint: {breakpoint || 'Initializing...'}</div>
          <div>Window: {windowSize.width}px</div>
          <div>Panel: {panelSize.width}px</div>
        </div>
      )}

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
