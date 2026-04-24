import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

export default function CustomDropdown({ label, icon: Icon, options, value, onChange, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find((opt) => opt.value === value)?.label || options[0]?.label;

  return (
    <div className="w-full" ref={dropdownRef}>
      {label && (
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full h-11 flex items-center justify-between pl-10 pr-3.5 text-sm font-medium text-slate-700 bg-slate-50 border rounded-xl transition-all shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 ${
            disabled 
              ? "bg-slate-100/70 text-slate-400 border-slate-200 cursor-not-allowed" 
              : isOpen 
                ? "border-indigo-500 bg-white" 
                : "border-slate-200 hover:border-slate-300 bg-white"
          }`}
        >
          {Icon && (
            <Icon size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${disabled ? "text-slate-300" : isOpen ? "text-indigo-500" : "text-slate-400"}`} />
          )}
          <span className="truncate pr-2">{selectedLabel}</span>
          {!disabled && (
            <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-indigo-500" : ""}`} />
          )}
        </button>

        {isOpen && (
          <div className="absolute z-50 top-full left-0 w-full mt-1.5 bg-white border border-slate-100 rounded-xl shadow-lg shadow-slate-200/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <ul className="max-h-60 overflow-y-auto p-1.5 custom-scrollbar">
              {options.map((opt) => (
                <li
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors ${
                    value === opt.value
                      ? "bg-indigo-50 text-indigo-700 font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                  }`}
                >
                  {opt.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
