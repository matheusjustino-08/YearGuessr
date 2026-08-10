'use client';

import { Link, usePathname } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { Trophy, Globe, Volume2, VolumeX } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { MultiplayerModal } from './MultiplayerModal';
import { useGameStore } from '@/store/useGameStore';

export function Navbar() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('nav');
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const setSoundEnabled = useGameStore((state) => state.setSoundEnabled);

  return (
    <nav className="w-full border-b border-border/40 bg-background/60 backdrop-blur-xl sticky top-0 z-50 transition-colors duration-500">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Brand Typography */}
        <Link href="/" className="flex items-center group">
          <span className="text-xl sm:text-2xl font-black tracking-tighter uppercase font-mono drop-shadow-xs">
            <span className="text-foreground">YEAR</span>
            <span className="text-primary font-black">GUESSR</span>
          </span>
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-1.5 sm:gap-4">
          
          {/* Clean Segmented Language Switcher */}
          <div className="flex items-center gap-0.5 p-0.5 sm:p-1 rounded-full bg-card/80 border border-border/70 backdrop-blur-md shadow-xs">
            <Globe className="w-3.5 h-3.5 ml-1 text-primary shrink-0 hidden xs:inline" />
            <Link
              href={pathname}
              locale="pt"
              className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                locale === 'pt'
                  ? 'bg-primary text-primary-foreground shadow-xs font-black'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              PT
            </Link>
            <Link
              href={pathname}
              locale="en"
              className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                locale === 'en'
                  ? 'bg-primary text-primary-foreground shadow-xs font-black'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              EN
            </Link>
            <Link
              href={pathname}
              locale="es"
              className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                locale === 'es'
                  ? 'bg-primary text-primary-foreground shadow-xs font-black'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              ES
            </Link>
          </div>

          {/* Sound Mute/Unmute Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            aria-label={soundEnabled ? 'Desativar Som' : 'Ativar Som'}
            className="p-2 rounded-full bg-card/80 border border-border/70 text-muted-foreground hover:text-foreground transition-all active:scale-95 cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4 text-muted-foreground" />}
          </button>

          {/* Ranking Link */}
          <Link 
            href="/leaderboard" 
            className="flex items-center gap-1.5 text-xs font-bold text-foreground/80 hover:text-primary transition-colors p-1.5 sm:px-3 sm:py-2 rounded-lg hover:bg-muted/40"
          >
            <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="hidden sm:inline">{t('ranking')}</span>
          </Link>

          {/* Multiplayer Button */}
          <div className="hidden xs:block">
            <MultiplayerModal />
          </div>

          {/* Login / Auth */}
          <div className="pl-1 sm:pl-2 border-l border-border/50">
            <AuthModal />
          </div>

        </div>
      </div>
    </nav>
  );
}
