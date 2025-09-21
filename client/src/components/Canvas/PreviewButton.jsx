import { forwardRef } from "react";
import { Eye, EyeClosed, Maximize2, Minimize2 } from "lucide-react";
import { usePreview } from "../../contexts/PreviewContext";
import { useDevice } from "../../contexts/DeviceContext";

const PreviewButton = forwardRef(({}) => {
  const { isPreviewVisible, togglePreview, setHovered } = usePreview();
  const { isMobile } = useDevice();

  const handleMouseEnter = () => {
    if (!isMobile) {
      setHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setHovered(false);
    }
  };

  const getButtonIcon = () => {
    return isPreviewVisible ? <Eye size={16} /> : <EyeClosed size={16} />;
  };

  return (
    <div className={`w-fit place-items-end absolute right-5 top-2.5 z-100`}>
      <button
        type="button"
        className={`h-fit inline-flex items-center text-sm py-1.75 px-2 gap-x-2 font-medium rounded-4xl text-white bg-[var(--accent)] hover:opacity-80 cursor-pointer transition-opacity duration-300 ease-in-out ${
          isPreviewVisible ? 'opacity-90' : ''
        }`}
        onClick={togglePreview}
        onTouchStart={togglePreview} // Better for mobile
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        Preview
        {getButtonIcon()}
      </button>
    </div>
  );
});

export default PreviewButton;