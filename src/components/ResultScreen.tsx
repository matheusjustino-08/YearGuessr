'use client';

import { useGameStore } from '@/store/useGameStore';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useState, useEffect, useMemo } from 'react';
import { generateScoreCardBlob, type ScorecardStrings } from '@/lib/score-card-canvas';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { Share2, RefreshCw, Trophy, Target, CheckCircle2, Flame, ArrowRight, Sparkles } from 'lucide-react';
import { useAudioEngine } from '@/hooks/useAudioEngine';

import { useLocale } from 'next-intl';

export function ResultScreen() {
  const { gameState, lastScore, lastDistance, targetYear, guesses, reset, gameMode, dailyCompleted, setGameMode, currentChallenge } = useGameStore();
  const activeLocale = useLocale() as 'pt' | 'en' | 'es';
  const tResult = useTranslations('result');
  const tAuth = useTranslations('auth');
  const tGame = useTranslations('game');
  const tScorecard = useTranslations('scorecard');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const supabase = useMemo(() => createClient(), []);
  const { playWin, playLose } = useAudioEngine();

  const isWin = gameState === 'won' || lastDistance === 0;

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (gameState === 'won' || gameState === 'finished') {
      try {
        const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator && (navigator.userActivation ? navigator.userActivation.hasBeenActive : false);
        if (isWin) {
          playWin();
          if (canVibrate) navigator.vibrate([100, 50, 100, 50, 200]);
        } else {
          playLose();
          if (canVibrate) navigator.vibrate(300);
        }
      } catch {
        // Ignore user activation restriction
      }
    }
  }, [gameState, isWin, playWin, playLose]);

  if (gameState === 'playing') return null;

  const handleShareImage = async () => {
    setIsProcessing(true);
    try {
      const challengeContent = currentChallenge?.conteudo_i18n?.[activeLocale] || currentChallenge?.conteudo_i18n?.pt || currentChallenge?.conteudo_i18n?.en;
      const challengeTitle = challengeContent?.titulo || '';
      const categoryName = currentChallenge?.categorias?.[0] || 'HISTÓRIA';
      const isDark = typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : true;

      const scorecardStrings: ScorecardStrings = {
        perfect: tScorecard('perfect'),
        excellent: tScorecard('excellent'),
        very_close: tScorecard('very_close'),
        good_guess: tScorecard('good_guess'),
        keep_trying: tScorecard('keep_trying'),
        correct_year_label: tScorecard('correct_year_label'),
        score_label: tScorecard('score_label'),
        distance_label: tScorecard('distance_label'),
        game_mode_label: tScorecard('game_mode_label'),
        game_mode_value: tScorecard('game_mode_value'),
        subtitle: tScorecard('subtitle'),
        domain: tScorecard('domain'),
        year_unit: tResult('year_unit'),
        years_unit: tResult('years_unit'),
      };

      const blob = await generateScoreCardBlob(
        targetYear || 1969,
        lastScore || 0,
        lastDistance || 0,
        challengeTitle,
        categoryName,
        isDark,
        scorecardStrings
      );
      if (!blob) {
        setIsProcessing(false);
        return;
      }

      const file = new File([blob], 'yearguessr-score.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: tResult('share_title'),
            text: tResult('share_text')
          });
        } catch (e) {
          console.log('Share canceled or failed', e);
        }
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'yearguessr-score.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
      setIsProcessing(false);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  const handleLogin = async (provider: 'google' | 'github') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  // Translation helpers
  const dailyNoticeTitle = tGame('daily_completed_notice');
  const dailyNoticeDesc = tGame('daily_completed_desc');
  const switchToPracticeText = tGame('switch_to_practice');
  const yearUnitLabel = lastDistance === 1 ? tResult('year_unit') : tResult('years_unit');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 25, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-md mx-auto space-y-5 p-6 sm:p-8 rounded-3xl bg-card/80 border border-border/70 backdrop-blur-2xl shadow-2xl text-center relative overflow-hidden"
    >
      {/* Background Accent Glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Daily Challenge Completed Banner */}
      {gameMode === 'daily' && dailyCompleted && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs space-y-1 text-left relative z-10">
          <div className="flex items-center gap-2 font-bold font-mono uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{dailyNoticeTitle}</span>
          </div>
          <p className="text-[11px] font-normal text-muted-foreground leading-relaxed">
            {dailyNoticeDesc}
          </p>
        </div>
      )}

      {/* Main Status Header */}
      <div className="space-y-2 relative z-10 flex flex-col items-center">
        <div className="relative w-32 h-32 shrink-0 drop-shadow-xl -mb-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mascot-shrug.png"
            alt="YearGuessr Mascot"
            className="w-full h-full object-contain animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 90%)',
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 90%)',
            }}
          />
        </div>

        <div className="space-y-1">
          <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-mono font-black uppercase tracking-wider ${
            isWin ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
          }`}>
            {(() => {
              try {
                const key = isWin ? 'won_badge' : 'finished_badge';
                const text = tResult(key);
                if (text && !text.startsWith('result.')) return text;
              } catch {
                // fallback
              }
              return isWin ? '★ Palpite Exato!' : 'Desafio Concluído';
            })()}
          </span>
          <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${isWin ? 'text-emerald-500 dark:text-emerald-400' : 'text-foreground'}`}>
            {isWin ? tResult('won_title') : tResult('finished_title')}
          </h2>
        </div>
      </div>
      
      {/* Target Year Card */}
      <div className="py-5 px-4 bg-muted/40 border border-border/50 rounded-2xl space-y-1 relative z-10 shadow-inner">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono font-bold">{tResult('correct_year')}</p>
        <p className="text-6xl font-mono font-black text-amber-500 tracking-tighter drop-shadow-xs">{targetYear}</p>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-2 gap-3 relative z-10">
        <div className="bg-card/60 p-3.5 rounded-2xl border border-border/60 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold font-mono">{tResult('total_score')}</p>
          <p className="text-2xl font-mono font-black text-emerald-500 mt-1">{lastScore || 0}</p>
        </div>
        <div className="bg-card/60 p-3.5 rounded-2xl border border-border/60 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold font-mono">{tResult('distance_off')}</p>
          <p className="text-2xl font-mono font-black text-foreground mt-1">{lastDistance || 0} {yearUnitLabel}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-1 relative z-10">
        <button
          type="button"
          onClick={handleShareImage}
          disabled={isProcessing}
          className="w-full py-3.5 px-5 bg-primary text-primary-foreground font-bold text-xs rounded-2xl hover:bg-primary/90 transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2.5 disabled:opacity-50 uppercase tracking-wider cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>{isProcessing ? '...' : tResult('download_card')}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (gameMode === 'daily' && dailyCompleted) {
              setGameMode('practice');
            } else {
              reset();
            }
          }}
          className="w-full py-3 px-5 bg-secondary text-secondary-foreground font-bold text-xs rounded-2xl hover:bg-secondary/80 transition-all border border-border/60 flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
        >
          {gameMode === 'daily' && dailyCompleted ? (
            <>
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{switchToPracticeText}</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>{tResult('play_again')}</span>
            </>
          )}
        </button>
      </div>

      {/* Auth Status / Login Section */}
      <div className="pt-3 border-t border-border/40 relative z-10">
        {!user ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed">{tAuth('subtitle')}</p>
            <div className="grid grid-cols-2 gap-2.5">
              <button 
                type="button"
                onClick={() => handleLogin('github')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#24292e] text-white rounded-xl hover:bg-[#24292e]/90 transition-all text-xs font-semibold shadow-xs cursor-pointer"
              >
                <span>GitHub</span>
              </button>
              <button 
                type="button"
                onClick={() => handleLogin('google')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white text-gray-900 border rounded-xl hover:bg-gray-50 transition-all text-xs font-semibold shadow-xs cursor-pointer"
              >
                <span>Google</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-xs font-bold font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{tAuth('status_logged')}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
