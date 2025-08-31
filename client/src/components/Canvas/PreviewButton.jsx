import { forwardRef } from "react";
import { Eye, EyeClosed } from "lucide-react";
import { usePreview } from "../../contexts/PreviewContext";
import { useDevice } from "../../contexts/DeviceContext";

const PreviewButton = forwardRef(({}) => {
  const { isPreviewVisible, togglePreview, setHovered } = usePreview();
  const { isMobile } = useDevice();

  return (
    <div className={`w-fit place-items-end absolute right-5 ${isMobile ? "top-2.5" : "top-8.5"}  z-100`}>
      <button
        type="button"
        className={`h-fit inline-flex items-center text-sm py-1.75 px-2 gap-x-2 font-medium rounded-4xl text-white bg-[var(--accent)] hover:opacity-80 cursor-pointer transition-opacity duration-300 ease-in-out`}
        onClick={togglePreview}
        onTouch={togglePreview}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {isPreviewVisible ? "Preview" : "Preview"}
        {isPreviewVisible ? <Eye size={16} /> : <EyeClosed size={16} />}
      </button>
    </div>
  );
});

export default PreviewButton;
