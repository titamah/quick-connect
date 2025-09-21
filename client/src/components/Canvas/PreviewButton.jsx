import { forwardRef, useRef } from "react";
import { Eye, EyeClosed, Maximize2, Minimize2 } from "lucide-react";
import { usePreview } from "../../contexts/PreviewContext";
import { useDevice } from "../../contexts/DeviceContext";

const PreviewButton = forwardRef(({}) => {
  const { isPreviewVisible, togglePreview, setHovered } = usePreview();
  const { isMobile } = useDevice();

  // Detect if device has touch capability (not screen size)
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Prevent double-firing on touch devices
  const touchHandledRef = useRef(false);

  // Mouse handlers - always work regardless of device
  const handleMouseEnter = () => {
    setHovered(true); // Show 50% preview on hover
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  // Touch handlers - only add behavior if device supports touch
  const handleTouchStart = (e) => {
    if (hasTouch) {
      touchHandledRef.current = true; // Mark that touch is being handled
      setHovered(true); // Show preview at 50% opacity
    }
  };

  const handleTouchEnd = (e) => {
    if (hasTouch) {
      setHovered(false); // Hide preview
      // Small delay to ensure user sees the preview before toggling
      setTimeout(() => {
        togglePreview(); // Toggle full preview on release
        // Reset touch flag after a short delay to allow click event to be blocked
        setTimeout(() => {
          touchHandledRef.current = false;
        }, 300);
      }, 100);
    }
  };

  const handleTouchCancel = () => {
    if (hasTouch) {
      setHovered(false); // Hide preview if touch is cancelled
      touchHandledRef.current = false; // Reset touch flag
    }
  };

  // Click handler - always work, but prevent double-firing after touch
  const handleClick = () => {
    // If touch was just handled, ignore the click event
    if (touchHandledRef.current) {
      return;
    }
    togglePreview();
  };

  // Prevent context menu on long press for touch devices
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
        onClick={handleClick} // Always allow click
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
});

export default PreviewButton;