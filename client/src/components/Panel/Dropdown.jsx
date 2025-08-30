import { useState } from "react";
import { ChevronDown } from "lucide-react";

function Dropdown({ options = [], value, onChange }) {
  const [open, setOpen] = useState(false);

  const handleSelect = (option) => {
    onChange(option);
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left w-[95px]">
      <button
        type="button"
        className="flex items-center justify-between px-[15px] py-1 border border-black/10 dark:border-white/10 rounded-sm text-sm text-neutral-600 dark:text-neutral-200/75 w-full"
        onClick={() => setOpen(!open)}
      >
        <span>{value.charAt(0).toUpperCase() + value.slice(1)}</span>
        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-sm shadow-lg">
          {options.map((option) => (
            <div
              key={option}
              className="px-3 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm text-neutral-700 dark:text-neutral-200 cursor-pointer"
              onClick={() => handleSelect(option)}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dropdown;
