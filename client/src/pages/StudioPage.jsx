import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDevice } from "../contexts/DeviceContext";
import Panel from "../components/Panel/index";
import Canvas from "../components/Canvas/index.jsx";

const StudioPage = () => {
  const navigate = useNavigate();
  const { assignSlot, currentSlotId } = useDevice();
  const [isOpen, setIsOpen] = React.useState(true);
  const [panelSize, setPanelSize] = React.useState({
    width: 450,
    height: window.innerHeight / 3,
  });
  const wallpaperRef = React.useRef(null);

  // Assign a slot when the studio loads (if not already assigned)
  useEffect(() => {
    if (!currentSlotId) {
      assignSlot().catch(error => {
        console.error("Failed to assign slot:", error);
        // If we can't assign a slot (storage full), redirect back to start page
        if (error.message.includes("Maximum designs reached")) {
          alert("Storage is full. Please delete a design to continue.");
          navigate("/start-design");
        }
      });
    }
  }, [currentSlotId, assignSlot]);

  return (
    <>
      {/* Debug panel - remove this in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-20 left-4 z-50 bg-black/80 text-white p-3 rounded-lg text-xs">
          <div>Slot: {currentSlotId || 'None'}</div>
          <div>Auto-save: {currentSlotId ? 'Active' : 'Inactive'}</div>
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
    </>
  );
};

export default StudioPage;
