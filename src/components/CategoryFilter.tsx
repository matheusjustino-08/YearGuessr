'use client';

import { useGameStore } from '@/store/useGameStore';
import { 
  Sparkles, 
  Swords, 
  Atom, 
  Palette, 
  Film, 
  Trophy, 
  Landmark,
  Gauge
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { useCategories } from '@/app/[locale]/admin/_sections/useCategories';

const ICON_MAP: Record<string, any> = {
  all: Sparkles,
  guerra: Swords,
  ciencia: Atom,
  arte: Palette,
  cinema: Film,
  esportes: Trophy,
  politica: Landmark,
};

const DIFFICULTIES = [
  { id: 'all', label: 'all', color: 'bg-primary' },
  { id: 'facil', label: 'facil', color: 'bg-emerald-500' },
  { id: 'normal', label: 'normal', color: 'bg-amber-500' },
  { id: 'dificil', label: 'dificil', color: 'bg-rose-500' },
];

function stripEmojis(str: string): string {
  if (!str) return '';
  return str.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E6}-\u{1F1FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]/gu, '').trim();
}

export function CategoryFilter() {
  const supabase = createClient();
  const { categories: fetchedCategories } = useCategories(supabase);

  const selectedCategory = useGameStore((state) => state.selectedCategory);
  const setSelectedCategory = useGameStore((state) => state.setSelectedCategory);
  const selectedDifficulty = useGameStore((state) => state.selectedDifficulty);
  const setSelectedDifficulty = useGameStore((state) => state.setSelectedDifficulty);
  const tCat = useTranslations('categories');
  const tDiff = useTranslations('difficulty');

  // Prepend "all" category
  const categoriesList = [
    { id: 'all', label: tCat('all') },
    ...fetchedCategories,
  ];

  const getCategoryLabel = (cat: { id: string; label: string }) => {
    if (cat.id === 'all') return tCat('all');
    try {
      if (tCat.has(cat.id)) return tCat(cat.id);
    } catch {
      // Fallback if key missing
    }
    return stripEmojis(cat.label || cat.id);
  };

  return (
    <div className="w-full space-y-2 max-w-4xl mx-auto px-2 sm:px-4">
      {/* Category Pills */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 py-1">
        {categoriesList.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const DefaultIcon = ICON_MAP[cat.id] || Sparkles;
          const label = getCategoryLabel(cat);

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 shrink-0 cursor-pointer active:scale-95 shadow-xs ${
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 ring-2 ring-primary/40'
                  : 'bg-card/80 hover:bg-card text-foreground/80 hover:text-foreground border border-border/70 backdrop-blur-md'
              }`}
            >
              {(cat as any).icon_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={(cat as any).icon_url} alt="" className="w-3.5 h-3.5 object-contain" />
              ) : (
                <DefaultIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-primary-foreground' : 'text-primary'}`} />
              )}
              <span className="whitespace-nowrap">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Difficulty Pills */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 py-1">
        <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase font-mono mr-1">
          <Gauge className="w-3.5 h-3.5" />
          {tDiff('label')}:
        </div>
        {DIFFICULTIES.map((diff) => {
          const isSelected = selectedDifficulty === diff.id;
          return (
            <button
              key={diff.id}
              type="button"
              onClick={() => setSelectedDifficulty(diff.id)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 shrink-0 cursor-pointer active:scale-95 ${
                isSelected
                  ? 'bg-foreground text-background shadow-md ring-2 ring-foreground/30'
                  : 'bg-card/80 hover:bg-card border border-border/70 text-foreground/80 hover:text-foreground backdrop-blur-md'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${diff.color}`} />
              <span className="whitespace-nowrap">{tDiff(diff.id)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
