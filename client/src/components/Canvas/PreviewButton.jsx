import { forwardRef } from "react";
import { Eye, EyeClosed } from "lucide-react";
import { usePreview } from "../../contexts/PreviewContext";
import { useDevice } from "../../contexts/DeviceContext";

const PreviewButton = forwardRef(({}) => {
  const { isPreviewVisible, togglePreview, setHovered } = usePreview();
  const { isMobile } = useDevice();

  return (
    <div className={`w-fit place-items-end absolute ${isMobile ? "top-2.5 right-3.5" : "top-5 right-5"}  z-100`}>
      <button
        type="button"
        className={`h-fit inline-flex items-center ${isMobile ? "text-xs py-1.5 px-1.5 gap-x-1.5 " : "text-sm py-1.75 px-2 gap-x-2 "}  font-medium rounded-4xl text-white bg-[var(--accent)] hover:opacity-80 cursor-pointer transition-opacity duration-300 ease-in-out`}
        onClick={togglePreview}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {isPreviewVisible ? "Preview" : "Preview"}
        {isPreviewVisible ? <Eye size={isMobile ? 12 : 16} /> : <EyeClosed size={isMobile ? 12 : 16} />}
      </button>
    </div>
  );
});

export default PreviewButton;
