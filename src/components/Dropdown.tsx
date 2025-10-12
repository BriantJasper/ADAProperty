import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: string[] | DropdownOption[];
  value?: string;
  selected?: string;
  onChange?: (value: string) => void;
  onSelect?: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  selected,
  onChange,
  onSelect,
  placeholder = "Pilih opsi",
  label,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Normalize options to DropdownOption format
  const normalizedOptions: DropdownOption[] = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  // Use either value or selected prop
  const currentValue = value ?? selected ?? "";

  // Use either onChange or onSelect handler
  const handleSelect = (optionValue: string) => {
    if (onChange) {
      onChange(optionValue);
    }
    if (onSelect) {
      onSelect(optionValue);
    }
    setIsOpen(false);
  };

  // Get display label for current value
  const getDisplayLabel = () => {
    if (!currentValue) return placeholder;
    const option = normalizedOptions.find((opt) => opt.value === currentValue);
    return option ? option.label : placeholder;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative w-full">
      {label && (
        <label className="block text-sm font-semibold text-white mb-2 drop-shadow-md">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-5 py-3.5 text-left bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl shadow-2xl hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300 ${className}`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`font-medium ${
              currentValue ? "text-white" : "text-white/70"
            }`}
          >
            {getDisplayLabel()}
          </span>
          <ChevronDown
            className={`w-5 h-5 text-white/80 transition-transform duration-300 ${
              isOpen ? "transform rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <>
          {/* Backdrop blur overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown menu */}
          <div className="absolute z-50 w-full mt-3 bg-white/95 backdrop-blur-2xl border border-white/40 rounded-xl shadow-2xl max-h-72 overflow-hidden animate-dropdown">
            <div className="overflow-y-auto max-h-72 py-2 custom-scrollbar">
              {normalizedOptions.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-5 py-3.5 text-left transition-all duration-200 ${
                    currentValue === option.value
                      ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-900 font-semibold border-l-4 border-blue-500"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 hover:translate-x-1"
                  }`}
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <span className="flex items-center gap-2">
                    {currentValue === option.value && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    )}
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes dropdown {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-dropdown {
          animation: dropdown 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #3b82f6, #8b5cf6);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #2563eb, #7c3aed);
        }
      `}</style>
    </div>
  );
};

export default Dropdown;
