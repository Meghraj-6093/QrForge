import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface ExportResolutionOption {
  id: string;
  label: string;
  width: number;
  height: number;
  value: number;
}

export const EXPORT_RESOLUTIONS: ExportResolutionOption[] = [
  { id: 'standard', label: 'Standard', width: 512, height: 512, value: 512 },
  { id: 'high-res', label: 'High Res', width: 1024, height: 1024, value: 1024 },
  { id: 'ultra-hd', label: 'Ultra HD', width: 2048, height: 2048, value: 2048 },
  { id: '4k-print', label: '4K Print', width: 4096, height: 4096, value: 4096 },
];

interface ExportResolutionSelectProps {
  value: number;
  onChange: (newValue: number) => void;
  className?: string;
}

export const ExportResolutionSelect: React.FC<ExportResolutionSelectProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [openUpward, setOpenUpward] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Find currently selected option object
  const currentOption = EXPORT_RESOLUTIONS.find((opt) => opt.value === value) || EXPORT_RESOLUTIONS[1];

  // Handle open with smooth animation
  const handleOpen = useCallback(() => {
    // Determine flip direction (upward vs downward)
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const menuHeight = 220; // Approx height of listbox
      setOpenUpward(spaceBelow < menuHeight && rect.top > menuHeight);
    }

    const currentIndex = EXPORT_RESOLUTIONS.findIndex((opt) => opt.value === value);
    setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);

    setIsRendered(true);
    setIsOpen(true);
    // Request animation frame to ensure DOM mounting before CSS transition starts
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsAnimatingIn(true);
      });
    });
  }, [value]);

  // Handle close with smooth exit animation
  const handleClose = useCallback(() => {
    setIsAnimatingIn(false);
    const timer = setTimeout(() => {
      setIsOpen(false);
      setIsRendered(false);
    }, 150); // Matches CSS transition duration
    return () => clearTimeout(timer);
  }, []);

  const toggleDropdown = useCallback(() => {
    if (isOpen) {
      handleClose();
    } else {
      handleOpen();
    }
  }, [isOpen, handleOpen, handleClose]);

  // Select Option
  const handleSelectOption = useCallback((opt: ExportResolutionOption) => {
    onChange(opt.value);
    handleClose();
    triggerRef.current?.focus();
  }, [onChange, handleClose]);

  // Click Outside Listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (isOpen) {
          handleClose();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, handleClose]);

  // Keyboard Navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        handleOpen();
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        handleClose();
        triggerRef.current?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % EXPORT_RESOLUTIONS.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + EXPORT_RESOLUTIONS.length) % EXPORT_RESOLUTIONS.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (EXPORT_RESOLUTIONS[focusedIndex]) {
          handleSelectOption(EXPORT_RESOLUTIONS[focusedIndex]);
        }
        break;
      case 'Tab':
        handleClose();
        break;
      default:
        break;
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full text-left ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="export-resolution-listbox"
        aria-label="Export Resolution Quality"
        onClick={toggleDropdown}
        className="w-full graphite-input px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between gap-2 border border-[#3A3A3A] bg-[#181818]/90 hover:border-[#EEEEED]/40 transition-all focus:outline-none focus:ring-2 focus:ring-[#EEEEED]/30 cursor-pointer shadow-lg"
      >
        <span className="truncate text-[#EEEEED]">
          {currentOption.label} ({currentOption.width} &times; {currentOption.height} px)
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-[#a3a3a3] transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-[#EEEEED]' : ''
          }`} 
        />
      </button>

      {/* Animated Dropdown Menu Listbox */}
      {isRendered && (
        <div
          id="export-resolution-listbox"
          role="listbox"
          tabIndex={-1}
          aria-label="Export Resolution Quality Options"
          className={`absolute left-0 right-0 z-50 p-1.5 rounded-2xl bg-[#080705]/95 backdrop-blur-2xl border border-[#3A3A3A] shadow-2xl space-y-1 transition-all duration-150 ease-out origin-top ${
            openUpward ? 'bottom-full mb-1.5 origin-bottom' : 'top-full mt-1.5 origin-top'
          } ${
            isAnimatingIn 
              ? 'opacity-100 translate-y-0 scale-100' 
              : 'opacity-0 translate-y-[-4px] scale-98 pointer-events-none'
          }`}
        >
          {EXPORT_RESOLUTIONS.map((opt, index) => {
            const isSelected = opt.value === value;
            const isKeyboardFocused = index === focusedIndex;

            return (
              <div
                key={opt.id}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelectOption(opt)}
                onMouseEnter={() => setFocusedIndex(index)}
                className={`px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'btn-platinum shadow-md font-bold'
                    : isKeyboardFocused
                    ? 'bg-[#3A3A3A]/70 text-[#EEEEED]'
                    : 'text-[#a3a3a3] hover:bg-[#3A3A3A]/40 hover:text-[#EEEEED]'
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-xs">
                    {opt.label}
                  </span>
                  <span className={`text-[10px] font-mono ${isSelected ? 'text-[#080705]/70' : 'text-[#a3a3a3]'}`}>
                    {opt.width} &times; {opt.height} px
                  </span>
                </div>

                {isSelected && (
                  <Check className="w-4 h-4 text-[#080705] shrink-0 stroke-[2.5]" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
