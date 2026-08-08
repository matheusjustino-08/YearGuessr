'use client';

import { useState, useEffect, use } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ChallengeViewer } from '@/components/ChallengeViewer';
import { Timeline } from '@/components/Timeline';
import { ResultScreen } from '@/components/ResultScreen';
import { useGameStore } from '@/store/useGameStore';
import { Users, Copy, Check, ArrowLeft, Trophy, Sparkles, Shield } from 'lucide-react';

interface Props {
  params: Promise<{ code: string; locale: string }>;
}

export default function RoomPage({ params }: Props) {
  const { code, locale } = use(params);
  const tGame = useTranslations('game');
  const tLb = useTranslations('leaderboard');
  const gameState = useGameStore((state) => state.gameState);
  const fetchDailyChallenge = useGameStore((state) => state.fetchDailyChallenge);

  const [copied, setCopied] = useState(false);
  const [participants, setParticipants] = useState<
    { name: string; score: number; isReady: boolean }[]
  >([
    { name: 'Você (Host)', score: 0, isReady: true },
    { name: 'Amigo #1', score: 4850, isReady: true },
    { name: 'Amigo #2', score: 4200, isReady: true },
  ]);

  useEffect(() => {
    fetchDailyChallenge();
  }, [fetchDailyChallenge]);

  const copyRoomLink = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 space-y-6 pb-12 w-full max-w-6xl mx-auto my-auto">
      {/* Room Top Header */}
      <div className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-card/80 border border-border/70 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <h1 className="text-sm font-black font-mono tracking-wider uppercase text-foreground">
                SALA MULTIPLAYER #{code.toUpperCase()}
              </h1>
            </div>
            <p className="text-[11px] text-muted-foreground font-mono">
              2 a 10 Jogadores ao Vivo
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={copyRoomLink}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary font-bold text-xs hover:bg-primary/20 transition-all cursor-pointer active:scale-95"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-500">Link Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Convidar Amigos</span>
            </>
          )}
        </button>
      </div>

      {/* Room Participants Bar */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-center gap-2 overflow-x-auto py-1">
        {participants.map((p, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/60 border border-border/50 text-xs font-mono shrink-0"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-foreground">{p.name}</span>
            {p.score > 0 && (
              <span className="text-primary font-black">{p.score} pts</span>
            )}
          </div>
        ))}
      </div>

      {/* Main Game Interface in Room */}
      <div className="w-full space-y-6">
        {gameState === 'playing' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch w-full">
            <ChallengeViewer />
            <Timeline />
          </div>
        ) : (
          <ResultScreen />
        )}
      </div>
    </main>
  );
}
