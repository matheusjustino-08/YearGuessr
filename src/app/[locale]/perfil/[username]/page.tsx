import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { User as UserIcon, ArrowLeft, Flame, Trophy, Calendar, Target } from 'lucide-react';
import { notFound } from 'next/navigation';
import { updateAndFetchUserStreak } from '@/lib/streak-calculator';
import { BadgesGrid } from '@/components/BadgesGrid';

export async function generateMetadata({ params }: { params: Promise<{ username: string; locale: string }> }) {
  const { username, locale } = await params;
  const decodedUsername = decodeURIComponent(username);
  const tSettings = await getTranslations({ locale, namespace: 'settings' });

  return {
    title: `${decodedUsername} — YearGuessr Profile`,
    description: tSettings('profile_subtitle', { username: decodedUsername }),
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string; locale: string }>;
}) {
  const { username, locale } = await params;
  const decodedUsername = decodeURIComponent(username);
  const supabase = await createClient();
  const tLb = await getTranslations('leaderboard');
  const tSettings = await getTranslations('settings');
  const tResult = await getTranslations('result');

  // Fetch user profile by username
  const { data: profile } = await supabase
    .from('perfis')
    .select('*')
    .eq('username', decodedUsername)
    .single();

  if (!profile) {
    notFound();
  }

  // Recalculate streak dynamically from match history
  const streaks = await updateAndFetchUserStreak(supabase, profile.id);

  // Fetch user matches (fetching up to 100 for proper stats and badge calculations)
  const { data: matches } = await supabase
    .from('partidas')
    .select('*, desafios(ano_correto, categorias)')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(100);

  const totalMatches = matches?.length || 0;
  const avgScore = totalMatches > 0 ? Math.round((matches || []).reduce((sum, m) => sum + (m.pontos || 0), 0) / totalMatches) : 0;

  return (
    <main className="flex-grow flex flex-col items-center justify-start p-4 sm:p-8 w-full max-w-4xl mx-auto space-y-6">
      {/* Header Back Link */}
      <div className="w-full flex items-center justify-between">
        <Link
          href="/leaderboard"
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-card/80 hover:bg-card border border-border/60 text-xs font-bold text-foreground transition-all active:scale-95 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{tLb('back_to_game')}</span>
        </Link>
      </div>

      {/* User Card */}
      <div className="w-full p-6 sm:p-8 rounded-3xl bg-card/80 border border-border/60 backdrop-blur-2xl shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          {profile.avatar_url && !profile.e_anonimo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="w-20 h-20 rounded-full border-2 border-primary object-cover shadow-md"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary">
              <UserIcon className="w-10 h-10" />
            </div>
          )}

          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-sans font-black tracking-tight text-foreground flex items-center gap-2">
              {profile.e_anonimo ? tLb('anonymous_player') : profile.username}
            </h1>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              {profile.role === 'admin' ? tSettings('role_admin') : tSettings('role_player')}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-background/60 border border-border/50 text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-amber-500">
              <Flame className="w-4 h-4" />
              <span className="text-[10px] font-mono font-bold uppercase">{tSettings('current_streak')}</span>
            </div>
            <p className="text-2xl font-black font-mono text-foreground">
              {streaks.streak_atual} <span className="text-xs font-normal text-muted-foreground">{streaks.streak_atual === 1 ? tSettings('day_singular') : tSettings('days')}</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-background/60 border border-border/50 text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-amber-600">
              <Trophy className="w-4 h-4" />
              <span className="text-[10px] font-mono font-bold uppercase">{tSettings('best_streak')}</span>
            </div>
            <p className="text-2xl font-black font-mono text-foreground">
              {streaks.maior_streak} <span className="text-xs font-normal text-muted-foreground">{streaks.maior_streak === 1 ? tSettings('day_singular') : tSettings('days')}</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-background/60 border border-border/50 text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-primary">
              <Target className="w-4 h-4" />
              <span className="text-[10px] font-mono font-bold uppercase">{tSettings('matches_label')}</span>
            </div>
            <p className="text-2xl font-black font-mono text-foreground">{totalMatches}</p>
          </div>

          <div className="p-4 rounded-2xl bg-background/60 border border-border/50 text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-emerald-500">
              <Trophy className="w-4 h-4" />
              <span className="text-[10px] font-mono font-bold uppercase">{tSettings('avg_score_label')}</span>
            </div>
            <p className="text-2xl font-black font-mono text-emerald-500">{avgScore} pts</p>
          </div>
        </div>

        {/* Badges Grid */}
        <BadgesGrid
          stats={{
            totalMatches,
            streak: streaks.streak_atual,
            hasFirstTryWin: matches?.some(m => m.tentativas === 1 && m.acertou),
            hasHighScore: matches?.some(m => m.pontos >= 4900),
            hasCinemaWin: matches?.some(m => (m.desafios as any)?.categorias?.includes('cinema')),
          }}
        />

        {/* Recent Matches */}
        <div className="space-y-3 pt-2">
          <h2 className="text-sm font-bold uppercase font-mono tracking-wider text-muted-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            {tSettings('recent_history_label')}
          </h2>

          <div className="overflow-x-auto rounded-2xl border border-border/50 bg-background/40">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 text-muted-foreground font-mono uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-2.5">Data</th>
                  <th className="px-4 py-2.5">Ano Correto</th>
                  <th className="px-4 py-2.5 text-right">{tResult('total_score')}</th>
                  <th className="px-4 py-2.5 text-right">{tLb('time')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 font-mono">
                {matches && matches.length > 0 ? (
                  matches.slice(0, 10).map((m) => (
                    <tr key={m.id} className="hover:bg-muted/20">
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {new Date(m.created_at).toLocaleDateString(locale)}
                      </td>
                      <td className="px-4 py-2.5 font-bold text-foreground">
                        {m.desafios?.ano_correto || '-'}
                      </td>
                      <td className="px-4 py-2.5 text-right font-black text-primary">
                        {m.pontos} pts
                      </td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">
                        {m.tempo_segundos}s
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                      {tSettings('no_recent_matches')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
