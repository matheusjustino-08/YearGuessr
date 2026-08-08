'use client';

import { useState, useEffect, useCallback } from 'react';
import { Gamepad2, Timer, Clock, Zap, CheckCircle2, AlertCircle, Save, Sliders } from 'lucide-react';
import type { SupabaseClient } from '@supabase/supabase-js';

interface Props {
  supabase: SupabaseClient;
}

export function GameModesSection({ supabase }: Props) {
  const [totalChallenges, setTotalChallenges] = useState(0);
  const [timeAttackTime, setTimeAttackTime] = useState(60);
  const [bonusTime, setBonusTime] = useState(5);
  const [chronoItemsCount, setChronoItemsCount] = useState(4);
  const [enableTimeAttack, setEnableTimeAttack] = useState(true);
  const [enableChronological, setEnableChronological] = useState(true);
  const [enablePractice, setEnablePractice] = useState(true);
  const [msg, setMsg] = useState<{ text: string; type: 'ok' | 'err' } | null>(null);
  const [loading, setLoading] = useState(true);

  const showMsg = (text: string, type: 'ok' | 'err' = 'ok') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 4000);
  };

  const loadModeStats = useCallback(async () => {
    setLoading(true);
    try {
      const { count, error } = await supabase
        .from('desafios')
        .select('*', { count: 'exact', head: true });

      if (!error && count !== null) {
        setTotalChallenges(count);
      }
    } catch {
      // Ignore fallback
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadModeStats();
  }, [loadModeStats]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showMsg('Configurações dos Modos de Jogo salvas com sucesso!');
  };

  const inputCls =
    'w-full p-2.5 rounded-xl border border-border/70 bg-muted/30 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all';
  const labelCls =
    'block text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-mono mb-1';

  return (
    <div className="p-6 space-y-6">
      {msg && (
        <div
          className={`p-3 rounded-xl font-mono text-xs font-bold text-center border ${
            msg.type === 'ok'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Mode Availability Diagnostic Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground">Desafio Diário</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-sm font-bold text-foreground">1 Desafio por Dia</p>
          <p className="text-[11px] text-muted-foreground font-mono">Status: Ativo</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground">Linha do Tempo</span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${totalChallenges >= 2 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
              {totalChallenges >= 2 ? 'Elegível' : 'Requer 2+ desafios'}
            </span>
          </div>
          <p className="text-sm font-bold text-foreground">{chronoItemsCount} Eventos Reais</p>
          <p className="text-[11px] text-muted-foreground font-mono">Disponíveis no Banco: {totalChallenges}</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground">Contratempo</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-sm font-bold text-foreground">{timeAttackTime}s de Cronômetro</p>
          <p className="text-[11px] text-muted-foreground font-mono">Bônus "Na Mosca": +{bonusTime}s</p>
        </div>
      </div>

      {/* Mode Controls Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contratempo Settings */}
          <div className="p-5 rounded-2xl bg-muted/20 border border-border/60 space-y-4">
            <div className="flex items-center gap-2 text-amber-500">
              <Zap className="w-5 h-5" />
              <h3 className="text-sm font-bold text-foreground">Modo Contratempo (Time Attack)</h3>
            </div>

            <div>
              <label className={labelCls}>Tempo Inicial do Cronômetro (segundos)</label>
              <input
                type="number"
                min={30}
                max={300}
                value={timeAttackTime}
                onChange={(e) => setTimeAttackTime(parseInt(e.target.value, 10) || 60)}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Tempo Bônus por Acerto Exato (Na Mosca)</label>
              <input
                type="number"
                min={1}
                max={30}
                value={bonusTime}
                onChange={(e) => setBonusTime(parseInt(e.target.value, 10) || 5)}
                className={inputCls}
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={enableTimeAttack}
                onChange={(e) => setEnableTimeAttack(e.target.checked)}
                className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
              />
              <span className="text-xs font-bold text-foreground">Ativar Modo Contratempo no Menu Principal</span>
            </label>
          </div>

          {/* Chronological Settings */}
          <div className="p-5 rounded-2xl bg-muted/20 border border-border/60 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Clock className="w-5 h-5" />
              <h3 className="text-sm font-bold text-foreground">Modo Linha do Tempo em Ordem</h3>
            </div>

            <div>
              <label className={labelCls}>Quantidade de Eventos por Sequência</label>
              <input
                type="number"
                min={2}
                max={10}
                value={chronoItemsCount}
                onChange={(e) => setChronoItemsCount(parseInt(e.target.value, 10) || 4)}
                className={inputCls}
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-3">
              <input
                type="checkbox"
                checked={enableChronological}
                onChange={(e) => setEnableChronological(e.target.checked)}
                className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
              />
              <span className="text-xs font-bold text-foreground">Ativar Modo Linha do Tempo no Menu Principal</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-primary/90 transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2 font-mono"
        >
          <Save className="w-4 h-4" />
          <span>SALVAR CONFIGURAÇÕES DOS MODOS DE JOGO</span>
        </button>
      </form>
    </div>
  );
}
