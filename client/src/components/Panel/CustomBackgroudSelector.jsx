import { useMemo } from "react";
import { useDevice } from "../../contexts/DeviceContext";
import ImageInput from "./ImageInput";
import ColorSelector from "./ColorSelector";
import GradientSelector from "./GradientSelector";
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
        w-full max-w-[150px] px-3 py-1.5 
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
  const ActiveComponent = BACKGROUND_TYPES.find(
    (type) => type.id === activeTab
  )?.component;
  return (
    <div
      role="tabpanel"
      aria-labelledby="background-selector-panel"
      className={` w-full${isMobile ? "rounded-t-2xl h-full" : ""} flex-1 overflow-y-scroll min-h-0`}
    >
      <div className={`border-b border-[var(--border-color)]/25 p-3.5 ${isMobile ? "mt-1" : ""}`}>
        <h2 className={`${isMobile ? "hidden" : "mb-5"}`}>Set Background</h2>
        <nav
          className="flex gap-2 bg-[var(--border-color)]/50 rounded-xl justify-center "
          aria-label="Background type tabs"
          role="tablist"
        >
          {BACKGROUND_TYPES.map(renderTabButton)}
        </nav>
      </div>
      <div className="px-3.5 py-2.5">
        {ActiveComponent && <ActiveComponent panelSize={panelSize} />}
      </div>
    </div>
  );
}
export default CustomBackgroundSelector;
