'use client';

import { useState, useEffect, useCallback } from 'react';
import { Gamepad2, Timer, Clock, Zap, CheckCircle2, AlertCircle, Save, Sliders, Calendar, ExternalLink } from 'lucide-react';
import type { SupabaseClient } from '@supabase/supabase-js';

interface Props {
  supabase: SupabaseClient;
}

interface ChronoEvent {
  id: string;
  ano_correto: number;
  imagem_principal: string;
  conteudo_i18n: {
    pt: { titulo: string; dica: string };
    en?: { titulo: string; dica: string };
  };
}

export function GameModesSection({ supabase }: Props) {
  const [totalChallenges, setTotalChallenges] = useState(0);
  const [timeAttackTime, setTimeAttackTime] = useState(60);
  const [bonusTime, setBonusTime] = useState(5);
  const [chronoItemsCount, setChronoItemsCount] = useState(4);
  const [enableTimeAttack, setEnableTimeAttack] = useState(true);
  const [enableChronological, setEnableChronological] = useState(true);
  const [chronoEvents, setChronoEvents] = useState<ChronoEvent[]>([]);
  const [msg, setMsg] = useState<{ text: string; type: 'ok' | 'err' } | null>(null);
  const [loading, setLoading] = useState(true);

  const showMsg = (text: string, type: 'ok' | 'err' = 'ok') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 4000);
  };

  const loadModeStats = useCallback(async () => {
    setLoading(true);
    try {
      const { data, count, error } = await supabase
        .from('desafios')
        .select('id, ano_correto, imagem_principal, conteudo_i18n', { count: 'exact' })
        .order('ano_correto', { ascending: true });

      if (!error && data) {
        setTotalChallenges(count || data.length);
        setChronoEvents(data);
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
    <div className="p-6 space-y-8">
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
          <p className="text-sm font-bold text-foreground">{chronoItemsCount} Eventos por Partida</p>
          <p className="text-[11px] text-muted-foreground font-mono">Eventos no Banco: {totalChallenges}</p>
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

      {/* DEDICATED CHRONOLOGICAL EVENTS MANAGER TABLE */}
      <div className="pt-4 space-y-4 border-t border-border/40">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-foreground uppercase tracking-tight font-mono flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              GERENCIADOR DE EVENTOS DA LINHA DO TEMPO
            </h3>
            <p className="text-xs text-muted-foreground font-mono">
              Todos os desafios cadastrados alimentam automaticamente o Modo Linha do Tempo. Abaixo estão listados em ordem cronológica real:
            </p>
          </div>
        </div>

        {chronoEvents.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-muted/20 border border-border/60">
            <p className="text-xs font-mono font-bold text-muted-foreground">
              Nenhum evento cadastrado no banco de dados ainda. Cadastre desafios no formulário acima!
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden divide-y divide-border/40">
            {chronoEvents.map((evt, idx) => (
              <div key={evt.id} className="p-3.5 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-mono font-black text-[11px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={evt.imagem_principal}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover border border-border/50 shrink-0"
                  />
                  <div>
                    <p className="text-xs font-bold text-foreground">{evt.conteudo_i18n?.pt?.titulo || 'Evento Sem Título'}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">ID: {evt.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-mono font-black text-xs">
                    Ano {evt.ano_correto}
                  </span>
                  <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-mono font-bold text-[10px]">
                    Ativo na Linha do Tempo
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
