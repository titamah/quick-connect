import { forwardRef } from "react";
import { Undo2, Redo2 } from "lucide-react";
import { useDevice } from "../../contexts/DeviceContext";

const UndoRedoButton = forwardRef(({}) => {
  const { canUndo, canRedo, undo, redo, isMobile } = useDevice();

  const handleUndo = () => {
    if (canUndo) {
      undo();
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      redo();
    }
  };

  return (
      <div className={`w-fit place-items-end absolute ${isMobile ? "top-2.5 left-3.5" : "top-5 left-5"}  z-100`}>
      <div className="flex gap-2">
        <button
          type="button"
          className={` h-fit inline-flex items-center ${isMobile ? "text-xs py-1.5 px-1.5 gap-x-1.5 " : "text-sm py-1.75 px-2 gap-x-2 "} font-medium rounded-4xl text-white hover:opacity-75 ${
            canUndo
              ? "bg-[var(--accent)] cursor-pointer"
              : "bg-black/50 cursor-not-allowed"
          }`}
          onClick={handleUndo}
          title="Undo"
        >
          <Undo2 size={isMobile ? 14 : 18} />
        </button>

        <button
          type="button"
          className={`h-fit inline-flex items-center ${isMobile ? "text-xs py-1.5 px-1.5 gap-x-1.5 " : "text-sm py-1.75 px-2 gap-x-2 "}  font-medium rounded-4xl text-white hover:opacity-75 ${
            canRedo
              ? "bg-[var(--accent)] cursor-pointer"
              : "bg-black/50 cursor-not-allowed"
          }`}
          onClick={handleRedo}
          title="Redo"
        >
          <Redo2 size={isMobile ? 14 : 18} />
        </button>
      </div>
    </div>
  );
});

export default UndoRedoButton;
