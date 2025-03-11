import { useState, useContext } from "react";
import "preline/preline";
import { DeviceContext } from "../../App";

function QRGenerator() {
  const { device, setDevice } = useContext(DeviceContext);
  const [deviceSize, setDeviceSize] = useState(device.size);
  const [deviceName, setDeviceName] = useState(device.size);

  const devicesSizes = [
    { name: "test phone", size: { x: 124, y: 778 } },
    { name: "iPhone 14 Pro Max", size: { x: 1284, y: 2778 } },
    { name: "iPhone 16 Pro", size: { x: 1179, y: 2556 } },
    { name: "iPhone 16 Pro Max", size: { x: 1290, y: 2796 } },
    { name: "Samsung Galaxy S23 Ultra", size: { x: 1440, y: 3088 } },
    { name: "Samsung Galaxy S24 Ultra", size: { x: 1440, y: 3120 } },
    { name: "Samsung Galaxy S25", size: { x: 1179, y: 2556 } },
    { name: "Samsung Galaxy Z Flip 5", size: { x: 1080, y: 2640 } },
    { name: "Google Pixel 8a", size: { x: 1080, y: 2400 } },
    { name: "Google Pixel 9", size: { x: 1080, y: 2340 } },
    { name: "Google Pixel 9 Pro", size: { x: 1344, y: 2992 } },
    { name: "OnePlus 12", size: { x: 1440, y: 3168 } },
    { name: "Sony Xperia 5 V", size: { x: 1080, y: 2520 } },
    { name: "Xiaomi 14 Ultra", size: { x: 1440, y: 3200 } },
  ];

  function deviceList() {
    const updateDevice = (i) => {
      setDeviceName(i.name);
      setDeviceSize(i.size);
      setDevice((prevDevice) => ({
        ...prevDevice,
        type: i.name,
        size: i.size,
      }));
    };

    let deviceCount = -1;
    const deviceSizeOptions = devicesSizes.map((i) => {
      deviceCount++;
      return (
        <div
          key={deviceCount}
          onClick={(e) => updateDevice(i, e)}
          className="flex justify-between text-xs w-full h-fit items-center gap-x-3.5 py-[7.5px] px-[5px] rounded-lg text-gray-800 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700"
        >
          <span>{`${i.name} `}</span>
          <span className="font-thin text-xs italic">{`(${i.size.x} x ${i.size.y})`}</span>
        </div>
      );
    });
    return (
      <div className="p-1 w-max max-h-[40vh] overflow-y-scroll space-y-0.5">
        <div
          key={0}
          onClick={() => {
            console.log(key);
          }}
          className="flex text-xs w-full h-fit items-center gap-x-3.5 py-[7.5px] px-[5px] rounded-lg text-gray-800 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700"
        >
          <span className="font-thin text-xl">{"+"}</span>
          Custom Size
        </div>

        {deviceSizeOptions}
      </div>
    );
  }

  return (
    <div id="device-type-dropdown" className="hs-dropdown relative -mx-1 py-2 ">
      <button
        id="hs-dropdown-custom-trigger"
        type="button"
        className="hs-dropdown-toggle max-w-full py-1 px-2 inline-flex items-center gap-x-2 text-sm font-medium rounded-full border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
        aria-haspopup="menu"
        aria-expanded="false"
        aria-label="Dropdown"
      >
        <span className="text-gray-600 text-xs truncate  dark:text-neutral-400">
          {`${device.type} `}
          {
            <span className="font-thin">{`(${device.size.x} x ${device.size.y})`}</span>
          }
        </span>
        <svg
          className="hs-dropdown-open:rotate-180 size-4"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div
        id="device-type-menu"
        className="hs-dropdown-menu z-1000 -translate-y-[12.5px] transition-[opacity,margin] duration hidden min-w-60 min-w-60 bg-white shadow-md rounded-lg mt-2 dark:bg-neutral-800 dark:border dark:border-neutral-700"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="hs-dropdown-custom-trigger"
      >
        {deviceList()}
      </div>
    </div>
  );
}

export default QRGenerator;
