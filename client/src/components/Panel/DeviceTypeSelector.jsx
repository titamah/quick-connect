import { useState, useMemo } from "react";
import { useDevice } from "../../contexts/DeviceContext";
import { Plus } from "lucide-react";
import "./styles.css";

function DeviceTypeSelector() {
  const { device, updateDeviceInfo, takeSnapshot, isMobile } = useDevice();
  const [showCustomSizeInput, setShowCustomSizeInput] = useState(false);
  const [customWidth, setCustomWidth] = useState("");
  const [customHeight, setCustomHeight] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const devicesSizes = [
    // === IPHONE (Current Gen) ===
    {
      name: "iPhone 16 Pro Max",
      size: { x: 1320, y: 2868 },
      category: "iPhone",
    },
    { name: "iPhone 16 Pro", size: { x: 1206, y: 2622 }, category: "iPhone" },
    {
      name: "iPhone 16 Plus / 15 Plus / 14 Plus",
      size: { x: 1284, y: 2778 },
      category: "iPhone",
    },
    {
      name: "iPhone 16 / 15 / 14",
      size: { x: 1179, y: 2556 },
      category: "iPhone",
    },

    // === IPHONE (Previous Gen - Still Relevant) ===
    {
      name: "iPhone 15 Pro Max",
      size: { x: 1290, y: 2796 },
      category: "iPhone",
    },
    {
      name: "iPhone 15 Pro / 14 Pro / 13 Pro",
      size: { x: 1170, y: 2532 },
      category: "iPhone",
    },
    {
      name: "iPhone 14 Pro Max / 13 Pro Max",
      size: { x: 1284, y: 2778 },
      category: "iPhone",
    },
    { name: "iPhone 13 / 12", size: { x: 1170, y: 2532 }, category: "iPhone" },
    {
      name: "iPhone 13 Mini / 12 Mini",
      size: { x: 1080, y: 2340 },
      category: "iPhone",
    },

    // === SAMSUNG GALAXY S ===
    {
      name: "Samsung Galaxy S25 Ultra",
      size: { x: 1440, y: 3120 },
      category: "Samsung",
    },
    {
      name: "Samsung Galaxy S24 Ultra / S23 Ultra",
      size: { x: 1440, y: 3088 },
      category: "Samsung",
    },
    {
      name: "Samsung Galaxy S25+ / S24+ / S23+",
      size: { x: 1440, y: 3120 },
      category: "Samsung",
    },
    {
      name: "Samsung Galaxy S25 / S24 / S23",
      size: { x: 1080, y: 2340 },
      category: "Samsung",
    },
    {
      name: "Samsung Galaxy A55 / A54",
      size: { x: 1080, y: 2340 },
      category: "Samsung",
    },

    // === SAMSUNG FOLDABLES ===
    {
      name: "Samsung Galaxy Z Fold 6 / 5 (Inner)",
      size: { x: 1856, y: 2160 },
      category: "Samsung",
    },
    {
      name: "Samsung Galaxy Z Fold 6 / 5 (Cover)",
      size: { x: 904, y: 2316 },
      category: "Samsung",
    },
    {
      name: "Samsung Galaxy Z Flip 6 / 5 (Main)",
      size: { x: 1080, y: 2640 },
      category: "Samsung",
    },

    // === GOOGLE PIXEL ===
    {
      name: "Google Pixel 9 Pro XL / 8 Pro / 7 Pro",
      size: { x: 1344, y: 2992 },
      category: "Google Pixel",
    },
    {
      name: "Google Pixel 9 Pro",
      size: { x: 1280, y: 2856 },
      category: "Google Pixel",
    },
    {
      name: "Google Pixel 9",
      size: { x: 1080, y: 2424 },
      category: "Google Pixel",
    },
    {
      name: "Google Pixel 8 / 7",
      size: { x: 1080, y: 2400 },
      category: "Google Pixel",
    },
    {
      name: "Google Pixel 8a / 7a",
      size: { x: 1080, y: 2400 },
      category: "Google Pixel",
    },
    {
      name: "Google Pixel Fold / 9 Pro Fold (Inner)",
      size: { x: 1840, y: 2208 },
      category: "Google Pixel",
    },
    {
      name: "Google Pixel Fold / 9 Pro Fold (Cover)",
      size: { x: 1080, y: 2092 },
      category: "Google Pixel",
    },

    // === ANDROID PHONES ===
    {
      name: "OnePlus 13 / 12",
      size: { x: 1440, y: 3216 },
      category: "Android",
    },
    {
      name: "OnePlus Open (Inner)",
      size: { x: 1916, y: 2156 },
      category: "Android",
    },
    {
      name: "Xiaomi 15 Pro / 14 Pro",
      size: { x: 1440, y: 3200 },
      category: "Android",
    },
    {
      name: "Nothing Phone 2 / 2a",
      size: { x: 1080, y: 2412 },
      category: "Android",
    },
    {
      name: "OnePlus Nord 4 / 3",
      size: { x: 1080, y: 2412 },
      category: "Android",
    },
    {
      name: "ASUS ROG Phone 9 / 8",
      size: { x: 1080, y: 2448 },
      category: "Android",
    },
    {
      name: "Motorola Edge 50 / 40",
      size: { x: 1080, y: 2400 },
      category: "Android",
    },

    // === IPADS ===
    { name: 'iPad Pro 13" (M4)', size: { x: 2064, y: 2752 }, category: "iPad" },
    { name: 'iPad Pro 12.9"', size: { x: 2048, y: 2732 }, category: "iPad" },
    { name: 'iPad Air 13"', size: { x: 2048, y: 2732 }, category: "iPad" },
    { name: 'iPad Pro 11" (M4)', size: { x: 1668, y: 2420 }, category: "iPad" },
    { name: 'iPad Pro 11"', size: { x: 1668, y: 2388 }, category: "iPad" },
    { name: 'iPad Air 11"', size: { x: 1668, y: 2388 }, category: "iPad" },
    { name: 'iPad 10.9"', size: { x: 1640, y: 2360 }, category: "iPad" },
    { name: 'iPad 10.2"', size: { x: 1620, y: 2160 }, category: "iPad" },
    { name: 'iPad Mini 8.3"', size: { x: 1488, y: 2266 }, category: "iPad" },

    // === ANDROID TABLETS ===
    {
      name: "Samsung Galaxy Tab S10 Ultra / S9 Ultra",
      size: { x: 1848, y: 2960 },
      category: "Tablet",
    },
    {
      name: "Samsung Galaxy Tab S10+ / S9+",
      size: { x: 1752, y: 2800 },
      category: "Tablet",
    },
    {
      name: "Samsung Galaxy Tab S9 / S8",
      size: { x: 1600, y: 2560 },
      category: "Tablet",
    },
    {
      name: "Google Pixel Tablet",
      size: { x: 1600, y: 2560 },
      category: "Tablet",
    },
    { name: "OnePlus Pad", size: { x: 1600, y: 2560 }, category: "Tablet" },

    // === DESKTOP MONITORS ===
    { name: "Desktop 4K", size: { x: 3840, y: 2160 }, category: "Desktop" },
    { name: "Desktop QHD", size: { x: 2560, y: 1440 }, category: "Desktop" },
    {
      name: "Desktop Full HD",
      size: { x: 1920, y: 1080 },
      category: "Desktop",
    },
    { name: "Desktop HD", size: { x: 1366, y: 768 }, category: "Desktop" },

    // === LAPTOPS ===
    { name: 'MacBook Pro 16"', size: { x: 3456, y: 2234 }, category: "Laptop" },
    { name: 'MacBook Pro 14"', size: { x: 3024, y: 1964 }, category: "Laptop" },
    { name: 'MacBook Air 15"', size: { x: 2880, y: 1864 }, category: "Laptop" },
    { name: 'MacBook Air 13"', size: { x: 2560, y: 1664 }, category: "Laptop" },
    {
      name: "Dell XPS 15 / 16",
      size: { x: 3456, y: 2160 },
      category: "Laptop",
    },
    {
      name: "ThinkPad X1 Carbon",
      size: { x: 2560, y: 1600 },
      category: "Laptop",
    },
    {
      name: "Surface Laptop Studio",
      size: { x: 2400, y: 1600 },
      category: "Laptop",
    },
  ];

  const updateDevice = (deviceInfo) => {
    updateDeviceInfo({
      type: deviceInfo.name,
      size: deviceInfo.size,
    });
    setShowCustomSizeInput(false);
    setTimeout(() => takeSnapshot("Device changed"), 0);
  };

  const handleCustomSizeSubmit = () => {
    const width = parseInt(customWidth);
    const height = parseInt(customHeight);

    if (width > 0 && height > 0) {
      const customDevice = {
        name: `Custom Dimensions`,
        size: { x: width, y: height },
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

  const filteredDevices = useMemo(() => {
    if (!searchQuery.trim()) return devicesSizes;

    return devicesSizes.filter(
      (device) =>
        device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const devicesByCategory = useMemo(() => {
    return filteredDevices.reduce((acc, device) => {
      if (!acc[device.category]) {
        acc[device.category] = [];
      }
      acc[device.category].push(device);
      return acc;
    }, {});
  }, [filteredDevices]);

  const categoryOrder = [
    "iPhone",
    "Samsung",
    "Google Pixel",
    "Android",
    "Ipad",
    "Tablet",
    "Desktop",
    "Laptop",
  ];

  return (
    <div
      className={`h-full flex flex-col overflow-hidden ${
        isMobile ? "text-sm" : "text-sm"
      }`}
    >
      <div
        className={`flex-shrink-0 bg-black/5 dark:bg-black/15 ${
          isMobile ? "pb-2.5 pt-5 px-3 mb-1 rounded-t-2xl" : "p-3.5 mb-3"
        }`}
      >
        <h3 className={`${isMobile ? "mb-1" : "mb-2"}`}>Current Device</h3>
        <div
          className={`flex text-[var(--text-secondary)] justify-between w-full h-fit gap-x-3 whitespace-nowrap `}
        >
          <span className="truncate">{device.type}</span>
          <span className="font-thin italic">
            ({device.size.x} × {device.size.y})
          </span>
        </div>
      </div>

      <div
        className={` flex-shrink-0 flex justify-between items-center ${
          isMobile ? "py-0.5 px-3 mb-1 hidden" : "px-3.5"
        }`}
      >
        <h2>Select Device</h2>
        {!showCustomSizeInput && (
          <Plus
            onClick={() => setShowCustomSizeInput(true)}
            strokeWidth={3}
            className="size-[21px] cursor-pointer hover:text-[var(--text-primary)]/50"
          />
        )}
      </div>

      <div
        className={`flex-shrink-0 flex w-full justify-between gap-x-3 ${isMobile ? "pb-2.5 px-2" : "pb-2 px-2"}`}
      >
        <div className="relative w-full my-2">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]/50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search devices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8.5 pr-3 py-1 text-xs border border-[var(--border-color)]/50 focus:outline-none focus:border-[var(--accent)]/50 rounded-xl"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]/50 hover:text-[var(--text-secondary)] hover:cursor-pointer"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
          {!showCustomSizeInput && isMobile && (
            <Plus
              onClick={() => setShowCustomSizeInput(true)}
              strokeWidth={3}
              className="size-[21px] self-center cursor-pointer hover:text-[var(--text-primary)]/50"
            />
          )}
      </div>

      {showCustomSizeInput && (
        <div
          className={`flex-shrink-0 border border-[var(--border-color)]/50 rounded-lg  bg-black/5 dark:bg-black/15 ${
            isMobile ? "mx-2.5 p-2 mb-3" : "p-2 mx-2.5 mb-5"
          }`}
        >
          <div className="flex flex-col gap-1">
            <h3 className="text-[var(--text-primary)]/75 px-0.5 !mb-1">
              Custom Dimensions
            </h3>
            <div className="flex gap-2 mb-1.5 ">
              <input
                type="number"
                placeholder="Width"
                value={customWidth}
                onChange={(e) => setCustomWidth(e.target.value)}
                className={`flex-1 min-w-0 ${
                  isMobile ? "px-1 py-0.5" : "px-2 py-1"
                } text-xs border border-[var(--border-color)]/25 rounded bg-[var(--bg-main)]`}
              />
              <span className="text-xs text- flex items-center">×</span>
              <input
                type="number"
                placeholder="Height"
                value={customHeight}
                onChange={(e) => setCustomHeight(e.target.value)}
                className={`flex-1 min-w-0 ${
                  isMobile ? "px-1 py-0.5" : "px-2 py-1"
                } text-xs border border-[var(--border-color)]/25 rounded bg-[var(--bg-main)]`}
              />
            </div>
            <div className="flex gap-2 text-xs ">
              <button
                onClick={handleCustomSizeSubmit}
                className={`flex-1 ${
                  isMobile ? "px-1 py-0.5" : "px-2 py-1"
                } bg-[var(--accent)] text-white rounded  hover:cursor-pointer hover:bg-[var(--accent)]/75`}
              >
                Apply
              </button>
              <button
                onClick={handleCustomSizeCancel}
                className={`flex-1 ${
                  isMobile ? "px-1 py-0.5" : "px-2 py-1"
                } bg-[var(--border-color)] hover:bg-[var(--border-color)]/75 hover:cursor-pointer text-[var(--text-primary)] rounded hover:bg-gray-300 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-scroll min-h-0">
        <div className="space-y-4 h-full">
          {categoryOrder.map((category) => {
            const devices = devicesByCategory[category];
            if (!devices || devices.length === 0) return null;

            return (
              <div key={category}>
                <h3 className="border-b border-[var(--border-color)]/50 pb-1 px-3.5">
                  {category}
                </h3>
                <div className="space-y-0.75">
                  {devices.map((deviceInfo, index) => (
                    <button
                      key={`${category}-${index}`}
                      onClick={() => updateDevice(deviceInfo)}
                      className={`flex justify-between text-xs w-full h-fit gap-x-3 p-1.75 border-y px-3.5 hover:bg-[var(--contrast-sheer)] cursor-pointer transition-colors ${
                        device.type === deviceInfo.name
                          ? "bg-[var(--accent)]/12.5 text-[var(--accent)] border-[var(--border-color)]/25"
                          : "text-[var(--text-secondary)] border-black/0"
                      }`}
                    >
                      <span className="truncate flex-1 min-w-0 text-left">
                        {deviceInfo.name}
                      </span>
                      <span
                        className={`font-thin text-xs italic whitespace-nowrap pr-1 ${
                          device.type === deviceInfo.name
                            ? "text-[var(--accent)]/75"
                            : "text-[var(--text-secondary)]/75"
                        }`}
                      >
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
