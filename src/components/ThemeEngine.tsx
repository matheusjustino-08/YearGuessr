'use client';

import { useGameStore } from '@/store/useGameStore';
import { useEffect, useRef, useState } from 'react';
import { FloatingEraElements } from './FloatingEraElements';

function getEraTheme(year: number) {
  if (year < 1500) return 'era-medieval';
  if (year < 1800) return 'era-renaissance';
  if (year < 1900) return 'era-industrial';
  if (year < 1950) return 'era-early20th';
  if (year < 1980) return 'era-golden';
  if (year < 2000) return 'era-retro';
  return 'era-modern';
}

const ERAS = [
  'era-medieval',
  'era-renaissance',
  'era-industrial',
  'era-early20th',
  'era-golden',
  'era-retro',
  'era-modern'
];

const ERA_BACKGROUND_CLASSES: Record<string, string> = {
  'era-medieval': 'bg-era-medieval',
  'era-renaissance': 'bg-era-renaissance',
  'era-industrial': 'bg-era-industrial',
  'era-early20th': 'bg-era-early20th',
  'era-golden': 'bg-era-golden',
  'era-retro': 'bg-era-retro',
  'era-modern': 'bg-era-modern',
};

export function ThemeEngine({ children }: { children: React.ReactNode }) {
  const currentYear = useGameStore((state) => state.currentYear);
  const themeOverride = useGameStore((state) => state.themeOverride);
  const colorMode = useGameStore((state) => state.colorMode);

  const [activeEra, setActiveEra] = useState<string>('era-modern');
  const previousEra = useRef<string>('era-modern');

  // Handle Era Themes
  useEffect(() => {
    const era = themeOverride && themeOverride !== 'auto' ? themeOverride : getEraTheme(currentYear);
    const root = document.documentElement;
    const body = document.body;
    
    ERAS.forEach(e => {
      root.classList.remove(e, ERA_BACKGROUND_CLASSES[e]);
      body?.classList.remove(ERA_BACKGROUND_CLASSES[e]);
    });

    root.classList.add(era, ERA_BACKGROUND_CLASSES[era]);
    body?.classList.add(ERA_BACKGROUND_CLASSES[era]);
    setActiveEra(era);
    previousEra.current = era;
  }, [currentYear, themeOverride]);

  // Handle Light / Dark / System Mode
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');

    if (colorMode === 'light') {
      root.classList.add('light');
    } else if (colorMode === 'dark') {
      root.classList.add('dark');
    } else {
      // System mode
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.add('light');
      }
    }
  }, [colorMode]);

  return (
    <>
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        {ERAS.map((era) => (
          <div
            key={era}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${ERA_BACKGROUND_CLASSES[era]} ${
              activeEra === era ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Floating Era Ambient Symbols */}
            <FloatingEraElements era={era} />

            {/* Retrowave FX for 80s */}
            {era === 'era-retro' && (
              <div className="retrowave-grid-wrapper">
                <div className="retrowave-sun" />
                <div className="retrowave-grid" />
                <div className="crt-scanlines z-10" />
              </div>
            )}

            {/* Silent Film CRT & Dust for 1900-1949 */}
            {era === 'era-early20th' && (
              <>
                <div className="crt-scanlines z-10 opacity-40" />
                <div className="dust-vignette z-10" />
              </>
            )}

            {/* Industrial Fog & Vignette */}
            {era === 'era-industrial' && (
              <>
                <div className="industrial-fog z-10" />
                <div className="dust-vignette z-10" />
              </>
            )}

            {/* Vintage Dust & Vignette FX for Ancient & Renaissance Eras */}
            {(era === 'era-medieval' || era === 'era-renaissance') && (
              <div className="dust-vignette z-10" />
            )}
          </div>
        ))}
      </div>
      {children}
    </>
  );
}
