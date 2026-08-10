'use client';

import { useState, useEffect, useMemo, use } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ChallengeViewer } from '@/components/ChallengeViewer';
import { Timeline } from '@/components/Timeline';
import { ResultScreen } from '@/components/ResultScreen';
import { useGameStore } from '@/store/useGameStore';
import { createClient } from '@/lib/supabase/client';
import { Users, Copy, Check, ArrowLeft, Radio, Crown, User as UserIcon } from 'lucide-react';

interface Props {
  params: Promise<{ code: string; locale: string }>;
}

interface PlayerPresence {
  user_id: string;
  username: string;
  score: number;
  isHost: boolean;
  joined_at: number;
}

export default function RoomPage({ params }: Props) {
  const resolvedParams = use(params);
  const roomCode = (resolvedParams?.code || 'SALAMULTI').toUpperCase();

  const supabase = useMemo(() => createClient(), []);
  const tRoom = useTranslations('room');
  const gameState = useGameStore((state) => state.gameState);
  const lastScore = useGameStore((state) => state.lastScore);
  const fetchDailyChallenge = useGameStore((state) => state.fetchDailyChallenge);

  const [copied, setCopied] = useState(false);
  const [realtimePlayers, setRealtimePlayers] = useState<PlayerPresence[]>([]);
  const [myPlayerId, setMyPlayerId] = useState<string>('');
  const [myUsername, setMyUsername] = useState<string>('');

  // 1. Initialize user & fetch challenge
  useEffect(() => {
    fetchDailyChallenge();

    let pid = '';
    if (typeof window !== 'undefined') {
      pid = localStorage.getItem('yearguessr_guest_id') || '';
      if (!pid) {
        pid = 'usr_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('yearguessr_guest_id', pid);
      }
    }
    setMyPlayerId(pid);

    async function resolveUsername() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('perfis')
            .select('username')
            .eq('id', user.id)
            .single();
          if (profile?.username) {
            setMyUsername(profile.username);
            return;
          }
        }
      } catch {
        // Fallback
      }
      setMyUsername(`Jogador ${pid.substring(4, 8)}`);
    }

    resolveUsername();
  }, [fetchDailyChallenge, supabase]);

  // 2. Supabase Realtime Presence Channel (Zero Mock Data!)
  useEffect(() => {
    if (!myPlayerId || !myUsername) return;

    const channel = supabase.channel(`room_${roomCode}`, {
      config: {
        presence: { key: myPlayerId },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const activeList: PlayerPresence[] = [];

        Object.values(state).forEach((presences: any) => {
          if (Array.isArray(presences) && presences.length > 0) {
            const p = presences[0] as PlayerPresence;
            if (p && p.user_id) {
              activeList.push(p);
            }
          }
        });

        // Sort by joined_at ascending so earliest player is Host
        activeList.sort((a, b) => a.joined_at - b.joined_at);
        if (activeList.length > 0) {
          activeList[0].isHost = true;
        }
        setRealtimePlayers(activeList);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: myPlayerId,
            username: myUsername,
            score: lastScore || 0,
            isHost: false,
            joined_at: Date.now(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, roomCode, myPlayerId, myUsername, lastScore]);

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
              <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center gap-1 font-mono text-[10px] font-bold uppercase">
                <Radio className="w-3 h-3 animate-pulse text-emerald-500" />
                <span>AO VIVO ({realtimePlayers.length} {realtimePlayers.length === 1 ? 'JOGADOR' : 'JOGADORES'})</span>
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

      {/* Room Lobby Realtime Participants Bar */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-center flex-wrap gap-2 py-1">
        {realtimePlayers.length === 0 ? (
          <div className="px-4 py-2 rounded-2xl bg-muted/40 text-muted-foreground font-mono text-xs font-bold animate-pulse">
            Conectando aos jogadores ao vivo...
          </div>
        ) : (
          realtimePlayers.map((p) => {
            const isMe = p.user_id === myPlayerId;
            return (
              <div
                key={p.user_id}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-mono backdrop-blur-md shadow-xs ${
                  p.isHost
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                    : isMe
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-card/70 border-border/50 text-foreground'
                }`}
              >
                {p.isHost ? (
                  <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                ) : (
                  <UserIcon className="w-3.5 h-3.5 shrink-0 opacity-70" />
                )}
                <span className="font-bold">
                  {p.username} {isMe && '(Você)'}
                </span>
                {p.score > 0 ? (
                  <span className="text-primary font-black ml-1">{p.score} pts</span>
                ) : (
                  <span className="text-[10px] text-muted-foreground uppercase font-bold px-1.5 py-0.5 rounded-full bg-muted/40">Conectado</span>
                )}
              </div>
            );
          })
        )}
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
