'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Layers } from 'lucide-react';

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

const ERA_PREVIEW_CLASSES: Record<string, string> = {
  'auto': 'bg-gradient-to-r from-amber-500 via-pink-500 to-sky-500 ring-2 ring-amber-400/50 shadow-xs animate-pulse',
  'era-neutral': 'bg-gradient-to-r from-zinc-900 to-zinc-100 border border-zinc-400 shadow-xs',
  'era-medieval': 'bg-gradient-to-r from-amber-700 via-orange-800 to-amber-900 border border-amber-500/60 shadow-xs',
  'era-renaissance': 'bg-gradient-to-r from-yellow-400 via-amber-500 to-amber-600 border border-yellow-300/60 shadow-xs',
  'era-industrial': 'bg-gradient-to-r from-slate-400 via-zinc-500 to-zinc-700 border border-slate-300/60 shadow-xs',
  'era-early20th': 'bg-gradient-to-r from-stone-300 via-stone-400 to-stone-600 border border-stone-400/60 shadow-xs',
  'era-golden': 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 border border-amber-300/60 shadow-xs',
  'era-retro': 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 border border-pink-400/60 shadow-xs',
  'era-modern': 'bg-gradient-to-r from-sky-400 via-blue-500 to-purple-500 border border-sky-300/60 shadow-xs',
};

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
        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all duration-200 cursor-pointer shadow-xs active:scale-98 ${
          isOpen
            ? 'bg-card border-primary ring-2 ring-primary/20 shadow-lg shadow-primary/5'
            : 'bg-background/80 hover:bg-card border-border/70 hover:border-primary/40'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {selectedOption && ERA_PREVIEW_CLASSES[selectedOption.value] ? (
            <span className={`w-4 h-4 rounded-full shrink-0 shadow-xs ${ERA_PREVIEW_CLASSES[selectedOption.value]}`} />
          ) : (
            <div className="p-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
          )}
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
        <div className="absolute top-full left-0 right-0 mt-2 z-50 p-2 rounded-2xl bg-card/98 border border-border/80 backdrop-blur-2xl shadow-2xl animate-in zoom-in-95 fade-in duration-200 max-h-72 overflow-y-auto space-y-1 divide-y divide-border/20">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            const previewClass = ERA_PREVIEW_CLASSES[opt.value] || 'bg-primary';
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
                <div className="flex items-center gap-3 truncate min-w-0">
                  <span className={`w-3.5 h-3.5 rounded-full shrink-0 shadow-xs ${previewClass} ${isSelected ? 'ring-2 ring-white/80' : ''}`} />
                  <span className="truncate tracking-tight">{opt.label}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 shrink-0 ml-2 text-current" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
