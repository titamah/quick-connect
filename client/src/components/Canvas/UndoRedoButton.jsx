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
      <div className={`place-items-end absolute ${isMobile ? "top-3" : "top-8.5"} left-5 z-100`}>
      <div className="flex gap-2">
        <button
          type="button"
          className={` h-fit inline-flex items-center text-sm py-1.75 px-2 gap-x-2 font-medium rounded-4xl text-white hover:opacity-75 ${
            canUndo
              ? "bg-[var(--accent)] cursor-pointer"
              : "bg-black/50 cursor-not-allowed"
          }`}
          onClick={handleUndo}
          title="Undo"
        >
          <Undo2 size={16} />
        </button>

        <button
          type="button"
          className={`h-fit inline-flex items-center text-sm py-1.75 px-2 gap-x-2  font-medium rounded-4xl text-white hover:opacity-75 ${
            canRedo
              ? "bg-[var(--accent)] cursor-pointer"
              : "bg-black/50 cursor-not-allowed"
          }`}
          onClick={handleRedo}
          title="Redo"
        >
          <Redo2 size={16} />
        </button>
      </div>
    </div>
  );
});

export default UndoRedoButton;
