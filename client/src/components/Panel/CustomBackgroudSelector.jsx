import { useMemo, Suspense, lazy } from "react";
import { useDevice } from "../../contexts/DeviceContext";
import LoadingSpinner from "../LoadingSpinner";
import ColorSelector from "./ColorSelector";

const ImageInput = lazy(() => import("./ImageInput"));
const GradientSelector = lazy(() => import("./GradientSelector"));
const BACKGROUND_TYPES = [
  { id: 1, label: "Solid", style: "solid", component: ColorSelector },
  { id: 2, label: "Gradient", style: "gradient", component: GradientSelector },
  { id: 3, label: "Image", style: "image", component: ImageInput },
];
function CustomBackgroundSelector({ panelSize }) {
  const { background, updateBackground, takeSnapshot, isMobile } = useDevice();
  const activeTab = useMemo(() => {
    return (
      BACKGROUND_TYPES.find((type) => type.style === background.style)?.id || 1
    );
  }, [background.style]);
  const handleTabChange = (tabId, style) => {
    takeSnapshot(
      `Switch to ${
        BACKGROUND_TYPES.find((t) => t.id === tabId)?.label
      } background`
    );
    updateBackground({ style });
  };
  const renderTabButton = ({ id, label, style }) => (
    <button
      key={id}
      type="button"
      onClick={() => handleTabChange(id, style)}
      className={`
        inline-flex justify-center items-center rounded-xl 
        w-full max-w-[150px] px-3 py-1.5 h-[26px]
        transition-colors duration-200
        ${
          activeTab === id
            ? "bg-[var(--border-color)]/75"
            : "hover:bg-[var(--border-color)]/50"
        }
      `}
      aria-selected={activeTab === id}
      role="tab"
    >
      <h5
        className={`!font-normal
        ${activeTab === id ? "text-[var(--accent)]" : ""}`}
      >
        {label}
      </h5>
    </button>
  );
  return (
    <div
      role="tabpanel"
      aria-labelledby="background-selector-panel"
      className={` w-full${
        isMobile ? "rounded-t-2xl h-full" : ""
      } flex-1 overflow-y-scroll min-h-0`}
    >
      <div
        className={`flex-shrink-0 bg-[#f2f2f2] dark:bg-[#1a1818] ${
          isMobile
            ? "pb-2 pt-5 px-2 mb-3 rounded-t-2xl sticky top-0 z-100"
            : "px-2.5 pt-3.5 pb-2"
        }`}
      >
        <h3 className={`${isMobile ? "mb-1.5 px-1" : "px-1 mb-2"}`}>Background Style</h3>
        <nav
          className="flex gap-2 bg-[var(--border-color)]/50 rounded-xl justify-center "
          aria-label="Background type tabs"
          role="tablist"
        >
          {BACKGROUND_TYPES.map(renderTabButton)}
        </nav>
      </div>

      <h2 className={`${isMobile ? "hidden" : "p-3.5"}`}>Set Background</h2>
      
      <div className="px-3.5 pb-2.5">
        {/* Solid Color Tab */}
        <div style={{ display: activeTab === 1 ? 'block' : 'none' }}>
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-32">
                <LoadingSpinner size="medium" variant="logo" />
              </div>
            }
          >
            <ColorSelector panelSize={panelSize} />
          </Suspense>
        </div>

        {/* Gradient Tab */}
        <div style={{ display: activeTab === 2 ? 'block' : 'none' }}>
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-32">
                <LoadingSpinner size="medium" variant="logo" />
              </div>
            }
          >
            <GradientSelector panelSize={panelSize} />
          </Suspense>
        </div>

        {/* Image Tab */}
        <div style={{ display: activeTab === 3 ? 'block' : 'none' }}>
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-32">
                <LoadingSpinner size="medium" variant="logo" />
              </div>
            }
          >
            <ImageInput panelSize={panelSize} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
export default CustomBackgroundSelector;
