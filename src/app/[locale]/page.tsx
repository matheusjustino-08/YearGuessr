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
import { OnboardingModal } from '@/components/OnboardingModal';
import { ChronologicalGame } from '@/components/ChronologicalGame';
import { Swords } from 'lucide-react';

export default function HomePage() {
  const t = useTranslations('game');
  const activeLocale = useLocale() as 'pt' | 'en' | 'es';
  const gameState = useGameStore((state) => state.gameState);
  const gameMode = useGameStore((state) => state.gameMode);
  const setGameMode = useGameStore((state) => state.setGameMode);
  const fetchDailyChallenge = useGameStore((state) => state.fetchDailyChallenge);
  
  const loadSpecificChallenge = useGameStore((state) => state.loadSpecificChallenge);
  const setDuelTargetScore = useGameStore((state) => state.setDuelTargetScore);
  const duelTargetScore = useGameStore((state) => state.duelTargetScore);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const challengeId = params.get('challenge');
      const refScore = params.get('ref');
      if (challengeId) {
        if (refScore) setDuelTargetScore(parseInt(refScore, 10));
        loadSpecificChallenge(challengeId);
        return;
      }
    }
    fetchDailyChallenge();
  }, [fetchDailyChallenge, loadSpecificChallenge, setDuelTargetScore]);

  const currentChallenge = useGameStore((state) => state.currentChallenge);
  const content = currentChallenge?.conteudo_i18n?.[activeLocale] || currentChallenge?.conteudo_i18n?.pt || currentChallenge?.conteudo_i18n?.en;

  return (
    <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 space-y-6 pb-12 w-full max-w-6xl mx-auto my-auto">
      <OnboardingModal />
      {/* Main Game Container */}
      <div className="w-full space-y-6">

        {/* Duel Active Banner */}
        {duelTargetScore !== null && (
          <div className="max-w-2xl mx-auto p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-center text-xs font-bold font-mono flex items-center justify-center gap-2">
            <Swords className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{t('duel_notice', { score: duelTargetScore })}</span>
          </div>
        )}
        
        {/* Game Mode Switcher (Daily Challenge vs Practice Mode vs Time Attack) */}
        <div className="flex items-center justify-center pt-2">
          <div className="flex items-center gap-1 p-1 rounded-full bg-card/80 border border-border/60 backdrop-blur-md shadow-xs">
            <button
              type="button"
              onClick={() => setGameMode('daily')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
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
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                gameMode === 'practice'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('practice_mode')}
            </button>
            <button
              type="button"
              onClick={() => setGameMode('timeattack')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                gameMode === 'timeattack'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('timeattack_mode')}
            </button>
            <button
              type="button"
              onClick={() => setGameMode('chronological')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                gameMode === 'chronological'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('chronological_mode')}
            </button>
          </div>
        </div>

        {gameMode === 'chronological' ? (
          <ChronologicalGame />
        ) : gameState === 'playing' ? (
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
