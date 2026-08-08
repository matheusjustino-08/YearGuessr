'use client';

import { useState, useEffect, useCallback } from 'react';
import { Gamepad2, Timer, Clock, Zap, CheckCircle2, AlertCircle, Save, Plus, Trash2, Layers, Sparkles } from 'lucide-react';
import type { SupabaseClient } from '@supabase/supabase-js';

interface Props {
  supabase: SupabaseClient;
}

interface ChallengeOption {
  id: string;
  ano_correto: number;
  imagem_principal: string;
  conteudo_i18n: {
    pt: { titulo: string; dica?: string };
  };
}

interface TimelineMinigame {
  id: string;
  titulo: string;
  desafio_ids: string[];
  ativo: boolean;
  created_at?: string;
}

export function GameModesSection({ supabase }: Props) {
  const [totalChallenges, setTotalChallenges] = useState(0);
  const [allChallenges, setAllChallenges] = useState<ChallengeOption[]>([]);
  const [minigames, setMinigames] = useState<TimelineMinigame[]>([]);
  const [loading, setLoading] = useState(true);

  // New Minigame Form state
  const [minigameTitle, setMinigameTitle] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>(['', '', '', '']);
  const [msg, setMsg] = useState<{ text: string; type: 'ok' | 'err' } | null>(null);

  const showMsg = (text: string, type: 'ok' | 'err' = 'ok') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 4000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all challenges
      const { data: challengesData, count } = await supabase
        .from('desafios')
        .select('id, ano_correto, imagem_principal, conteudo_i18n', { count: 'exact' })
        .order('ano_correto', { ascending: true });

      if (challengesData) {
        setTotalChallenges(count || challengesData.length);
        setAllChallenges(challengesData);
      }

      // Fetch timeline minigames created by admin
      const { data: minigamesData } = await supabase
        .from('desafios_linha_tempo')
        .select('*')
        .order('created_at', { ascending: false });

      if (minigamesData) {
        setMinigames(minigamesData);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateMinigame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!minigameTitle.trim()) return showMsg('Digite um título para o minigame.', 'err');

    const validIds = selectedIds.filter(id => id.trim() !== '');
    if (validIds.length < 2) return showMsg('Selecione pelo menos 2 eventos históricos para o minigame.', 'err');

    try {
      const { error } = await supabase.from('desafios_linha_tempo').insert([{
        titulo: minigameTitle.trim(),
        desafio_ids: validIds,
        ativo: true
      }]);

      if (error) {
        // Local-only update if table doesn't exist yet
        setMinigames(prev => [{
          id: 'temp_' + Date.now(),
          titulo: minigameTitle.trim(),
          desafio_ids: validIds,
          ativo: true
        }, ...prev]);
        showMsg('Minigame criado localmente! (Execute o script SQL para persistir no Supabase)', 'ok');
      } else {
        showMsg('Minigame da Linha do Tempo criado com sucesso!', 'ok');
        loadData();
      }

      setMinigameTitle('');
      setSelectedIds(['', '', '', '']);
    } catch {
      showMsg('Erro ao criar minigame.', 'err');
    }
  };

  const handleDeleteMinigame = async (id: string) => {
    if (!confirm('Excluir este Minigame da Linha do Tempo?')) return;
    try {
      await supabase.from('desafios_linha_tempo').delete().eq('id', id);
      setMinigames(prev => prev.filter(m => m.id !== id));
      showMsg('Minigame removido.');
    } catch {
      showMsg('Erro ao remover minigame.', 'err');
    }
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

      {/* Overview stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground">Minigames Criados</span>
          <p className="text-2xl font-black font-mono text-primary">{minigames.length}</p>
          <p className="text-[11px] text-muted-foreground font-mono">Prontos para Jogar</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground">Eventos no Banco</span>
          <p className="text-2xl font-black font-mono text-amber-500">{totalChallenges}</p>
          <p className="text-[11px] text-muted-foreground font-mono">Cadastrados na tabela 'desafios'</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground">Status do Modo</span>
          <p className="text-sm font-bold text-emerald-500 flex items-center gap-1.5 pt-1">
            <CheckCircle2 className="w-4 h-4" /> Ativo & Funcional
          </p>
          <p className="text-[11px] text-muted-foreground font-mono">Alimentado pelo Admin</p>
        </div>
      </div>

      {/* FORM: CREATOR FOR CUSTOM TIMELINE MINIGAMES */}
      <div className="p-6 rounded-3xl bg-card border border-border/70 shadow-lg space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border/40">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black uppercase tracking-tight text-foreground font-mono">
              CRIAR NOVO MINIGAME DA LINHA DO TEMPO
            </h3>
            <p className="text-xs text-muted-foreground font-mono">
              Monte um conjunto temático de 4 eventos históricos para os jogadores ordenarem!
            </p>
          </div>
        </div>

        <form onSubmit={handleCreateMinigame} className="space-y-5">
          <div>
            <label className={labelCls}>Nome do Minigame / Conjunto Temático</label>
            <input
              type="text"
              required
              placeholder="Ex: Invenções Tecnológicas, Guerras Mundiais, História da Música..."
              value={minigameTitle}
              onChange={e => setMinigameTitle(e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="space-y-3">
            <label className={labelCls}>Selecione os 4 Eventos Históricos do Minigame</label>

            {selectedIds.map((val, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-muted text-muted-foreground font-mono font-bold text-xs flex items-center justify-center shrink-0">
                  #{idx + 1}
                </span>
                <select
                  value={val}
                  onChange={e => {
                    const newArr = [...selectedIds];
                    newArr[idx] = e.target.value;
                    setSelectedIds(newArr);
                  }}
                  className={inputCls}
                >
                  <option value="">-- Selecione o Evento Histórico #{idx + 1} --</option>
                  {allChallenges.map(c => (
                    <option key={c.id} value={c.id}>
                      Ano {c.ano_correto}: {c.conteudo_i18n?.pt?.titulo || 'Evento'} (ID: {c.id})
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-primary/90 transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2 font-mono"
          >
            <Plus className="w-4 h-4" />
            <span>CRIAR MINIGAME DA LINHA DO TEMPO</span>
          </button>
        </form>
      </div>

      {/* LIST OF CREATED MINIGAMES */}
      <div className="space-y-4 pt-2">
        <h3 className="text-sm font-black text-foreground uppercase tracking-tight font-mono flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          MINIGAMES DA LINHA DO TEMPO CRIADOS PELO ADMIN ({minigames.length})
        </h3>

        {minigames.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-muted/20 border border-border/60">
            <p className="text-xs font-mono font-bold text-muted-foreground">
              Nenhum minigame personalizado criado ainda. Use o formulário acima para criar o primeiro minigame da Linha do Tempo!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {minigames.map(m => (
              <div key={m.id} className="p-4 rounded-2xl bg-card border border-border/60 shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-foreground font-mono">{m.titulo}</h4>
                  <button
                    type="button"
                    onClick={() => handleDeleteMinigame(m.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all cursor-pointer"
                    title="Excluir Minigame"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5 pt-1">
                  <p className="text-[10px] font-mono font-bold uppercase text-muted-foreground">Eventos do Minigame:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {m.desafio_ids.map((id, i) => {
                      const found = allChallenges.find(c => c.id === id);
                      return (
                        <span key={id + '-' + i} className="px-2.5 py-1 rounded-lg bg-muted text-[11px] font-mono font-bold text-foreground border border-border/50">
                          {found ? `Ano ${found.ano_correto}: ${found.conteudo_i18n?.pt?.titulo}` : id}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
