import { forwardRef } from "react";
import { Undo2, Redo2 } from "lucide-react";

const UndoRedoButton = forwardRef(({}, ref) => {
  // TODO: Implement undo/redo functionality
  const canUndo = false; // Will be connected to undo state
  const canRedo = false; // Will be connected to redo state

  const handleUndo = () => {
    // TODO: Implement undo logic
    console.log("Undo clicked");
  };

  const handleRedo = () => {
    // TODO: Implement redo logic
    console.log("Redo clicked");
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
          disabled={!canUndo}
          title="Undo"
        >
          <Undo2 size={18} />
        </button>
        
        <button
          type="button"
          className={`py-2 px-2 h-fit inline-flex items-center gap-x-2 text-sm font-medium rounded-4xl text-white hover:opacity-75 ${
            canUndo 
              ? "bg-[var(--accent)] cursor-pointer" 
              : "bg-black/50 cursor-not-allowed"
          }`}
          onClick={handleRedo}
          disabled={!canRedo}
          title="Redo"
        >
          <Redo2 size={18} />
        </button>
      </div>
    </div>
  );
});

export default UndoRedoButton;
