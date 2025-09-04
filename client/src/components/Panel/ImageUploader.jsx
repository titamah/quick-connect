import React from "react";
import { Upload } from "lucide-react";
import { useDevice } from "../../contexts/DeviceContext";

function ImageUploader({ handleChange, fileTypes, updateUploadInfo, openModal }) {
  const { isMobile } = useDevice();

  return (

    <div
    onDragOver={(e) => e.preventDefault()}
    onDrop={(e) => e.preventDefault()}
    className={`${
      isMobile ? "h-[200px]" : "h-[200px]"
    } w-fill mb-[1.5px] rounded-sm border border-[5px] border-[var(--bg-main)] !shadow-[0_0_0_.95px_var(--border-color)]`}
  >
    <div
      onDrop={handleChange}
      onClick={() => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = fileTypes
          .map((type) => `.${type.toLowerCase()}`)
          .join(",");
        input.onchange = (event) => {
          const selectedFile = event.target.files[0];
          if (selectedFile) {
            const reader = new FileReader();
            reader.onload = () => {
              updateUploadInfo({
                originalImageData: reader.result,
                filename: selectedFile.name,
              });
            };
            reader.readAsDataURL(selectedFile);
            openModal();
          }
        };
        input.click();
      }}
      className={`h-full px-1 rounded-sm hover:bg-[var(--border-color)]/50 w-full flex flex-col justify-center items-center text-center text-md gap-1 relative cursor-pointer`}
    >
      <Upload size={48} />
      Drop image here or browse to select a file
      <span className="text-xs italic text-black/65 dark:text-white/65">
        Supported formats: JPEG, PNG, GIF, SVG, JPG, WEBP
      </span>
    </div>
    </div>
  );
}

export default ImageUploader;