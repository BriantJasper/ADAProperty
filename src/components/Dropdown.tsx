import { useState, useRef, useEffect } from "react";

interface DropdownProps {
  label?: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}

export default function Dropdown({ label, options, selected, onSelect }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative w-full text-left">
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex justify-between items-center px-4 py-3 bg-white/80 backdrop-blur-md text-gray-800 font-medium shadow-md hover:bg-white/90 transition
          ${isOpen ? "rounded-t-xl" : "rounded-xl"}`}
      >
        <span>{selected || label || "Select"}</span>
        <svg
          className={`w-5 h-5 text-gray-700 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute top-full w-full bg-black/20 backdrop-blur-md shadow-lg text-white rounded-b-xl overflow-hidden z-50"
        >
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onSelect(option);
                setIsOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 hover:bg-white/20 transition ${
                selected === option ? "bg-white/20" : ""
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
