import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Trophy, ArrowLeft, User as UserIcon, Medal } from 'lucide-react';
import { TopLeaderboardAd } from '@/components/TopLeaderboardAd';

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const tNav = await getTranslations('nav');
  const tResult = await getTranslations('result');
  const tLb = await getTranslations('leaderboard');
  
  // Fetch top scores and deduplicate by user so each player only appears once
  const { data: allMatches } = await supabase
    .from('partidas')
    .select('*, perfis(username, avatar_url, e_anonimo)')
    .order('pontos', { ascending: false })
    .order('tempo_segundos', { ascending: true })
    .limit(100);

  // Keep only best score per user_id (first occurrence is best due to ordering)
  const seenUsers = new Set<string>();
  const topMatches = (allMatches || []).filter((match: any) => {
    const key = match.user_id || match.id; // anonymous matches have no user_id
    if (!match.user_id) return true; // keep all anon results (they have unique ids)
    if (seenUsers.has(key)) return false;
    seenUsers.add(key);
    return true;
  }).slice(0, 10);

  return (
    <main className="flex-grow flex flex-col items-center justify-start p-3 sm:p-8 w-full">
      {/* Top Leaderboard 728x90 Ad Banner */}
      <TopLeaderboardAd />

      <div className="w-full max-w-3xl space-y-6 p-4 sm:p-8 rounded-3xl bg-card/70 border border-border/50 backdrop-blur-2xl shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <Trophy className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-foreground font-serif">
              {tLb('title')}
            </h1>
          </div>
          <Link 
            href="/" 
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-muted/60 hover:bg-muted border border-border/50 text-xs font-bold text-foreground transition-all active:scale-95 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden xs:inline">{tLb('back_to_game')}</span>
          </Link>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border/50 bg-background/50 backdrop-blur-md">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/70 text-muted-foreground uppercase text-[11px] font-bold font-mono tracking-wider">
              <tr>
                <th className="px-3 sm:px-6 py-3.5">#</th>
                <th className="px-3 sm:px-6 py-3.5">{tLb('player')}</th>
                <th className="px-3 sm:px-6 py-3.5 text-right">{tResult('total_score')}</th>
                <th className="px-3 sm:px-6 py-3.5 text-right">{tLb('time')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {topMatches && topMatches.length > 0 ? (
                topMatches.map((match: any, index: number) => {
                  const isAnon = match.perfis?.e_anonimo === true || !match.perfis;
                  const playerName = isAnon ? tLb('anonymous_player') : (match.perfis?.username || tLb('anonymous_player'));
                  const avatarUrl = !isAnon ? match.perfis?.avatar_url : null;

                  return (
                    <tr key={match.id} className="hover:bg-muted/40 transition-colors">
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
                      <td className="px-3 sm:px-6 py-3.5 font-medium flex items-center space-x-2.5 min-w-0">
                        {isAnon ? (
                          <>
                            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                              <UserIcon className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-foreground truncate max-w-[100px] sm:max-w-xs">{playerName}</span>
                          </>
                        ) : (
                          <Link href={`/perfil/${encodeURIComponent(match.perfis?.username || '')}`} className="flex items-center gap-2.5 hover:underline truncate">
                            {avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={avatarUrl} alt="avatar" className="w-7 h-7 rounded-full border border-border shrink-0" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                                <UserIcon className="w-4 h-4" />
                              </div>
                            )}
                            <span className="font-semibold text-foreground truncate max-w-[100px] sm:max-w-xs">{playerName}</span>
                          </Link>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-3.5 text-right font-mono font-black text-primary text-sm sm:text-base whitespace-nowrap">
                        {match.pontos} pts
                      </td>
                      <td className="px-3 sm:px-6 py-3.5 text-right font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {match.tempo_segundos}s
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
