'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AdminAccordionProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  badge?: string;
}

export function AdminAccordion({
  title,
  description,
  icon,
  defaultOpen = false,
  children,
  badge,
}: AdminAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-border/50 bg-background overflow-hidden shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between gap-4 px-5 py-4 text-left transition-colors cursor-pointer ${
          open ? 'bg-primary/5 border-b border-border/40' : 'hover:bg-muted/40'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
            open
              ? 'bg-primary/15 border-primary/30 text-primary'
              : 'bg-muted/60 border-border/50 text-muted-foreground'
          }`}>
            {icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-sm font-semibold transition-colors ${open ? 'text-foreground' : 'text-foreground/80'}`}>
                {title}
              </span>
              {badge && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {badge}
                </span>
              )}
            </div>
            {description && (
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{description}</p>
            )}
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-all duration-300 ${
            open ? 'rotate-180 text-primary' : 'text-muted-foreground/60'
          }`}
        />
      </button>

      {/* Content */}
      {open && (
        <div className="px-5 py-5 bg-background">
          {children}
        </div>
      )}
    </div>
  );
}
