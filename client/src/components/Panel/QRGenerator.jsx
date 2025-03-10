import { useState, useContext } from "react";
import "preline/preline";
import { DeviceContext } from "../../App";

function QRGenerator() {
  const { device, setDevice } = useContext(DeviceContext);
  const [tempQr, setTempQr] = useState(device.qr);

  const handleQrChange = () => {
    setDevice((prevDevice) => ({
      ...prevDevice,
      qr: tempQr,
    }));
  };


  return (
    <div id="qr-input-box" className="flex py-2">
      <input
        id="qr-input"
        type="text"
        className="text-sm !select-all w-full p-[5px] me-[7.5px] -mx-[2.5px] inline-flex rounded-md bg-black/10 dark:border-neutral-700 dark:text-neutral-400 "
        value={tempQr}
        onChange={(e) => setTempQr(e.target.value)}
      />
      <button
        id="qr-input-submit"
        onClick={handleQrChange}
        className=" inline-flex m-auto h-fit w-fit rounded-[100%] p-[2.5px] bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-check"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </button>
    </div>
  );
}

export default QRGenerator