'use client';

import { useState, useEffect } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { useCategories } from './useCategories';

const DIFFICULTIES = [
  { id: 'facil', label: 'Fácil', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  { id: 'normal', label: 'Normal', color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { id: 'dificil', label: 'Difícil', color: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30' },
];

interface Props { supabase: SupabaseClient }

const inputCls = 'w-full p-2.5 rounded-xl border border-border/70 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all';
const labelCls = 'block text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-mono mb-1.5';

export function ChallengeListSection({ supabase }: Props) {
  const { categories: AVAILABLE_CATEGORIES } = useCategories(supabase);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [editingChallenge, setEditingChallenge] = useState<any | null>(null);
  const [saveMsg, setSaveMsg] = useState('');

  const loadChallenges = async () => {
    setLoading(true);
    setDbError(null);
    try {
      const { data, error } = await supabase
        .from('desafios')
        .select('*')
        .order('data_publicacao', { ascending: false });
      if (error) setDbError(error.message);
      else if (data) setChallenges(data);
    } catch (err: any) {
      setDbError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadChallenges(); }, []);

  const handleToggleCategory = async (challengeId: string, currentCats: string[], catId: string) => {
    const updated = (currentCats || []).includes(catId)
      ? (currentCats || []).filter(c => c !== catId)
      : [...(currentCats || []), catId];
    setChallenges(prev => prev.map(c => c.id === challengeId ? { ...c, categorias: updated } : c));
    await supabase.from('desafios').update({ categorias: updated }).eq('id', challengeId);
  };

  const handleChangeDifficulty = async (challengeId: string, newDiff: string) => {
    setChallenges(prev => prev.map(c => c.id === challengeId ? { ...c, dificuldade: newDiff } : c));
    await supabase.from('desafios').update({ dificuldade: newDiff }).eq('id', challengeId);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChallenge) return;
    try {
      const { error } = await supabase.from('desafios').update({
        data_publicacao: editingChallenge.data_publicacao,
        ano_correto: editingChallenge.ano_correto,
        janela_anos: editingChallenge.janela_anos,
        conteudo_i18n: editingChallenge.conteudo_i18n,
        imagem_principal: editingChallenge.imagem_principal,
        categorias: editingChallenge.categorias || [],
        dificuldade: editingChallenge.dificuldade || 'normal',
      }).eq('id', editingChallenge.id);

      if (error) throw error;
      setSaveMsg('Salvo com sucesso!');
      setTimeout(() => setSaveMsg(''), 3000);
      setEditingChallenge(null);
      loadChallenges();
    } catch (err: any) {
      setSaveMsg(`Erro: ${err.message}`);
    }
  };

  if (loading) return <p className="text-xs text-muted-foreground py-4">Carregando desafios...</p>;

  const getDiffColor = (d: string) => DIFFICULTIES.find(x => x.id === d)?.color ?? DIFFICULTIES[1].color;
  const getDiffLabel = (d: string) => DIFFICULTIES.find(x => x.id === d)?.label ?? 'Normal';

  return (
    <div className="space-y-4">
      {dbError && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono">
          {dbError}
        </div>
      )}
      {saveMsg && (
        <div className={`p-3 rounded-xl text-xs font-bold ${saveMsg.startsWith('Erro') ? 'bg-destructive/10 text-destructive border border-destructive/20' : 'bg-green-500/10 text-green-600 border border-green-500/20'}`}>
          {saveMsg}
        </div>
      )}

      {challenges.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4">Nenhum desafio encontrado.</p>
      ) : (
        <div className="space-y-2">
          {challenges.map(ch => {
            const title = ch.conteudo_i18n?.pt?.titulo || ch.conteudo_i18n?.en?.titulo || 'Sem título';
            const cats: string[] = ch.categorias || [];
            const diff = ch.dificuldade || 'normal';
            return (
              <div key={ch.id} className="p-4 rounded-2xl border border-border/60 bg-card/50 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{title}</p>
                    <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                      {ch.data_publicacao} — Ano {ch.ano_correto}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getDiffColor(diff)}`}>
                      {getDiffLabel(diff)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingChallenge(JSON.parse(JSON.stringify(ch)))}
                      className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all cursor-pointer"
                      aria-label="Editar desafio"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Inline category toggles */}
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_CATEGORIES.map(cat => {
                    const isSel = cats.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleToggleCategory(ch.id, cats, cat.id)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer border ${
                          isSel
                            ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                            : 'bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted'
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>

                {/* Inline difficulty change */}
                <div className="flex gap-1.5">
                  {DIFFICULTIES.map(d => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleChangeDifficulty(ch.id, d.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer border ${
                        diff === d.id ? d.color + ' font-bold' : 'bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted'
                      }`}
                    >
                      {diff === d.id && <Check className="w-3 h-3 inline mr-1" />}
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editingChallenge && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 p-6 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">Editar Desafio</h3>
              <button
                type="button"
                onClick={() => setEditingChallenge(null)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Data Publicação</label>
                  <input
                    type="date"
                    value={editingChallenge.data_publicacao || ''}
                    onChange={e => setEditingChallenge({ ...editingChallenge, data_publicacao: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Ano Correto</label>
                  <input
                    type="number"
                    value={editingChallenge.ano_correto || 1950}
                    onChange={e => setEditingChallenge({ ...editingChallenge, ano_correto: +e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>URL da Imagem</label>
                <input
                  type="url"
                  value={editingChallenge.imagem_principal || ''}
                  onChange={e => setEditingChallenge({ ...editingChallenge, imagem_principal: e.target.value })}
                  className={inputCls + ' font-mono text-xs'}
                />
              </div>

              {(['pt', 'en', 'es'] as const).map(lang => (
                <div key={lang} className="space-y-2 p-3 rounded-xl bg-muted/20 border border-border/40">
                  <label className={labelCls}>{lang.toUpperCase()}</label>
                  <input
                    type="text"
                    placeholder="Título"
                    value={editingChallenge.conteudo_i18n?.[lang]?.titulo || ''}
                    onChange={e => setEditingChallenge({
                      ...editingChallenge,
                      conteudo_i18n: { ...editingChallenge.conteudo_i18n, [lang]: { ...editingChallenge.conteudo_i18n?.[lang], titulo: e.target.value } }
                    })}
                    className={inputCls}
                  />
                  <textarea
                    placeholder="Dica"
                    value={editingChallenge.conteudo_i18n?.[lang]?.dica || ''}
                    onChange={e => setEditingChallenge({
                      ...editingChallenge,
                      conteudo_i18n: { ...editingChallenge.conteudo_i18n, [lang]: { ...editingChallenge.conteudo_i18n?.[lang], dica: e.target.value } }
                    })}
                    className={inputCls + ' h-16 resize-none'}
                  />
                </div>
              ))}

              <div className="flex gap-2 pt-2 border-t border-border/30">
                <button
                  type="button"
                  onClick={() => setEditingChallenge(null)}
                  className="flex-1 py-2.5 rounded-xl border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
