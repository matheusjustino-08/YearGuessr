'use client';

import { useState, useEffect, use } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ChallengeViewer } from '@/components/ChallengeViewer';
import { Timeline } from '@/components/Timeline';
import { ResultScreen } from '@/components/ResultScreen';
import { useGameStore } from '@/store/useGameStore';
import { Users, Copy, Check, ArrowLeft, Radio, Sparkles } from 'lucide-react';

interface Props {
  params: Promise<{ code: string; locale: string }>;
}

export default function RoomPage({ params }: Props) {
  const resolvedParams = use(params);
  const roomCode = (resolvedParams?.code || 'SALAMULTI').toUpperCase();

  const tRoom = useTranslations('room');
  const gameState = useGameStore((state) => state.gameState);
  const fetchDailyChallenge = useGameStore((state) => state.fetchDailyChallenge);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchDailyChallenge();
  }, [fetchDailyChallenge]);

  const copyRoomLink = () => {
    if (typeof window === 'undefined') return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(window.location.href);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const participants = [
    { id: 1, name: tRoom('host_label'), score: 0, isReady: true, isHost: true },
    { id: 2, name: tRoom('friend_label', { number: 1 }), score: 4850, isReady: true, isHost: false },
    { id: 3, name: tRoom('friend_label', { number: 2 }), score: 4200, isReady: true, isHost: false },
  ];

  return (
    <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 space-y-6 pb-12 w-full max-w-6xl mx-auto my-auto">
      {/* Room Top Header Banner */}
      <div className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-card/90 border border-border/70 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2.5 rounded-2xl bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <div className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center gap-1 font-mono text-[10px] font-bold uppercase">
                <Radio className="w-3 h-3 animate-pulse text-amber-500" />
                <span>AO VIVO</span>
              </div>
              <h1 className="text-base sm:text-lg font-black font-mono tracking-wider uppercase text-foreground">
                {tRoom('title', { code: roomCode })}
              </h1>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              {tRoom('subtitle')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={copyRoomLink}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-primary/10 border border-primary/30 text-primary font-bold text-xs hover:bg-primary/20 transition-all cursor-pointer active:scale-95 font-mono shadow-xs"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-500">{tRoom('copied_link')}</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>{tRoom('copy_link')}</span>
            </>
          )}
        </button>
      </div>

      {/* Room Lobby Participants Bar */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-center flex-wrap gap-2 py-1">
        {participants.map((p) => (
          <div
            key={p.id}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-mono backdrop-blur-md shadow-xs ${
              p.isHost
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                : 'bg-card/70 border-border/50 text-foreground'
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold">{p.name}</span>
            {p.score > 0 ? (
              <span className="text-primary font-black ml-1">{p.score} pts</span>
            ) : (
              <span className="text-[10px] text-muted-foreground uppercase font-bold px-1.5 py-0.5 rounded-full bg-muted/40">Pronto</span>
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
