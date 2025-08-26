import { forwardRef } from "react";
import { Eye, EyeClosed } from "lucide-react";
import { usePreview } from "../../contexts/PreviewContext";

const PreviewButton = forwardRef(({}, ref) => {
  const { isPreviewVisible, isHovered, togglePreview, setHovered } = usePreview();

  return (
    <div
      className="w-fit place-items-end right-5 absolute top-5 z-100"
    >
      <button
        type="button"
        className="py-1.75 px-2 h-fit inline-flex items-center gap-x-2 text-sm font-medium rounded-4xl text-white bg-[var(--accent)] hover:opacity-75 cursor-pointer"
        onClick={togglePreview}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {isPreviewVisible ? "Preview" : "Preview"}
        {isPreviewVisible ? (
          <Eye size={16} />
        ) : (
          <EyeClosed size={16} />
        )}
      </button>
      

    </div>
  );
});

export default PreviewButton;
