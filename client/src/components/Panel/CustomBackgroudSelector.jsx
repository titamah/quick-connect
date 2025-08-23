import { useState } from "react";
import { useDevice } from "../../contexts/DeviceContext";
import ImageUploader from "./ImageUploader";
import OptimizedColorSelector from "./OptimizedColorSelector";
import GradientSelector from "./GradientSelector";

const BACKGROUND_TYPES = [
  { id: 1, label: "Solid", style: "solid", component: OptimizedColorSelector },
  { id: 2, label: "Gradient", style: "gradient", component: GradientSelector },
  { id: 3, label: "Image", style: "image", component: ImageUploader }
];

function CustomBackgroundSelector({ panelSize }) {
  const [activeTab, setActiveTab] = useState(1);
  const { updateBackground } = useDevice();

  const handleTabChange = (tabId, style) => {
    setActiveTab(tabId);
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
        ${activeTab === id 
          ? "bg-[var(--border-color)]/75" 
          : "hover:bg-[var(--border-color)]/50"
        }
      `}
      aria-selected={activeTab === id}
      role="tab"
    >
      <h5 className={`!font-normal
        ${activeTab === id 
          ? "text-[var(--accent)]" 
          : ""
        }`}>{label}</h5>
    </button>
  );

  const ActiveComponent = BACKGROUND_TYPES.find(type => type.id === activeTab)?.component;

  return (
    <div
      role="tabpanel"
      aria-labelledby="background-selector-panel"
      className="w-full"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-color)]/25 p-3.5">
        <h2 className="mb-5">
          Background
        </h2>
        
        {/* Tab Navigation */}
        <nav
          className="flex gap-2 bg-[var(--border-color)]/50 rounded-xl justify-center "
          aria-label="Background type tabs"
          role="tablist"
        >
          {BACKGROUND_TYPES.map(renderTabButton)}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="px-3.5 py-2.5">
        {ActiveComponent && <ActiveComponent panelSize={panelSize} />}
      </div>
    </div>
  );
}

export default CustomBackgroundSelector;