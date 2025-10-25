import React from "react";
import { Upload } from "lucide-react";
import { useDevice } from "../../contexts/DeviceContext";

function ImageUploader({ handleChange, handleClick, fileTypes }) {
  const { isMobile } = useDevice();
  
  return (
    <>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
        className={`
          ${isMobile ? "h-[150px]" : "h-[200px]"}
          w-fill mb-[1.5px] rounded-sm border border-[5px] border-[var(--bg-main)] !shadow-[0_0_0_.95px_var(--border-color)]`}
      >
        <div
          onDrop={handleChange}
          onClick={handleClick}
          className={`h-full px-1 rounded-sm hover:bg-[var(--border-color)]/50 w-full flex flex-col justify-center items-center text-center text-md gap-1 relative cursor-pointer`}
        >
          <Upload size={48} />
          Drop here or browse to select a file
          <span className="text-xs italic text-black/65 dark:text-white/65">
            Supported formats: JPEG, PNG, 
            <br/>GIF, SVG, JPG, WEBP
          </span>
        </div>
      </div>
      <div className=" mt-4 space-y-2">
        <h4 className=""> File Name </h4>
        <div className="w-fill h-[24px] text-sm px-1.5 py-[2.5px] border border-[var(--border-color)]/50 rounded-sm bg-black/5 dark:bg-black/15 flex items-center justify-between">
          <span>
            No image selected
          </span>
        </div>
      </div>
    </>
  );
}

export default ImageUploader;