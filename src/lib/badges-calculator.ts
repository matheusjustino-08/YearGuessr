export interface BadgeDef {
  id: string;
  iconName: string;
  titleKey: string;
  descKey: string;
  colorCls: string;
}

export const ALL_BADGES: BadgeDef[] = [
  {
    id: 'historiador_primeira',
    iconName: 'Target',
    titleKey: 'badge_first_try_title',
    descKey: 'badge_first_try_desc',
    colorCls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  },
  {
    id: 'em_chamas',
    iconName: 'Flame',
    titleKey: 'badge_streak_7_title',
    descKey: 'badge_streak_7_desc',
    colorCls: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  },
  {
    id: 'mestre_precisao',
    iconName: 'Trophy',
    titleKey: 'badge_high_score_title',
    descKey: 'badge_high_score_desc',
    colorCls: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
  },
  {
    id: 'cineasta',
    iconName: 'Film',
    titleKey: 'badge_cinema_title',
    descKey: 'badge_cinema_desc',
    colorCls: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  },
  {
    id: 'veterano',
    iconName: 'Award',
    titleKey: 'badge_veteran_title',
    descKey: 'badge_veteran_desc',
    colorCls: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
  },
];

export function computeUserBadges(stats: {
  totalMatches: number;
  streak: number;
  hasFirstTryWin?: boolean;
  hasHighScore?: boolean;
  hasCinemaWin?: boolean;
}): string[] {
  const unlocked: string[] = [];

  if (stats.hasFirstTryWin) unlocked.push('historiador_primeira');
  if (stats.streak >= 7) unlocked.push('em_chamas');
  if (stats.hasHighScore) unlocked.push('mestre_precisao');
  if (stats.hasCinemaWin) unlocked.push('cineasta');
  if (stats.totalMatches >= 10) unlocked.push('veterano');

  return unlocked;
}
