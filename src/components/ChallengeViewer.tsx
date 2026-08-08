'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useLocale, useTranslations } from 'next-intl';
import { 
  Lightbulb, 
  Sparkles, 
  Shield, 
  Compass, 
  Cog, 
  Camera, 
  Disc, 
  Zap, 
  Cpu 
} from 'lucide-react';

function getEraKey(year: number, themeOverride?: string): string {
  if (themeOverride && themeOverride !== 'auto') return themeOverride;
  if (year < 1500) return 'era-medieval';
  if (year < 1800) return 'era-renaissance';
  if (year < 1900) return 'era-industrial';
  if (year < 1950) return 'era-early20th';
  if (year < 1980) return 'era-golden';
  if (year < 2000) return 'era-retro';
  return 'era-modern';
}

export function ChallengeViewer() {
  const currentChallenge = useGameStore((state) => state.currentChallenge);
  const currentYear = useGameStore((state) => state.currentYear);
  const themeOverride = useGameStore((state) => state.themeOverride);
  const [imageError, setImageError] = useState(false);
  
  const locale = useLocale() as 'en' | 'pt' | 'es';
  const tGame = useTranslations('game');
  const tEras = useTranslations('eras');

  if (!currentChallenge) {
    return (
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center h-80 rounded-3xl bg-card/40 border border-border/40 backdrop-blur-md p-6 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Camera className="w-6 h-6 text-primary" />
        </div>
        <p className="text-foreground font-bold text-base">{tGame('no_challenges_title')}</p>
        <p className="text-muted-foreground text-xs max-w-xs">{tGame('no_challenges_desc')}</p>
      </div>
    );
  }

  const content = currentChallenge.conteudo_i18n[locale] || currentChallenge.conteudo_i18n.en || currentChallenge.conteudo_i18n.pt;
  const activeEra = getEraKey(currentYear, themeOverride);

  // Era-specific custom card styling configuration (light & dark mode compliant)
  const getEraCardConfig = () => {
    switch (activeEra) {
      case 'era-medieval':
        return {
          frameClass: 'bg-card/90 border-2 border-amber-600/80 shadow-[0_0_40px_rgba(217,119,6,0.2)] rounded-2xl p-4 ring-1 ring-amber-500/30 hover:border-amber-500 hover:shadow-[0_0_60px_rgba(217,119,6,0.4)]',
          badgeClass: 'bg-amber-500/10 border-amber-600/60 text-amber-700 dark:text-amber-300',
          icon: <Shield className="w-4 h-4 text-amber-500" />,
          label: tEras('medieval'),
          filmHoles: false,
          ornament: true,
        };
      case 'era-renaissance':
        return {
          frameClass: 'bg-card/90 border-2 border-yellow-600/70 shadow-[0_0_40px_rgba(234,179,8,0.2)] rounded-3xl p-4 ring-2 ring-yellow-400/30 hover:ring-yellow-400/60 hover:shadow-[0_0_60px_rgba(234,179,8,0.4)]',
          badgeClass: 'bg-yellow-500/10 border-yellow-600/60 text-yellow-700 dark:text-yellow-300',
          icon: <Compass className="w-4 h-4 text-yellow-500" />,
          label: tEras('renaissance'),
          filmHoles: false,
          ornament: false,
        };
      case 'era-industrial':
        return {
          frameClass: 'bg-card/90 border-2 border-zinc-500/70 shadow-[0_0_40px_rgba(148,163,184,0.2)] rounded-xl p-4 ring-1 ring-zinc-400/30 hover:border-zinc-400 hover:shadow-[0_0_60px_rgba(148,163,184,0.4)]',
          badgeClass: 'bg-zinc-500/10 border-zinc-500/60 text-zinc-700 dark:text-zinc-300',
          icon: <Cog className="w-4 h-4 text-zinc-500" />,
          label: tEras('industrial'),
          filmHoles: false,
          ornament: false,
        };
      case 'era-early20th':
        return {
          frameClass: 'bg-card/95 border-4 border-stone-600/80 shadow-[0_0_40px_rgba(168,162,158,0.2)] rounded-lg p-5 hover:border-stone-500 hover:shadow-[0_0_60px_rgba(168,162,158,0.4)]',
          badgeClass: 'bg-stone-500/10 border-stone-500/60 text-stone-700 dark:text-stone-300',
          icon: <Camera className="w-4 h-4 text-stone-500" />,
          label: tEras('early20th'),
          filmHoles: true, // Side film strip perforations
          ornament: false,
        };
      case 'era-golden':
        return {
          frameClass: 'bg-card/90 border-2 border-amber-400/80 shadow-[0_0_40px_rgba(245,158,11,0.25)] rounded-3xl p-4 ring-2 ring-amber-400/30 hover:ring-amber-300 hover:shadow-[0_0_65px_rgba(245,158,11,0.5)]',
          badgeClass: 'bg-amber-500/10 border-amber-400/60 text-amber-700 dark:text-amber-200',
          icon: <Disc className="w-4 h-4 text-amber-500" />,
          label: tEras('golden'),
          filmHoles: false,
          ornament: false,
        };
      case 'era-retro':
        return {
          frameClass: 'bg-card/90 border-2 border-pink-500 shadow-[0_0_50px_rgba(236,72,153,0.3)] rounded-2xl p-4 ring-2 ring-cyan-400 hover:shadow-[0_0_80px_rgba(34,211,238,0.5)] hover:border-cyan-400',
          badgeClass: 'bg-pink-500/10 border-pink-400 text-pink-600 dark:text-cyan-300 font-bold',
          icon: <Zap className="w-4 h-4 text-pink-500 dark:text-cyan-300" />,
          label: tEras('retro'),
          filmHoles: false,
          ornament: false,
        };
      case 'era-modern':
      default:
        return {
          frameClass: 'bg-card/90 border border-sky-400/70 shadow-[0_0_40px_rgba(56,189,248,0.25)] rounded-3xl p-4 backdrop-blur-2xl ring-1 ring-sky-400/30 hover:ring-sky-300 hover:shadow-[0_0_70px_rgba(56,189,248,0.45)]',
          badgeClass: 'bg-sky-500/10 border-sky-400/60 text-sky-700 dark:text-sky-200',
          icon: <Cpu className="w-4 h-4 text-sky-500 dark:text-sky-400" />,
          label: tEras('modern'),
          filmHoles: false,
          ornament: false,
        };
    }
  };

  const eraConfig = getEraCardConfig();

  return (
    <div className="w-full space-y-4">
      {/* Era-Themed Photo Showcase Card */}
      <div 
        className={`relative transition-all duration-500 ease-out w-full group ${eraConfig.frameClass}`}
      >
        {/* Vintage Film Strip Holes (Only for Early 20th Century Era) */}
        {eraConfig.filmHoles && (
          <>
            <div className="absolute top-0 bottom-0 left-1.5 w-2 flex flex-col justify-between py-3 pointer-events-none opacity-60">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-2 h-3 rounded-xs bg-stone-950 border border-stone-700" />
              ))}
            </div>
            <div className="absolute top-0 bottom-0 right-1.5 w-2 flex flex-col justify-between py-3 pointer-events-none opacity-60">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-2 h-3 rounded-xs bg-stone-950 border border-stone-700" />
              ))}
            </div>
          </>
        )}

        {/* Medieval Carved Corners */}
        {eraConfig.ornament && (
          <>
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-amber-500/80 pointer-events-none" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-amber-500/80 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-amber-500/80 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-amber-500/80 pointer-events-none" />
          </>
        )}

        {/* Top Floating Era & Metadata Badges */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold font-mono shadow-xs backdrop-blur-md transition-colors duration-500 ${eraConfig.badgeClass}`}>
            {eraConfig.icon}
            <span>{eraConfig.label}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/80 border border-border/60 backdrop-blur-md text-[11px] font-bold text-foreground font-mono">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>#{currentChallenge.id.substring(0, 6)}</span>
          </div>
        </div>

        {/* Image Showcase Container with Smooth Zoom on Hover */}
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black/40 border border-black/20 shadow-inner flex items-center justify-center">
          {!imageError ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img 
              src={currentChallenge.imagem_principal} 
              alt={content?.titulo || 'Historical image'}
              className="object-cover w-full h-full pointer-events-none group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="eager"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-2 bg-gradient-to-b from-card/80 to-card">
              <Camera className="w-10 h-10 text-muted-foreground/50" />
              <p className="text-xs font-bold text-muted-foreground font-mono">{tGame('image_unavailable')}</p>
              <p className="text-[11px] text-muted-foreground/60 max-w-xs">{content?.titulo}</p>
            </div>
          )}
          <div className="absolute inset-0 ring-1 ring-inset ring-white/10 pointer-events-none rounded-2xl" />
        </div>
      </div>

      {/* Hint Card */}
      <div className="max-w-md mx-auto text-center bg-card/70 border border-border/60 backdrop-blur-xl rounded-2xl p-4 shadow-sm flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
          <Lightbulb className="w-5 h-5" />
        </div>
        <p className="text-foreground/90 text-sm font-medium italic text-left leading-relaxed">
          {content?.dica}
        </p>
      </div>
    </div>
  );
}
