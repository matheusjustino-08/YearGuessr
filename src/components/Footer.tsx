'use client';

import { Link } from '@/i18n/routing';
import { Trophy, Coffee, Megaphone, ShieldCheck, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AdvertiseModal } from './AdvertiseModal';

export function Footer() {
  const tNav = useTranslations('nav');
  const tFooter = useTranslations('footer');
  const tKofi = useTranslations('kofi');
  const tAd = useTranslations('advertise');

  return (
    <footer className="w-full mt-auto relative z-10 border-t border-border/40 bg-card/60 backdrop-blur-2xl transition-colors duration-500">
      {/* Subtle Top Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Brand & Mission Statement */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
            <Link href="/" className="flex items-center gap-2 group cursor-pointer">
              <span className="text-2xl font-black tracking-tighter uppercase font-mono transition-transform duration-300 group-hover:scale-105">
                Year<span className="text-primary">Guessr</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-wider font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </span>
            </Link>
            <p className="text-xs text-muted-foreground max-w-sm">
              {tFooter('tagline')}
            </p>
          </div>

          {/* Action Buttons & Links */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {/* Ko-Fi Support */}
            <a
              href="https://ko-fi.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-mono bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 transition-all duration-200 active:scale-95 shadow-xs cursor-pointer"
            >
              <Coffee className="w-3.5 h-3.5 shrink-0 text-rose-500" />
              <span>{tKofi('support_btn')}</span>
            </a>

            {/* Advertise Modal Trigger */}
            <AdvertiseModal
              trigger={
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-mono bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 transition-all duration-200 active:scale-95 shadow-xs cursor-pointer"
                >
                  <Megaphone className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                  <span>{tAd('advertise_btn')}</span>
                </button>
              }
            />

            {/* Global Leaderboard Link */}
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-mono bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary transition-all duration-200 active:scale-95 shadow-xs"
            >
              <Trophy className="w-3.5 h-3.5 shrink-0 text-primary" />
              <span>{tNav('ranking')}</span>
            </Link>
          </div>

        </div>

        {/* Bottom Rights & Tech Stack */}
        <div className="mt-6 pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <span className="text-xs text-muted-foreground/70 font-mono">
            © 2026 YearGuessr — {tFooter('rights')}
          </span>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground/60 font-mono">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-primary" />
              Next.js 16 & Supabase
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
