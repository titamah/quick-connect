import { forwardRef } from "react";
import { Undo2, Redo2 } from "lucide-react";
import { useDevice } from "../../contexts/DeviceContext";

const UndoRedoButton = forwardRef(({}, ref) => {
  const { canUndo, canRedo, undo, redo, device } = useDevice();

  const handleUndo = () => {
    if (canUndo) {
    undo();
    console.log("TEST: ", device);
  }
  };

  const handleRedo = () => {
    if (canRedo) {
    redo();
  }
  console.log("TEST: ", device);
  };

  return (
    <div className="w-fit place-items-end left-5 absolute top-5 z-100">
      <div className="flex gap-2">
        <button
          type="button"
          className={`py-2 px-2 h-fit inline-flex items-center gap-x-2 text-sm font-medium rounded-4xl text-white hover:opacity-75 ${
            canUndo 
              ? "bg-[var(--accent)] cursor-pointer" 
              : "bg-black/50 cursor-not-allowed"
          }`}
          onClick={handleUndo}
          title="Undo"
        >
          <Undo2 size={18} />
        </button>
        
        <button
          type="button"
          className={`py-2 px-2 h-fit inline-flex items-center gap-x-2 text-sm font-medium rounded-4xl text-white hover:opacity-75 ${
            canRedo 
              ? "bg-[var(--accent)] cursor-pointer" 
              : "bg-black/50 cursor-not-allowed"
          }`}
          onClick={handleRedo}
          title="Redo"
        >
          <Redo2 size={18} />
        </button>
      </div>
    </div>
  );

});

export default UndoRedoButton;
