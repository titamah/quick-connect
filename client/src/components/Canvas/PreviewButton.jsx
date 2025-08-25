import { forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { usePreview } from "../../contexts/PreviewContext";

const PreviewButton = forwardRef(({}, ref) => {
  const { isPreviewVisible, isHovered, togglePreview, setHovered } = usePreview();

  return (
    <div
      className="w-fit flex-col place-items-end right-5 absolute top-2 z-100"
    >
      <button
        type="button"
        className="py-2 px-2 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-gray-600 text-white hover:bg-gray-700 focus:outline-hidden focus:bg-gray-700 disabled:opacity-50 disabled:pointer-events-none"
        onClick={togglePreview}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {isPreviewVisible ? "Hide Preview" : "Preview"}
        {isPreviewVisible ? (
          <EyeOff size={16} />
        ) : (
          <Eye size={16} />
        )}
      </button>
      

    </div>
  );
});

export default PreviewButton;
