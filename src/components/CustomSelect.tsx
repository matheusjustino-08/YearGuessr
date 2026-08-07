'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Sparkles, Layers, Flame, Crown, Cog, Film, Sun, Disc, Zap, Square } from 'lucide-react';

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

interface ThemeMeta {
  color1: string;
  color2: string;
  icon: React.ReactNode;
}

const THEME_META: Record<string, ThemeMeta> = {
  'auto': {
    color1: '#f59e0b',
    color2: '#38bdf8',
    icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" />
  },
  'era-neutral': {
    color1: '#090b10',
    color2: '#ffffff',
    icon: <Square className="w-3.5 h-3.5 text-sky-400 fill-sky-400/20" />
  },
  'era-medieval': {
    color1: '#b45309',
    color2: '#78350f',
    icon: <Flame className="w-3.5 h-3.5 text-amber-500" />
  },
  'era-renaissance': {
    color1: '#eab308',
    color2: '#b45309',
    icon: <Crown className="w-3.5 h-3.5 text-yellow-400" />
  },
  'era-industrial': {
    color1: '#64748b',
    color2: '#334155',
    icon: <Cog className="w-3.5 h-3.5 text-slate-400" />
  },
  'era-early20th': {
    color1: '#a8a29e',
    color2: '#57534e',
    icon: <Film className="w-3.5 h-3.5 text-stone-400" />
  },
  'era-golden': {
    color1: '#f59e0b',
    color2: '#ea580c',
    icon: <Sun className="w-3.5 h-3.5 text-amber-400" />
  },
  'era-retro': {
    color1: '#ec4899',
    color2: '#06b6d4',
    icon: <Disc className="w-3.5 h-3.5 text-pink-400" />
  },
  'era-modern': {
    color1: '#38bdf8',
    color2: '#8b5cf6',
    icon: <Zap className="w-3.5 h-3.5 text-sky-400" />
  },
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

  const selectedMeta = selectedOption ? THEME_META[selectedOption.value] : null;

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
          {selectedMeta ? (
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/50 shrink-0">
              <div className="flex items-center w-5 h-3 rounded-md overflow-hidden border border-border/60 shadow-xs">
                <span className="w-1/2 h-full" style={{ backgroundColor: selectedMeta.color1 }} />
                <span className="w-1/2 h-full" style={{ backgroundColor: selectedMeta.color2 }} />
              </div>
              {selectedMeta.icon}
            </div>
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
        <div className="absolute top-full left-0 right-0 mt-2 z-50 p-2 rounded-2xl bg-card/98 border border-border/80 backdrop-blur-2xl shadow-2xl animate-in zoom-in-95 fade-in duration-200 max-h-72 overflow-y-auto space-y-1.5 divide-y divide-border/20">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            const meta = THEME_META[opt.value];
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 border border-primary/40'
                    : 'text-foreground hover:bg-primary/10 hover:text-primary'
                }`}
              >
                <div className="flex items-center gap-3 truncate min-w-0">
                  {meta && (
                    <div className="flex items-center gap-1.5 p-1 rounded-lg bg-black/20 border border-white/10 shrink-0">
                      <div className="flex items-center w-5 h-3.5 rounded-sm overflow-hidden border border-white/20 shadow-xs">
                        <span className="w-1/2 h-full" style={{ backgroundColor: meta.color1 }} />
                        <span className="w-1/2 h-full" style={{ backgroundColor: meta.color2 }} />
                      </div>
                      {meta.icon}
                    </div>
                  )}
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
