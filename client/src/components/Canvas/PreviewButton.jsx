import { useRef } from "react";
import { Eye, EyeClosed } from "lucide-react";
import { usePreview } from "../../contexts/PreviewContext";

const PreviewButton = () => {
  const { isPreviewVisible, togglePreview, setHovered } = usePreview();

  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  const touchHandledRef = useRef(false);

  const handleMouseEnter = () => {
    setHovered(true); 
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  const handleTouchStart = (e) => {
    if (hasTouch) {
      touchHandledRef.current = true;
      setHovered(true); 
    }
  };

  const handleTouchEnd = (e) => {
    if (hasTouch) {
      setHovered(false); 
      setTimeout(() => {
        togglePreview(); 
        setTimeout(() => {
          touchHandledRef.current = false;
        }, 300);
      }, 100);
    }
  };

  const handleTouchCancel = () => {
    if (hasTouch) {
      setHovered(false); 
      touchHandledRef.current = false;
    }
  };

  const handleClick = () => {
    if (touchHandledRef.current) {
      return;
    }
    togglePreview();
  };

  const handleContextMenu = (e) => {
    if (hasTouch) {
      e.preventDefault();
    }
  };

  const getButtonIcon = () => {
    return isPreviewVisible ? <Eye size={16} /> : <EyeClosed size={16} />;
  };

  return (
    <div className={`w-fit place-items-end absolute right-5 top-2.5 z-100`}>
      <button
        type="button"
        className={`h-fit inline-flex items-center text-sm py-1.75 px-2 gap-x-2 font-medium rounded-4xl text-white bg-[var(--accent)] hover:opacity-80 cursor-pointer transition-opacity duration-300 ease-in-out select-none ${
          isPreviewVisible ? 'opacity-90' : ''
        }`}
        style={{
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          WebkitTapHighlightColor: 'transparent',
          userSelect: 'none'
        }}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onContextMenu={handleContextMenu}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        Preview
        {getButtonIcon()}
      </button>
    </div>
  );
};

export default PreviewButton;