'use client';

import { ALL_BADGES, computeUserBadges } from '@/lib/badges-calculator';
import { Target, Flame, Trophy, Film, Award, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';

const ICON_MAP: Record<string, any> = {
  Target,
  Flame,
  Trophy,
  Film,
  Award,
};

interface Props {
  stats: {
    totalMatches: number;
    streak: number;
    hasFirstTryWin?: boolean;
    hasHighScore?: boolean;
    hasCinemaWin?: boolean;
  };
}

export function BadgesGrid({ stats }: Props) {
  const tBadges = useTranslations('badges');
  const unlockedIds = computeUserBadges(stats);

  return (
    <div className="space-y-3 pt-2">
      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
        {tBadges('title')}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {ALL_BADGES.map((b) => {
          const isUnlocked = unlockedIds.includes(b.id);
          const IconComp = ICON_MAP[b.iconName] || Award;

          return (
            <div
              key={b.id}
              className={`p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                isUnlocked
                  ? `${b.colorCls} backdrop-blur-md shadow-xs`
                  : 'bg-muted/20 border-border/40 text-muted-foreground/50 opacity-60'
              }`}
            >
              <div
                className={`p-2 rounded-xl shrink-0 ${
                  isUnlocked ? 'bg-background/80 shadow-xs' : 'bg-muted/40'
                }`}
              >
                {isUnlocked ? (
                  <IconComp className="w-5 h-5" />
                ) : (
                  <Lock className="w-5 h-5 text-muted-foreground/40" />
                )}
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-xs font-bold truncate">
                  {tBadges(b.titleKey)}
                </p>
                <p className="text-[11px] leading-tight opacity-80 line-clamp-2">
                  {tBadges(b.descKey)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
