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
        inline-flex justify-center items-center rounded-sm 
        w-full max-w-[150px] px-3 py-1.5 text-sm font-medium
        transition-colors duration-200
        ${activeTab === id 
          ? "bg-neutral-400/20 text-blue-600" 
          : "text-gray-500 hover:text-blue-600 hover:bg-black/20"
        }
        dark:text-neutral-400 dark:hover:text-blue-500
        focus:outline-none focus:text-blue-600
        disabled:opacity-50 disabled:pointer-events-none
      `}
      aria-selected={activeTab === id}
      role="tab"
    >
      {label}
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
      <div className="border-b border-gray-200 dark:border-neutral-700 px-4 py-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Background
        </h3>
        
        {/* Tab Navigation */}
        <nav
          className="flex gap-2 bg-black/5 rounded-sm"
          aria-label="Background type tabs"
          role="tablist"
        >
          {BACKGROUND_TYPES.map(renderTabButton)}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {ActiveComponent && <ActiveComponent panelSize={panelSize} />}
      </div>
    </div>
  );
}

export default CustomBackgroundSelector;