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
    <div className="w-fit flex-col place-items-start left-5 absolute top-2 z-100">
      <div className="flex gap-2">
        <button
          type="button"
          className={`py-2 px-2 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent text-white focus:outline-hidden disabled:opacity-50 disabled:pointer-events-none ${
            canUndo 
              ? "bg-gray-600 hover:bg-gray-700 focus:bg-gray-700" 
              : "bg-gray-400 cursor-not-allowed"
          }`}
          onClick={handleUndo}
          disabled={!canUndo}
          title="Undo"
        >
          <Undo2 size={16} />
          Undo
        </button>
        
        <button
          type="button"
          className={`py-2 px-2 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent text-white focus:outline-hidden disabled:opacity-50 disabled:pointer-events-none ${
            canRedo 
              ? "bg-gray-600 hover:bg-gray-700 focus:bg-gray-700" 
              : "bg-gray-400 cursor-not-allowed"
          }`}
          onClick={handleRedo}
          disabled={!canRedo}
          title="Redo"
        >
          <Redo2 size={16} />
          Redo
        </button>
      </div>
    </div>
  );
});

export default UndoRedoButton;
