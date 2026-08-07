'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Timeline } from '@/components/Timeline';
import { ResultScreen } from '@/components/ResultScreen';
import { ChallengeViewer } from '@/components/ChallengeViewer';
import { useGameStore } from '@/store/useGameStore';
import { useEffect } from 'react';
 
import { CategoryFilter } from '@/components/CategoryFilter';
import { SideBanners } from '@/components/SideBanners';

export default function HomePage() {
  const t = useTranslations('game');
  const activeLocale = useLocale() as 'pt' | 'en' | 'es';
  const gameState = useGameStore((state) => state.gameState);
  const gameMode = useGameStore((state) => state.gameMode);
  const setGameMode = useGameStore((state) => state.setGameMode);
  const fetchDailyChallenge = useGameStore((state) => state.fetchDailyChallenge);
  
  useEffect(() => {
    fetchDailyChallenge();
  }, [fetchDailyChallenge]);

  const currentChallenge = useGameStore((state) => state.currentChallenge);
  const content = currentChallenge?.conteudo_i18n?.[activeLocale] || currentChallenge?.conteudo_i18n?.pt || currentChallenge?.conteudo_i18n?.en;

  return (
    <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 space-y-6 pb-12 w-full max-w-6xl mx-auto my-auto">
      {/* Main Game Container */}
      <div className="w-full space-y-6">
        
        {/* Game Mode Switcher (Daily Challenge vs Practice Mode) */}
        <div className="flex items-center justify-center pt-2">
          <div className="flex items-center gap-1 p-1 rounded-full bg-card/80 border border-border/60 backdrop-blur-md shadow-xs">
            <button
              type="button"
              onClick={() => setGameMode('daily')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                gameMode === 'daily'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('daily_mode')}
            </button>
            <button
              type="button"
              onClick={() => setGameMode('practice')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                gameMode === 'practice'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('practice_mode')}
            </button>
          </div>
        </div>

        {gameState === 'playing' ? (
          <div className="space-y-6">
            {/* Category Filter ONLY in Practice Mode */}
            {gameMode === 'practice' && <CategoryFilter />}

            {/* Event Title Centralized Above Both Columns with Generous Padding */}
            {content?.titulo && (
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-center tracking-tight text-foreground leading-tight px-4 py-2 max-w-3xl mx-auto drop-shadow-xs">
                {content.titulo}
              </h2>
            )}

            {/* Desktop Side-by-Side (2 Columns Aligned Perfectly) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch w-full">
              <ChallengeViewer />
              <Timeline />
            </div>

            {/* Small Ad Letreiros (300x50px) at the Bottom */}
            <SideBanners />
          </div>
        ) : (
          <div className="space-y-6">
            <ResultScreen />
            <SideBanners />
          </div>
        )}
      </div>
    </main>
  );
}
