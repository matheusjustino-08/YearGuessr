'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowUp, ArrowDown, CheckCircle2, RefreshCw, AlertCircle, Layers, Sparkles } from 'lucide-react';

interface Item {
  id: string;
  title: string;
  year: number;
  imageUrl: string;
}

interface Minigame {
  id: string;
  titulo: string;
  desafio_ids: string[];
}

export function ChronologicalGame() {
  const supabase = useMemo(() => createClient(), []);
  const activeLocale = useLocale() as 'pt' | 'en' | 'es';
  const tGame = useTranslations('game');

  const [minigames, setMinigames] = useState<Minigame[]>([]);
  const [selectedMinigame, setSelectedMinigame] = useState<Minigame | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);

  const fetchMinigamesAndChallenges = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch admin created minigames
      const { data: mgData } = await supabase
        .from('desafios_linha_tempo')
        .select('*')
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (mgData && mgData.length > 0) {
        setMinigames(mgData);
        loadMinigameItems(mgData[0]);
        return;
      }

      // 2. Fallback if no specific minigame created: pick 4 random challenges from database
      const { data: rawChallenges } = await supabase
        .from('desafios')
        .select('*')
        .limit(50);

      if (rawChallenges && rawChallenges.length >= 2) {
        const countToPick = Math.min(4, rawChallenges.length);
        const shuffled = [...rawChallenges].sort(() => Math.random() - 0.5).slice(0, countToPick);
        const mapped: Item[] = shuffled.map((item) => {
          const content = item.conteudo_i18n?.[activeLocale] || item.conteudo_i18n?.pt || item.conteudo_i18n?.en;
          return {
            id: item.id,
            title: content?.titulo || 'Evento Histórico',
            year: item.ano_correto,
            imageUrl: item.imagem_principal,
          };
        });
        setItems(mapped);
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
      setSubmitted(false);
      setIsCorrect(false);
      setScore(0);
    }
  }, [supabase, activeLocale]);

  const loadMinigameItems = async (mg: Minigame) => {
    setLoading(true);
    setSelectedMinigame(mg);
    try {
      const { data } = await supabase
        .from('desafios')
        .select('*')
        .in('id', mg.desafio_ids);

      if (data && data.length > 0) {
        const mapped: Item[] = data.map((item) => {
          const content = item.conteudo_i18n?.[activeLocale] || item.conteudo_i18n?.pt || item.conteudo_i18n?.en;
          return {
            id: item.id,
            title: content?.titulo || 'Evento Histórico',
            year: item.ano_correto,
            imageUrl: item.imagem_principal,
          };
        });
        // Shuffle current round order so player has to re-order them
        setItems([...mapped].sort(() => Math.random() - 0.5));
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
      setSubmitted(false);
      setIsCorrect(false);
      setScore(0);
    }
  };

  useEffect(() => {
    fetchMinigamesAndChallenges();
  }, [fetchMinigamesAndChallenges]);

  const moveUp = (index: number) => {
    if (index === 0 || submitted) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    setItems(newItems);
  };

  const moveDown = (index: number) => {
    if (index === items.length - 1 || submitted) return;
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    setItems(newItems);
  };

  const handleConfirm = () => {
    if (items.length < 2) return;
    let correctCount = 0;
    for (let i = 0; i < items.length - 1; i++) {
      if (items[i].year <= items[i + 1].year) {
        correctCount++;
      }
    }

    const win = correctCount === items.length - 1;
    setIsCorrect(win);
    setScore(win ? 5000 : Math.round((correctCount / (items.length - 1)) * 5000));
    setSubmitted(true);
  };

  if (loading) {
    return (
      <div className="w-full max-w-xl mx-auto text-center p-12 rounded-3xl bg-card/80 border border-border/70 backdrop-blur-2xl space-y-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono font-bold text-muted-foreground uppercase">Carregando Minigame da Linha do Tempo...</p>
      </div>
    );
  }

  if (items.length < 2) {
    return (
      <div className="w-full max-w-xl mx-auto text-center p-8 rounded-3xl bg-card/80 border border-border/70 backdrop-blur-2xl space-y-4">
        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/30 w-12 h-12 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Nenhum Minigame Criado no Banco</h3>
        <p className="text-xs text-muted-foreground font-mono leading-relaxed max-w-md mx-auto">
          Crie minigames e selecione os 4 eventos no Painel Admin na seção "Gerenciador da Linha do Tempo & Modos de Jogo"!
        </p>
        <button
          type="button"
          onClick={fetchMinigamesAndChallenges}
          className="px-6 py-2.5 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-primary/90 transition-all cursor-pointer font-mono"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Admin Minigames Selector Pills */}
      {minigames.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 p-2 rounded-2xl bg-card/80 border border-border/60 backdrop-blur-xl">
          <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground px-2">Minigames do Admin:</span>
          {minigames.map((mg) => (
            <button
              key={mg.id}
              type="button"
              onClick={() => loadMinigameItems(mg)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                selectedMinigame?.id === mg.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/40 text-muted-foreground hover:text-foreground'
              }`}
            >
              {mg.titulo}
            </button>
          ))}
        </div>
      )}

      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black text-foreground uppercase tracking-tight font-mono">
          {selectedMinigame ? selectedMinigame.titulo : 'LINHA DO TEMPO EM ORDEM'}
        </h2>
        <p className="text-xs text-muted-foreground font-mono">
          Organize os {items.length} eventos históricos reais do MAIS ANTIGO (topo) ao MAIS RECENTE (base)
        </p>
      </div>

      {/* Cards List */}
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div
            key={item.id + '-' + idx}
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 backdrop-blur-md shadow-sm ${
              submitted
                ? isCorrect
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                  : 'bg-card/80 border-border/60'
                : 'bg-card/80 border-border/70 hover:border-primary/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-primary/10 border border-primary/30 text-primary font-mono font-black text-xs flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt=""
                className="w-14 h-14 rounded-xl object-cover shrink-0 border border-border/50"
              />
              <div>
                <p className="text-xs sm:text-sm font-bold text-foreground">
                  {item.title}
                </p>
                {submitted && (
                  <p className="text-xs font-mono font-bold text-amber-500 mt-0.5">
                    Ano Correto: {item.year}
                  </p>
                )}
              </div>
            </div>

            {!submitted && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  className="p-2 rounded-xl bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(idx)}
                  disabled={idx === items.length - 1}
                  className="p-2 rounded-xl bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Button & Result */}
      <div className="text-center pt-2">
        {!submitted ? (
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full py-4 bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-primary/90 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 cursor-pointer font-mono"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>CONFIRMAR SEQUÊNCIA CRONOLÓGICA</span>
          </button>
        ) : (
          <div className="p-6 rounded-3xl bg-card/90 border border-border/70 backdrop-blur-2xl space-y-4 shadow-xl">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-foreground">
                {isCorrect ? 'Ordem Perfeita! Sensacional!' : 'Sequência Incorreta'}
              </h3>
              <p className="text-3xl font-mono font-black text-primary">
                +{score} pts
              </p>
            </div>

            <button
              type="button"
              onClick={fetchMinigamesAndChallenges}
              className="px-6 py-3 bg-secondary text-secondary-foreground font-bold text-xs uppercase tracking-wider rounded-2xl hover:bg-secondary/80 transition-all border border-border/60 inline-flex items-center gap-2 cursor-pointer font-mono"
            >
              <RefreshCw className="w-4 h-4" />
              <span>JOGAR OUTRO MINIGAME</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
