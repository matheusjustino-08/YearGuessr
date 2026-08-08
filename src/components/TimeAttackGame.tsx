'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTranslations, useLocale } from 'next-intl';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { Timer, Zap, Trophy, RefreshCw, AlertCircle } from 'lucide-react';
import { generateOrganicRulerRange } from '@/lib/ruler-calculator';

interface ChallengeItem {
  id: string;
  ano_correto: number;
  minYear: number;
  maxYear: number;
  imagem_principal: string;
  conteudo_i18n: {
    pt: { titulo: string; dica: string };
    en: { titulo: string; dica: string };
    es?: { titulo: string; dica: string };
  };
}

export function TimeAttackGame() {
  const supabase = useMemo(() => createClient(), []);
  const activeLocale = useLocale() as 'pt' | 'en' | 'es';
  const tGame = useTranslations('game');
  const { playTick, playSubmit, playWin, playLose } = useAudioEngine();

  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [currentYear, setCurrentYear] = useState(1950);
  const [challengesPool, setChallengesPool] = useState<ChallengeItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState<{ msg: string; bonusTime?: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch real challenges from Supabase
  const loadChallenges = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('desafios')
        .select('*')
        .limit(50);

      if (data && data.length > 0) {
        const mapped: ChallengeItem[] = data.map((item) => {
          const organic = generateOrganicRulerRange(item.ano_correto, item.dificuldade || 'normal');
          return {
            id: item.id,
            ano_correto: item.ano_correto,
            minYear: item.janela_anos ? item.janela_anos[0] : organic.minYear,
            maxYear: item.janela_anos ? item.janela_anos[1] : organic.maxYear,
            imagem_principal: item.imagem_principal,
            conteudo_i18n: item.conteudo_i18n,
          };
        });
        setChallengesPool(mapped.sort(() => Math.random() - 0.5));
      } else {
        setChallengesPool([]);
      }
    } catch {
      setChallengesPool([]);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const startGame = () => {
    setTimeLeft(60);
    setTotalScore(0);
    setStreak(0);
    setGameOver(false);
    setCurrentIndex(0);
    setFeedback(null);
    setIsActive(true);
  };

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  // 60-Second Countdown Timer
  useEffect(() => {
    if (!isActive || gameOver) return;

    if (timeLeft <= 0) {
      setIsActive(false);
      setGameOver(true);
      playLose();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          setGameOver(true);
          playLose();
          return 0;
        }
        if (prev <= 10) playTick();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, gameOver, timeLeft, playTick, playLose]);

  const activeChallenge = challengesPool.length > 0 ? challengesPool[currentIndex % challengesPool.length] : null;
  const content = activeChallenge?.conteudo_i18n?.[activeLocale] || activeChallenge?.conteudo_i18n?.pt || activeChallenge?.conteudo_i18n?.en;

  useEffect(() => {
    if (activeChallenge) {
      setCurrentYear(Math.floor((activeChallenge.minYear + activeChallenge.maxYear) / 2));
    }
  }, [activeChallenge]);

  const handleGuess = () => {
    if (isSubmitting || gameOver || !activeChallenge) return;
    setIsSubmitting(true);
    playSubmit();

    const diff = Math.abs(currentYear - activeChallenge.ano_correto);
    const roundScore = Math.max(0, Math.round(5000 * Math.exp(-0.018 * diff)));

    if (diff === 0) {
      playWin();
      setTimeLeft((prev) => prev + 5);
      setTotalScore((prev) => prev + 5000);
      setStreak((prev) => prev + 1);
      setFeedback({ msg: 'NA MOSCA! +5s DE BÔNUS!', bonusTime: 5 });
    } else {
      setTotalScore((prev) => prev + roundScore);
      setFeedback({ msg: `Errou por ${diff} anos (+${roundScore} pts)` });
    }

    setTimeout(() => {
      setFeedback(null);
      setCurrentIndex((prev) => prev + 1);
      setIsSubmitting(false);
    }, 900);
  };

  if (loading) {
    return (
      <div className="w-full max-w-xl mx-auto text-center p-12 rounded-3xl bg-card/80 border border-border/70 backdrop-blur-2xl space-y-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono font-bold text-muted-foreground uppercase">Carregando Desafios do Banco de Dados...</p>
      </div>
    );
  }

  if (challengesPool.length === 0) {
    return (
      <div className="w-full max-w-xl mx-auto text-center p-8 rounded-3xl bg-card/80 border border-border/70 backdrop-blur-2xl space-y-4">
        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/30 w-12 h-12 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Nenhum Desafio no Banco</h3>
        <p className="text-xs text-muted-foreground font-mono leading-relaxed max-w-md mx-auto">
          Cadastre novos desafios históricos no Painel Admin para jogar o Modo Contratempo!
        </p>
        <button
          type="button"
          onClick={loadChallenges}
          className="px-6 py-2.5 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-primary/90 transition-all cursor-pointer font-mono"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (!isActive && !gameOver) {
    return (
      <div className="w-full max-w-xl mx-auto text-center p-8 rounded-3xl bg-card/80 border border-border/70 backdrop-blur-2xl space-y-6 shadow-xl">
        <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/30 w-16 h-16 mx-auto flex items-center justify-center">
          <Zap className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-tight text-foreground font-mono">
            MODO CONTRATEMPO (TIME ATTACK)
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed font-mono">
            Você tem 60 segundos para acertar o máximo de desafios do banco! A cada acerto exato (Na Mosca), você ganha +5 segundos de tempo bônus!
          </p>
        </div>
        <button
          type="button"
          onClick={startGame}
          className="w-full py-4 bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-primary/90 transition-all shadow-xl active:scale-95 cursor-pointer flex items-center justify-center gap-2 font-mono"
        >
          <Timer className="w-5 h-5" />
          <span>INICIAR DESAFIO (60s)</span>
        </button>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="w-full max-w-xl mx-auto text-center p-8 rounded-3xl bg-card/80 border border-border/70 backdrop-blur-2xl space-y-6 shadow-xl">
        <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 w-16 h-16 mx-auto flex items-center justify-center">
          <Trophy className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-mono font-bold uppercase text-muted-foreground">TEMPO ESGOTADO!</p>
          <h2 className="text-3xl font-black text-foreground">PONTUAÇÃO TOTAL</h2>
          <p className="text-5xl font-mono font-black text-primary drop-shadow-xs">{totalScore} pts</p>
          <p className="text-xs font-mono text-muted-foreground pt-1">Acertos Perfeitos: {streak}</p>
        </div>
        <button
          type="button"
          onClick={startGame}
          className="w-full py-4 bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-primary/90 transition-all shadow-xl active:scale-95 cursor-pointer flex items-center justify-center gap-2 font-mono"
        >
          <RefreshCw className="w-5 h-5" />
          <span>JOGAR NOVAMENTE</span>
        </button>
      </div>
    );
  }

  if (!activeChallenge) return null;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Bar Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className={`p-3 rounded-2xl border text-center font-mono ${timeLeft <= 10 ? 'bg-rose-500/20 border-rose-500/40 text-rose-500 animate-pulse' : 'bg-card/80 border-border/60 text-foreground'}`}>
          <p className="text-[10px] font-bold text-muted-foreground uppercase">Tempo Restante</p>
          <p className="text-2xl font-black">{timeLeft}s</p>
        </div>
        <div className="p-3 rounded-2xl bg-card/80 border border-border/60 text-center font-mono">
          <p className="text-[10px] font-bold text-muted-foreground uppercase">Pontuação Total</p>
          <p className="text-2xl font-black text-primary">{totalScore}</p>
        </div>
        <div className="p-3 rounded-2xl bg-card/80 border border-border/60 text-center font-mono">
          <p className="text-[10px] font-bold text-muted-foreground uppercase">Acertos Na Mosca</p>
          <p className="text-2xl font-black text-emerald-500">{streak}</p>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400 font-mono font-bold text-center text-xs animate-bounce">
          {feedback.msg}
        </div>
      )}

      {/* Main Challenge Image & Slider */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-card/80 border border-border/70 backdrop-blur-xl p-6 rounded-3xl shadow-lg">
        <div className="h-64 rounded-2xl overflow-hidden relative border border-border/50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={activeChallenge.imagem_principal} alt="" className="object-cover w-full h-full" />
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <p className="text-white font-bold text-sm leading-snug">{content?.titulo}</p>
          </div>
        </div>

        <div className="space-y-4 text-center">
          <p className="text-xs font-mono font-bold text-muted-foreground uppercase">Qual o ano da foto?</p>
          <p className="text-5xl font-mono font-black text-primary">{currentYear}</p>

          <input
            type="range"
            min={activeChallenge.minYear}
            max={activeChallenge.maxYear}
            value={currentYear}
            onChange={(e) => setCurrentYear(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />

          <button
            type="button"
            onClick={handleGuess}
            disabled={isSubmitting}
            className="w-full py-3.5 bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-primary/90 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50 font-mono"
          >
            CONFIRMAR PALPITE
          </button>
        </div>
      </div>
    </div>
  );
}
