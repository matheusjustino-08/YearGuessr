'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Link } from '@/i18n/routing';
import { Trophy, ArrowLeft, User as UserIcon, Medal, Calendar, BarChart3 } from 'lucide-react';
import { TopLeaderboardAd } from '@/components/TopLeaderboardAd';
import { useTranslations } from 'next-intl';

type PeriodFilter = '24h' | '7d' | '30d' | '1y' | 'all';
type MetricFilter = 'average' | 'max';

interface MatchRecord {
  id: string;
  user_id: string | null;
  pontos: number;
  tempo_segundos: number;
  created_at: string;
  perfis: {
    username: string | null;
    avatar_url: string | null;
    e_anonimo: boolean | null;
  } | null;
}

interface RankedPlayer {
  key: string;
  user_id: string | null;
  username: string;
  avatar_url: string | null;
  isAnon: boolean;
  matchCount: number;
  avgScore: number;
  maxScore: number;
  bestTime: number;
}

export function LeaderboardViewer() {
  const supabase = useMemo(() => createClient(), []);
  const tLb = useTranslations('leaderboard');

  const [period, setPeriod] = useState<PeriodFilter>('all');
  const [metric, setMetric] = useState<MetricFilter>('average');
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboardMatches() {
      setLoading(true);
      try {
        let query = supabase
          .from('partidas')
          .select('*, perfis(username, avatar_url, e_anonimo)')
          .order('created_at', { ascending: false });

        if (period !== 'all') {
          const now = new Date();
          let startDate: Date;
          if (period === '24h') {
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          } else if (period === '7d') {
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          } else if (period === '30d') {
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          } else {
            // 1y
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          }
          query = query.gte('created_at', startDate.toISOString());
        }

        const { data } = await query.limit(500);
        setMatches((data as MatchRecord[]) || []);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboardMatches();
  }, [period, supabase]);

  // Aggregate and rank matches by user_id
  const rankedPlayers = useMemo(() => {
    if (!matches || matches.length === 0) return [];

    const playerMap = new Map<string, {
      user_id: string | null;
      username: string;
      avatar_url: string | null;
      isAnon: boolean;
      scores: number[];
      times: number[];
    }>();

    matches.forEach((m, idx) => {
      const isAnon = m.perfis?.e_anonimo === true || !m.perfis;
      const key = m.user_id ? m.user_id : `anon_${m.id || idx}`;
      const username = isAnon ? tLb('anonymous_player') : (m.perfis?.username || tLb('anonymous_player'));
      const avatar_url = !isAnon ? m.perfis?.avatar_url || null : null;

      if (!playerMap.has(key)) {
        playerMap.set(key, {
          user_id: m.user_id,
          username,
          avatar_url,
          isAnon,
          scores: [m.pontos || 0],
          times: [m.tempo_segundos || 30],
        });
      } else {
        const existing = playerMap.get(key)!;
        existing.scores.push(m.pontos || 0);
        existing.times.push(m.tempo_segundos || 30);
      }
    });

    const ranked: RankedPlayer[] = [];
    playerMap.forEach((val, key) => {
      const matchCount = val.scores.length;
      const totalScore = val.scores.reduce((a, b) => a + b, 0);
      const avgScore = Math.round(totalScore / matchCount);
      const maxScore = Math.max(...val.scores);
      const bestTime = Math.min(...val.times);

      ranked.push({
        key,
        user_id: val.user_id,
        username: val.username,
        avatar_url: val.avatar_url,
        isAnon: val.isAnon,
        matchCount,
        avgScore,
        maxScore,
        bestTime,
      });
    });

    // Sort players according to metric
    ranked.sort((a, b) => {
      if (metric === 'average') {
        if (b.avgScore !== a.avgScore) return b.avgScore - a.avgScore;
        if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
        return a.bestTime - b.bestTime;
      } else {
        if (b.maxScore !== a.maxScore) return b.maxScore - a.maxScore;
        return a.bestTime - b.bestTime;
      }
    });

    return ranked.slice(0, 20);
  }, [matches, metric, tLb]);

  return (
    <main className="flex-grow flex flex-col items-center justify-start p-3 sm:p-8 w-full">
      {/* Top Leaderboard 728x90 Ad Banner */}
      <TopLeaderboardAd />

      <div className="w-full max-w-4xl space-y-6 p-4 sm:p-8 rounded-3xl bg-card/70 border border-border/50 backdrop-blur-2xl shadow-2xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-black tracking-tight text-foreground font-serif">
                {tLb('title')}
              </h1>
            </div>
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-muted/60 hover:bg-muted border border-border/50 text-xs font-bold text-foreground transition-all active:scale-95 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{tLb('back_to_game')}</span>
          </Link>
        </div>

        {/* Filters Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3.5 rounded-2xl bg-muted/30 border border-border/50">
          {/* Timeframe Period Filter */}
          <div className="md:col-span-7 space-y-1.5">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3 text-primary" />
              {tLb('filter_period_label')}
            </label>
            <div className="flex flex-wrap gap-1">
              {[
                { id: '24h', label: tLb('period_24h') },
                { id: '7d', label: tLb('period_7d') },
                { id: '30d', label: tLb('period_30d') },
                { id: '1y', label: tLb('period_1y') },
                { id: 'all', label: tLb('period_all') },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPeriod(p.id as PeriodFilter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    period === p.id
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Metric Filter (Average vs Max) */}
          <div className="md:col-span-5 space-y-1.5 md:border-l md:border-border/40 md:pl-3">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <BarChart3 className="w-3 h-3 text-amber-500" />
              {tLb('filter_metric_label')}
            </label>
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setMetric('average')}
                className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                  metric === 'average'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60'
                }`}
              >
                {tLb('metric_average')}
              </button>
              <button
                type="button"
                onClick={() => setMetric('max')}
                className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                  metric === 'max'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60'
                }`}
              >
                {tLb('metric_max')}
              </button>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="overflow-x-auto rounded-2xl border border-border/50 bg-background/50 backdrop-blur-md">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/70 text-muted-foreground uppercase text-[11px] font-bold font-mono tracking-wider">
              <tr>
                <th className="px-3 sm:px-6 py-3.5">#</th>
                <th className="px-3 sm:px-6 py-3.5">{tLb('player')}</th>
                <th className="px-3 sm:px-6 py-3.5 text-right">
                  {metric === 'average' ? tLb('metric_average') : tLb('metric_max')}
                </th>
                <th className="px-3 sm:px-6 py-3.5 text-right">{tLb('time')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground font-mono text-xs animate-pulse">
                    Calculando ranking e médias...
                  </td>
                </tr>
              ) : rankedPlayers && rankedPlayers.length > 0 ? (
                rankedPlayers.map((player, index) => {
                  const displayScore = metric === 'average' ? player.avgScore : player.maxScore;
                  const suffixLabel = metric === 'average' ? tLb('avg_label') : tLb('max_label');

                  return (
                    <tr key={player.key} className="hover:bg-muted/40 transition-colors">
                      {/* Rank */}
                      <td className="px-3 sm:px-6 py-3.5 font-mono font-bold">
                        {index === 0 ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-500 border border-amber-500/30 text-xs font-black">#1</span>
                        ) : index === 1 ? (
                          <span className="px-2 py-0.5 rounded-md bg-slate-400/20 text-slate-300 border border-slate-400/30 text-xs font-black">#2</span>
                        ) : index === 2 ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-800/20 text-amber-600 border border-amber-700/30 text-xs font-black">#3</span>
                        ) : (
                          <span className="text-muted-foreground text-xs font-mono">#{index + 1}</span>
                        )}
                      </td>

                      {/* Player Avatar & Name */}
                      <td className="px-3 sm:px-6 py-3.5 font-medium min-w-0">
                        {player.isAnon ? (
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                              <UserIcon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground truncate max-w-[100px] sm:max-w-xs">{player.username}</p>
                              <p className="text-[10px] font-mono text-muted-foreground">
                                {player.matchCount} {player.matchCount === 1 ? tLb('match_singular') : tLb('matches_suffix')}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <Link href={`/perfil/${encodeURIComponent(player.username)}`} className="flex items-center gap-2.5 hover:underline group truncate">
                            {player.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={player.avatar_url} alt="avatar" className="w-7 h-7 rounded-full border border-border shrink-0 object-cover" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                                <UserIcon className="w-4 h-4" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground group-hover:text-primary transition-colors truncate max-w-[100px] sm:max-w-xs">{player.username}</p>
                              <p className="text-[10px] font-mono text-muted-foreground">
                                {player.matchCount} {player.matchCount === 1 ? tLb('match_singular') : tLb('matches_suffix')}
                              </p>
                            </div>
                          </Link>
                        )}
                      </td>

                      {/* Score */}
                      <td className="px-3 sm:px-6 py-3.5 text-right whitespace-nowrap">
                        <p className="font-mono font-black text-primary text-sm sm:text-base">{displayScore} pts</p>
                        <p className="text-[10px] font-mono text-muted-foreground uppercase">{suffixLabel}</p>
                      </td>

                      {/* Time */}
                      <td className="px-3 sm:px-6 py-3.5 text-right font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {player.bestTime}s
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Medal className="w-8 h-8 opacity-40 text-muted-foreground mb-1" />
                      <p className="font-medium text-sm">{tLb('empty_title')}</p>
                      <p className="text-xs opacity-75">{tLb('empty_desc')}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
