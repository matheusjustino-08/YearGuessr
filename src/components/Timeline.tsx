'use client';

import { useGameStore } from '@/store/useGameStore';
import { useTranslations } from 'next-intl';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { Calendar, CheckCircle2, Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

function getEraKey(year: number) {
  if (year < 1500) return 'medieval';
  if (year < 1800) return 'renaissance';
  if (year < 1900) return 'industrial';
  if (year < 1950) return 'early20th';
  if (year < 1980) return 'golden';
  if (year < 2000) return 'retro';
  return 'modern';
}

export function Timeline() {
  const currentYear = useGameStore((state) => state.currentYear);
  const setCurrentYear = useGameStore((state) => state.setCurrentYear);
  const submitGuess = useGameStore((state) => state.submitGuess);
  const currentChallenge = useGameStore((state) => state.currentChallenge);
  const tGame = useTranslations('game');
  const tEras = useTranslations('eras');
  const { playTick } = useAudioEngine();

  const minYear = currentChallenge?.minYear || 1000;
  const maxYear = currentChallenge?.maxYear || 2026;
  const eraKey = getEraKey(currentYear);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentYear(parseInt(e.target.value));
    playTick();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(5);
    }
  };

  const adjustYear = (delta: number) => {
    const newYear = Math.max(minYear, Math.min(maxYear, currentYear + delta));
    setCurrentYear(newYear);
    playTick();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const handleGuess = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
    submitGuess();
  };

  return (
    <div className="w-full space-y-6 p-6 sm:p-8 rounded-3xl bg-card/90 border border-border/60 backdrop-blur-xl shadow-2xl transition-all duration-500 flex flex-col justify-between">
      
      {/* Top Era Badge & Animated Year Counter */}
      <div className="flex flex-col items-center justify-center space-y-3 pt-2">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest shadow-xs">
          <Calendar className="w-3.5 h-3.5" />
          <span>{tEras(eraKey)}</span>
        </div>
        
        {/* Main Displayed Year */}
        <div className="text-6xl sm:text-7xl font-black font-mono tracking-tighter text-foreground drop-shadow-md select-none py-1">
          {currentYear}
        </div>

        {/* Quick Fine-Tuning Step Buttons (-10, -1, +1, +10) */}
        <div className="flex items-center gap-1.5 sm:gap-2 pt-1">
          <button
            type="button"
            onClick={() => adjustYear(-10)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-muted/60 hover:bg-primary/20 hover:text-primary border border-border/50 text-xs font-bold font-mono transition-all active:scale-95 cursor-pointer"
            title={tGame('decrease_10')}
          >
            -10
          </button>
          <button
            type="button"
            onClick={() => adjustYear(-1)}
            className="p-2 rounded-xl bg-muted/60 hover:bg-primary/20 hover:text-primary border border-border/50 transition-all active:scale-95 cursor-pointer"
            title={tGame('decrease_1')}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-[10px] uppercase font-mono text-muted-foreground px-1 sm:px-2 whitespace-nowrap">{tGame('fine_tune')}</span>

          <button
            type="button"
            onClick={() => adjustYear(1)}
            className="p-2 rounded-xl bg-muted/60 hover:bg-primary/20 hover:text-primary border border-border/50 transition-all active:scale-95 cursor-pointer"
            title={tGame('increase_1')}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => adjustYear(10)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-muted/60 hover:bg-primary/20 hover:text-primary border border-border/50 text-xs font-bold font-mono transition-all active:scale-95 cursor-pointer"
            title={tGame('increase_10')}
          >
            +10
          </button>
        </div>
      </div>

      {/* Custom Styled Slider Bar with Padded Capsule Track */}
      <div className="space-y-2">
        <div className="relative p-2.5 bg-muted/40 border border-border/50 rounded-2xl">
          <input
            type="range"
            min={minYear}
            max={maxYear}
            value={currentYear}
            onChange={handleSliderChange}
            className="w-full h-3 bg-muted/80 rounded-full appearance-none cursor-pointer accent-primary hover:accent-primary/90 transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-inner"
          />
        </div>

        <div className="flex justify-between text-xs text-muted-foreground font-mono font-bold tracking-widest px-1">
          <span className="bg-muted/60 px-2.5 py-1 rounded-lg border border-border/40">{minYear}</span>
          <span className="bg-muted/60 px-2.5 py-1 rounded-lg border border-border/40">{maxYear}</span>
        </div>
      </div>

      {/* Primary Confirm Guess Button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={handleGuess}
          className="w-full flex items-center justify-center gap-2.5 px-8 py-4 bg-primary text-primary-foreground font-black tracking-wide rounded-2xl hover:bg-primary/90 transition-all shadow-xl hover:shadow-2xl active:scale-95 uppercase text-sm cursor-pointer"
        >
          <CheckCircle2 className="w-5 h-5" />
          {tGame('guess_button', { year: currentYear })}
        </button>
      </div>
    </div>
  );
}
