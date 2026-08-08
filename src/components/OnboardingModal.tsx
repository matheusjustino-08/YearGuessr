'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { HelpCircle, ChevronRight, ChevronLeft, CheckCircle2, Sparkles, Target, Compass } from 'lucide-react';

export function OnboardingModal() {
  const tOnboarding = useTranslations('onboarding');
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    // Only show if user has not completed onboarding
    const hasSeen = localStorage.getItem('yearguessr_has_seen_onboarding');
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, []);

  const handleFinish = () => {
    localStorage.setItem('yearguessr_has_seen_onboarding', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-card border border-border/80 shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Header with Step Dots & Skip */}
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-muted-foreground">
              Tutorial ({step}/3)
            </h2>
          </div>

          <button
            onClick={handleFinish}
            className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
          >
            {tOnboarding('skip')}
          </button>
        </div>

        {/* Dynamic Content by Step */}
        <div className="min-h-[220px] flex flex-col justify-center">
          {step === 1 && (
            <div className="space-y-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto sm:mx-0">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black tracking-tight text-foreground">
                {tOnboarding('step_1_title')}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {tOnboarding('step_1_desc')}
              </p>
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 font-mono text-xs text-center text-primary font-bold">
                1900 ─── 🔘 (1969) ─── 2026
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center mx-auto sm:mx-0">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black tracking-tight text-foreground">
                {tOnboarding('step_2_title')}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {tOnboarding('step_2_desc')}
              </p>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono font-bold">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Super Perto</span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
                  <Compass className="w-3.5 h-3.5 shrink-0" />
                  <span>Perto</span>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1">
                  <Target className="w-3.5 h-3.5 shrink-0" />
                  <span>Longe</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto sm:mx-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black tracking-tight text-foreground">
                {tOnboarding('step_3_title')}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {tOnboarding('step_3_desc')}
              </p>
              <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-mono text-xs font-bold text-center">
                1ª Tenta: 100% pts | 2ª Tenta: 72% pts | 3ª Tenta: 50% pts
              </div>
            </div>
          )}
        </div>

        {/* Step Indicator Progress Dots */}
        <div className="flex items-center justify-center gap-1.5 pt-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-2">
          {step > 1 ? (
            <button
              onClick={() => setStep((prev) => prev - 1)}
              className="flex items-center gap-1 px-4 py-2.5 rounded-2xl bg-muted/60 hover:bg-muted text-xs font-bold text-foreground transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{tOnboarding('prev')}</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep((prev) => prev + 1)}
              className="flex items-center gap-1 px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary/90 text-xs font-bold text-primary-foreground transition-all shadow-md active:scale-95"
            >
              <span>{tOnboarding('next')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-1 px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all shadow-md active:scale-95 animate-pulse"
            >
              <span>{tOnboarding('finish')}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
