'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Sparkles, Layers } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
}

export function CustomSelect({ value, onChange, options, placeholder = 'Selecionar...' }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all duration-200 cursor-pointer shadow-sm active:scale-98 ${
          isOpen
            ? 'bg-card border-primary ring-2 ring-primary/20 shadow-lg shadow-primary/5'
            : 'bg-background/80 hover:bg-card border-border/70 hover:border-primary/40'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-foreground truncate tracking-tight">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <div className={`p-1 rounded-lg bg-muted/50 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>

      {/* Floating Glassmorphic Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 p-2 rounded-2xl bg-card/95 border border-border/80 backdrop-blur-2xl shadow-2xl animate-in zoom-in-95 fade-in duration-200 max-h-64 overflow-y-auto space-y-1 divide-y divide-border/20">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 border border-primary/40'
                    : 'text-foreground hover:bg-primary/10 hover:text-primary hover:translate-x-1'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-white' : 'bg-primary/40'}`} />
                  <span className="truncate tracking-tight">{opt.label}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 shrink-0 ml-2 text-white" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
