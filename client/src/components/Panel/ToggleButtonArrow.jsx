import "preline/preline";

function ToggleButtonArrow(isOpen) {
  return (
    <>
    <svg
    className={`${
      !isOpen
        ? "hidden"
        : "block"
    } size-4`}
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
    <path d="m6 9 6 6 6-6"></path>
  </svg>
  <svg
    className={`${
      !isOpen
        ? "block"
        : "hidden"
    } size-4`}
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
    <path d="m18 15-6-6-6 6"></path>
  </svg>
  </> 
  );
}

export default ToggleButtonArrow