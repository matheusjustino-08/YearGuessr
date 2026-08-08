'use client';

import { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, CheckCircle2, RefreshCw, Trophy, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Item {
  id: string;
  title: string;
  year: number;
  imageUrl: string;
}

const DEMO_ITEMS: Item[] = [
  { id: '1', title: 'Construção da Torre Eiffel (Paris)', year: 1887, imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?q=80&w=800&auto=format&fit=crop' },
  { id: '2', title: 'Primeiro Voo do 14-Bis (Santos Dumont)', year: 1906, imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop' },
  { id: '3', title: 'Queda do Muro de Berlim', year: 1989, imageUrl: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=800&auto=format&fit=crop' },
  { id: '4', title: 'Lançamento do Primeiro iPhone', year: 2007, imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=800&auto=format&fit=crop' },
];

function shuffleArray<T>(arr: T[]): T[] {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export function ChronologicalGame() {
  const tGame = useTranslations('game');
  const [items, setItems] = useState<Item[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);

  const initGame = () => {
    setItems(shuffleArray(DEMO_ITEMS));
    setSubmitted(false);
    setIsCorrect(false);
    setScore(0);
  };

  useEffect(() => {
    initGame();
  }, []);

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
    let correctCount = 0;
    for (let i = 0; i < items.length - 1; i++) {
      if (items[i].year <= items[i + 1].year) {
        correctCount++;
      }
    }

    const win = correctCount === items.length - 1;
    setIsCorrect(win);
    setScore(win ? 5000 : correctCount * 1250);
    setSubmitted(true);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black text-foreground uppercase tracking-tight">
          LINHA DO TEMPO EM ORDEM
        </h2>
        <p className="text-xs text-muted-foreground font-mono">
          Organize os 4 eventos históricos do MAIS ANTIGO (topo) ao MAIS RECENTE (base)
        </p>
      </div>

      {/* Cards List */}
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div
            key={item.id}
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
                    Ano: {item.year}
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
            className="w-full py-4 bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-primary/90 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Confirmar Sequência Cronológica</span>
          </button>
        ) : (
          <div className="p-6 rounded-3xl bg-card/90 border border-border/70 backdrop-blur-2xl space-y-4 shadow-xl">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-foreground">
                {isCorrect ? 'Ordem Perfeita! Sensacional!' : 'Sequência Incompleta'}
              </h3>
              <p className="text-3xl font-mono font-black text-primary">
                +{score} pts
              </p>
            </div>

            <button
              type="button"
              onClick={initGame}
              className="px-6 py-3 bg-secondary text-secondary-foreground font-bold text-xs uppercase tracking-wider rounded-2xl hover:bg-secondary/80 transition-all border border-border/60 inline-flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Jogar Novamente</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
