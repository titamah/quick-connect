import { useState, useMemo } from "react";
import { useDevice } from "../../contexts/DeviceContext";
import "./styles.css";

function DeviceTypeSelector() {
  const { device, updateBackground, updateQRConfig, updateDeviceInfo } = useDevice();
  const [deviceSize, setDeviceSize] = useState(device.size);
  const [deviceName, setDeviceName] = useState(device.type);
  const [showCustomSizeInput, setShowCustomSizeInput] = useState(false);
  const [customWidth, setCustomWidth] = useState("");
  const [customHeight, setCustomHeight] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const devicesSizes = [
    // === IPHONE ===
    { name: "iPhone 16 Pro Max", size: { x: 1320, y: 2868 }, category: "iPhone" },
    { name: "iPhone 15 Pro Max", size: { x: 1290, y: 2796 }, category: "iPhone" },
    { name: "iPhone 14 Pro Max / 13 Pro Max / 12 Pro Max", size: { x: 1284, y: 2778 }, category: "iPhone" },
    { name: "iPhone 16 Pro / 15 Pro", size: { x: 1206, y: 2622 }, category: "iPhone" },
    { name: "iPhone 14 Pro / 13 Pro / 12 Pro", size: { x: 1170, y: 2532 }, category: "iPhone" },
    { name: "iPhone 16 / 15 / 14 / 13 / 12", size: { x: 1179, y: 2556 }, category: "iPhone" },
    { name: "iPhone SE (3rd gen)", size: { x: 750, y: 1334 }, category: "iPhone" },
    { name: "iPhone 13 Mini / 12 Mini", size: { x: 1080, y: 2340 }, category: "iPhone" },
    
    // === SAMSUNG ===
    { name: "Samsung Galaxy S25 Ultra", size: { x: 1440, y: 3120 }, category: "Samsung" },
    { name: "Samsung Galaxy S24 Ultra / S23 Ultra", size: { x: 1440, y: 3088 }, category: "Samsung" },
    { name: "Samsung Galaxy S22 Ultra / Note 20 Ultra", size: { x: 1440, y: 3088 }, category: "Samsung" },
    { name: "Samsung Galaxy S25 / S24 / S23", size: { x: 1080, y: 2340 }, category: "Samsung" },
    { name: "Samsung Galaxy S22 / S21", size: { x: 1080, y: 2400 }, category: "Samsung" },
    { name: "Samsung Galaxy S20", size: { x: 1440, y: 3200 }, category: "Samsung" },
    { name: "Samsung Galaxy A55 / A54 / A53", size: { x: 1080, y: 2340 }, category: "Samsung" },
    
    // === GOOGLE PIXEL ===
    { name: "Google Pixel 9 Pro XL / 8 Pro / 7 Pro", size: { x: 1344, y: 2992 }, category: "Google Pixel" },
    { name: "Google Pixel 9 Pro", size: { x: 1280, y: 2856 }, category: "Google Pixel" },
    { name: "Google Pixel 9 / 8 / 7", size: { x: 1080, y: 2424 }, category: "Google Pixel" },
    { name: "Google Pixel 6 Pro", size: { x: 1440, y: 3120 }, category: "Google Pixel" },
    { name: "Google Pixel 6 / 6a", size: { x: 1080, y: 2400 }, category: "Google Pixel" },
    { name: "Google Pixel 8a / 7a / 6a", size: { x: 1080, y: 2400 }, category: "Google Pixel" },
    
    // === OTHER PHONES ===
    { name: "OnePlus 12 / 11", size: { x: 1440, y: 3216 }, category: "Other" },
    { name: "OnePlus Nord 4 / Nord 3", size: { x: 1080, y: 2412 }, category: "Other" },
    { name: "Nothing Phone (2) / (1)", size: { x: 1080, y: 2412 }, category: "Other" },
    
    // === FOLDABLES ===
    { name: "Samsung Galaxy Z Fold 6 (Unfolded)", size: { x: 1856, y: 2160 }, category: "Foldable" },
    { name: "Samsung Galaxy Z Fold 5 / 4 (Unfolded)", size: { x: 1812, y: 2176 }, category: "Foldable" },
    { name: "Samsung Galaxy Z Fold 3 (Unfolded)", size: { x: 1768, y: 2208 }, category: "Foldable" },
    { name: "Samsung Galaxy Z Fold 6 (Folded)", size: { x: 904, y: 2316 }, category: "Foldable" },
    { name: "Samsung Galaxy Z Fold 5 / 4 / 3 (Folded)", size: { x: 832, y: 2268 }, category: "Foldable" },
    
    { name: "Samsung Galaxy Z Flip 6 / 5 (Unfolded)", size: { x: 1080, y: 2640 }, category: "Foldable" },
    { name: "Samsung Galaxy Z Flip 4 / 3 (Unfolded)", size: { x: 1080, y: 2636 }, category: "Foldable" },
    { name: "Samsung Galaxy Z Flip 6 / 5 (Folded)", size: { x: 720, y: 748 }, category: "Foldable" },
    { name: "Samsung Galaxy Z Flip 4 / 3 (Folded)", size: { x: 720, y: 512 }, category: "Foldable" },
    
    { name: "Google Pixel Fold (Unfolded)", size: { x: 1840, y: 2208 }, category: "Foldable" },
    { name: "OnePlus Open (Unfolded)", size: { x: 1916, y: 2156 }, category: "Foldable" },
    
    // === TABLETS - IPAD ===
    { name: "iPad Pro 12.9\" (M4 / M2 / M1)", size: { x: 2048, y: 2732 }, category: "Tablet" },
    { name: "iPad Pro 11\" (M4 / M2 / M1)", size: { x: 1668, y: 2388 }, category: "Tablet" },
    { name: "iPad Air 13\" (M2)", size: { x: 2048, y: 2732 }, category: "Tablet" },
    { name: "iPad Air 11\" / 10.9\" (M2 / M1)", size: { x: 1668, y: 2388 }, category: "Tablet" },
    { name: "iPad (10th / 9th gen)", size: { x: 1620, y: 2160 }, category: "Tablet" },
    { name: "iPad (8th / 7th gen)", size: { x: 1620, y: 2160 }, category: "Tablet" },
    { name: "iPad Mini (6th / 5th gen)", size: { x: 1488, y: 2266 }, category: "Tablet" },
    
    // === TABLETS - ANDROID & WINDOWS ===
    { name: "Samsung Galaxy Tab S9 Ultra / S8 Ultra", size: { x: 1848, y: 2960 }, category: "Tablet" },
    { name: "Samsung Galaxy Tab S9+ / S8+", size: { x: 1752, y: 2800 }, category: "Tablet" },
    { name: "Samsung Galaxy Tab S9 / S8 / S7", size: { x: 1600, y: 2560 }, category: "Tablet" },
    { name: "Surface Pro 11 / 10 / 9", size: { x: 1920, y: 2880 }, category: "Tablet" },
    { name: "Surface Pro 8 / 7", size: { x: 2880, y: 1920 }, category: "Tablet" },
    { name: "Surface Laptop Studio 2 / 1", size: { x: 2400, y: 1600 }, category: "Tablet" },
    
    // === WEARABLES ===
    { name: "Apple Watch Series 10 (46mm)", size: { x: 416, y: 496 }, category: "Wearable" },
    { name: "Apple Watch Series 10 (42mm)", size: { x: 374, y: 446 }, category: "Wearable" },
    { name: "Apple Watch Series 9 / 8 / 7 (45mm)", size: { x: 396, y: 484 }, category: "Wearable" },
    { name: "Apple Watch Series 9 / 8 / 7 (41mm)", size: { x: 352, y: 430 }, category: "Wearable" },
    { name: "Apple Watch SE (44mm / 40mm)", size: { x: 368, y: 448 }, category: "Wearable" },
    { name: "Samsung Galaxy Watch Ultra", size: { x: 480, y: 480 }, category: "Wearable" },
    { name: "Samsung Galaxy Watch 7 / 6 / 5 / 4", size: { x: 432, y: 432 }, category: "Wearable" },
    
    // === E-READERS & GAMING ===
    { name: "Kindle Paperwhite (11th / 10th gen)", size: { x: 1236, y: 1648 }, category: "E-Reader" },
    { name: "Kindle Oasis (10th / 9th gen)", size: { x: 1264, y: 1680 }, category: "E-Reader" },
    { name: "Kindle Scribe", size: { x: 1860, y: 2480 }, category: "E-Reader" },
    { name: "Kindle (11th / 10th gen)", size: { x: 758, y: 1024 }, category: "E-Reader" },
    
    { name: "Steam Deck OLED / LCD", size: { x: 1280, y: 800 }, category: "Gaming" },
    { name: "Nintendo Switch OLED / Original", size: { x: 1280, y: 720 }, category: "Gaming" },
    { name: "ASUS ROG Ally X / ROG Ally", size: { x: 1920, y: 1080 }, category: "Gaming" },
    { name: "Lenovo Legion Go", size: { x: 2560, y: 1600 }, category: "Gaming" },
  ];
  
  const updateDevice = (deviceInfo) => {
    setDeviceName(deviceInfo.name);
    setDeviceSize(deviceInfo.size);
    updateDeviceInfo({
      type: deviceInfo.name,
      size: deviceInfo.size,
    });
    setShowCustomSizeInput(false);
  };

  const handleCustomSizeSubmit = () => {
    const width = parseInt(customWidth);
    const height = parseInt(customHeight);
    
    if (width > 0 && height > 0) {
      const customDevice = {
        name: `Custom (${width} x ${height})`,
        size: { x: width, y: height }
      };
      updateDevice(customDevice);
      setCustomWidth("");
      setCustomHeight("");
    }
  };

  const handleCustomSizeCancel = () => {
    setShowCustomSizeInput(false);
    setCustomWidth("");
    setCustomHeight("");
  };

  // Filter devices based on search query
  const filteredDevices = useMemo(() => {
    if (!searchQuery.trim()) return devicesSizes;
    
    return devicesSizes.filter(device => 
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Group devices by category
  const devicesByCategory = useMemo(() => {
    return filteredDevices.reduce((acc, device) => {
      if (!acc[device.category]) {
        acc[device.category] = [];
      }
      acc[device.category].push(device);
      return acc;
    }, {});
  }, [filteredDevices]);

  const categoryOrder = ["iPhone", "Samsung", "Google Pixel", "Other", "Foldable", "Tablet", "Wearable", "Gaming", "E-Reader"];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Current Device Display */}
      <div className="flex-shrink-0 mb-4 p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg">
        <h3 className="text-sm font-medium text-gray-800 dark:text-white mb-1">
          Current Device
        </h3>
        <div className="text-xs text-gray-600 dark:text-neutral-400">
          <span className="truncate">{device.type}</span>
          <span className="font-thin ml-1">({device.size.x} × {device.size.y})</span>
        </div>
      </div>

      {/* Header with Custom Button */}
      <div className="flex-shrink-0 flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-800 dark:text-white">
          Select Device
        </h3>
        {!showCustomSizeInput && (
          <button
            onClick={() => setShowCustomSizeInput(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700 transition-colors"
          >
            <span className="text-lg leading-none">+</span>
            Custom
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="flex-shrink-0 mb-3">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-neutral-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search devices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Custom Size Input */}
      {showCustomSizeInput && (
        <div className="flex-shrink-0 mb-3 p-3 border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-gray-800 dark:text-white">
              Custom Dimensions
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Width"
                value={customWidth}
                onChange={(e) => setCustomWidth(e.target.value)}
                className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
              <span className="text-xs text-gray-500 dark:text-neutral-400 flex items-center">×</span>
              <input
                type="number"
                placeholder="Height"
                value={customHeight}
                onChange={(e) => setCustomHeight(e.target.value)}
                className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCustomSizeSubmit}
                className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Apply
              </button>
              <button
                onClick={handleCustomSizeCancel}
                className="flex-1 px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCROLLABLE DEVICE LIST - Dynamic height using remaining space */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="space-y-4 pr-2 h-full"> {/* Added h-full here */}
          {categoryOrder.map(category => {
            const devices = devicesByCategory[category];
            if (!devices || devices.length === 0) return null;
            
            return (
              <div key={category}>
                <div className="px-1 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide dark:text-neutral-400 border-b border-gray-100 dark:border-neutral-700 mb-2">
                  {category}
                </div>
                <div className="space-y-1">
                  {devices.map((deviceInfo, index) => (
                    <button
                      key={`${category}-${index}`}
                      onClick={() => updateDevice(deviceInfo)}
                      className={`flex justify-between text-xs w-full h-fit items-center gap-x-3 py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 cursor-pointer transition-colors ${
                        device.type === deviceInfo.name
                          ? 'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                          : 'text-gray-800 dark:text-neutral-400'
                      }`}
                    >
                      <span className="truncate flex-1 min-w-0 text-left">{deviceInfo.name}</span>
                      <span className="font-thin text-xs italic text-gray-500 dark:text-neutral-500 whitespace-nowrap ml-2">
                        {deviceInfo.size.x} × {deviceInfo.size.y}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DeviceTypeSelector;