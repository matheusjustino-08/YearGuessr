'use client';

import { useState, useEffect } from 'react';
import { Pencil, Check, X, Trash2, RefreshCw, Globe, AlertTriangle, Sparkles } from 'lucide-react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { useCategories } from './useCategories';
import { resolveImageUrl, isConvertibleUrl } from '@/lib/resolveImageUrl';
import { generateOrganicRulerRange } from '@/lib/ruler-calculator';
import { useTranslations } from 'next-intl';

interface Props { supabase: SupabaseClient }

const inputCls = 'w-full p-2.5 rounded-xl border border-border/70 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all';
const labelCls = 'block text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-mono mb-1.5';

export function ChallengeListSection({ supabase }: Props) {
  const { categories: AVAILABLE_CATEGORIES } = useCategories(supabase);
  const tAdmin = useTranslations('admin');
  const tDiff = useTranslations('difficulty');

  const DIFFICULTIES = [
    { id: 'facil', label: tDiff('facil'), color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    { id: 'normal', label: tDiff('normal'), color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30' },
    { id: 'dificil', label: tDiff('dificil'), color: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30' },
  ];

  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [editingChallenge, setEditingChallenge] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
    setIsSubmitting(true);
    setSaveMsg('');

    try {
      const resolvedImg = resolveImageUrl(editingChallenge.imagem_principal || '');

      const minYr = Number(editingChallenge.minYear ?? (editingChallenge.janela_anos ? editingChallenge.janela_anos[0] : 1800));
      const maxYr = Number(editingChallenge.maxYear ?? (editingChallenge.janela_anos ? editingChallenge.janela_anos[1] : 2026));

      const { data, error } = await supabase.from('desafios').update({
        data_publicacao: editingChallenge.data_publicacao,
        ano_correto: Number(editingChallenge.ano_correto),
        janela_anos: [minYr, maxYr],
        conteudo_i18n: editingChallenge.conteudo_i18n,
        imagem_principal: resolvedImg,
        categorias: editingChallenge.categorias || [],
        dificuldade: editingChallenge.dificuldade || 'normal',
      }).eq('id', editingChallenge.id).select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Nenhuma alteração foi salva no banco (verifique permissões RLS no Supabase).');
      }

      setSaveMsg(tAdmin('form_success'));
      setTimeout(() => setSaveMsg(''), 3000);
      setEditingChallenge(null);
      if (data && data[0]) {
        setChallenges(prev => prev.map(c => c.id === editingChallenge.id ? data[0] : c));
      } else {
        loadChallenges();
      }
    } catch (err: any) {
      setSaveMsg(`Erro: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteChallenge = async (id: string) => {
    try {
      const { error } = await supabase.from('desafios').delete().eq('id', id);
      if (error) throw error;
      setSaveMsg('Desafio excluído com sucesso.');
      setTimeout(() => setSaveMsg(''), 3000);
      setDeletingId(null);
      loadChallenges();
    } catch (err: any) {
      setSaveMsg(`Erro ao excluir: ${err.message}`);
    }
  };

  const startEditing = (ch: any) => {
    const minYr = ch.janela_anos ? ch.janela_anos[0] : 1800;
    const maxYr = ch.janela_anos ? ch.janela_anos[1] : 2026;
    setEditingChallenge({
      ...JSON.parse(JSON.stringify(ch)),
      minYear: minYr,
      maxYear: maxYr,
    });
  };

  if (loading) return <p className="text-xs text-muted-foreground py-4 font-mono">{tAdmin('form_saving')}</p>;

  const getDiffColor = (d: string) => DIFFICULTIES.find(x => x.id === d)?.color ?? DIFFICULTIES[1].color;
  const getDiffLabel = (d: string) => DIFFICULTIES.find(x => x.id === d)?.label ?? 'Normal';

  const filteredChallenges = challenges.filter(c => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    const ptTitle = (c.conteudo_i18n?.pt?.titulo || '').toLowerCase();
    const enTitle = (c.conteudo_i18n?.en?.titulo || '').toLowerCase();
    const esTitle = (c.conteudo_i18n?.es?.titulo || '').toLowerCase();
    const yearStr = String(c.ano_correto || '');
    const dateStr = String(c.data_publicacao || '');
    return ptTitle.includes(term) || enTitle.includes(term) || esTitle.includes(term) || yearStr.includes(term) || dateStr.includes(term);
  });

  const totalPages = Math.ceil(filteredChallenges.length / itemsPerPage) || 1;
  const paginatedChallenges = filteredChallenges.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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

      {/* Search Input Bar */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Buscar desafio por título, ano ou data (YYYY-MM-DD)..."
          className={inputCls}
          value={searchTerm}
          onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        />
      </div>

      {filteredChallenges.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4">Nenhum desafio encontrado para esta busca.</p>
      ) : (
        <div className="space-y-2">
          {paginatedChallenges.map(ch => {
            const title = ch.conteudo_i18n?.pt?.titulo || ch.conteudo_i18n?.en?.titulo || 'Sem título';
            const cats: string[] = ch.categorias || [];
            const diff = ch.dificuldade || 'normal';
            return (
              <div key={ch.id} className="p-4 rounded-2xl border border-border/60 bg-card/50 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{title}</p>
                    <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                      {ch.data_publicacao} — Ano {ch.ano_correto} (Régua: {ch.janela_anos ? `${ch.janela_anos[0]}–${ch.janela_anos[1]}` : '1800–2026'})
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getDiffColor(diff)}`}>
                      {getDiffLabel(diff)}
                    </span>
                    <button
                      type="button"
                      onClick={() => startEditing(ch)}
                      className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all cursor-pointer"
                      aria-label="Editar desafio"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingId(ch.id)}
                      className="p-1.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20 transition-all cursor-pointer"
                      aria-label="Excluir desafio"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs font-mono">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg bg-muted/60 hover:bg-muted text-foreground font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                ← Anterior
              </button>
              <span className="text-muted-foreground font-semibold">
                Página {currentPage} de {totalPages} ({filteredChallenges.length} desafios)
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg bg-muted/60 hover:bg-muted text-foreground font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Próximo →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto text-destructive">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">Excluir Desafio?</h3>
            <p className="text-xs text-muted-foreground">Esta ação não pode ser desfeita. O desafio será removido do banco de dados.</p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 rounded-xl border text-xs font-semibold text-muted-foreground hover:bg-muted/40"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDeleteChallenge(deletingId)}
                className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-xs font-bold hover:bg-destructive/90"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Edit Modal */}
      {editingChallenge && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 p-6 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">Editar Desafio</h3>
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
              {/* Date & Year */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>{tAdmin('form_pub_date')}</label>
                  <input
                    type="date"
                    required
                    value={editingChallenge.data_publicacao || ''}
                    onChange={e => setEditingChallenge({ ...editingChallenge, data_publicacao: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>{tAdmin('form_correct_year')}</label>
                  <input
                    type="number"
                    required
                    value={editingChallenge.ano_correto || 1950}
                    onChange={e => setEditingChallenge({ ...editingChallenge, ano_correto: +e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Timeline Range (Régua min/max) */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-muted/30 border border-border/50">
                <div className="flex items-center justify-between">
                  <label className={labelCls}>{tAdmin('form_ruler_start')} & {tAdmin('form_ruler_end')}</label>
                  <button
                    type="button"
                    onClick={() => {
                      if (!editingChallenge) return;
                      const range = generateOrganicRulerRange(editingChallenge.ano_correto || 1950, editingChallenge.dificuldade || 'normal');
                      setEditingChallenge({
                        ...editingChallenge,
                        minYear: range.minYear,
                        maxYear: range.maxYear,
                      });
                    }}
                    className="py-1.5 px-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-mono text-[11px] font-bold hover:bg-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{tAdmin('auto_ruler_btn')}</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] font-mono text-muted-foreground block mb-1">{tAdmin('form_ruler_start')}</span>
                    <input
                      type="number"
                      required
                      value={editingChallenge.minYear ?? 1800}
                      onChange={e => setEditingChallenge({ ...editingChallenge, minYear: +e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-muted-foreground block mb-1">{tAdmin('form_ruler_end')}</span>
                    <input
                      type="number"
                      required
                      value={editingChallenge.maxYear ?? 2026}
                      onChange={e => setEditingChallenge({ ...editingChallenge, maxYear: +e.target.value })}
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              {/* Difficulty Selection */}
              <div className="space-y-1.5">
                <label className={labelCls}>{tAdmin('form_difficulty')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {DIFFICULTIES.map(d => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setEditingChallenge({ ...editingChallenge, dificuldade: d.id })}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        editingChallenge.dificuldade === d.id
                          ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                          : 'bg-background hover:bg-muted text-muted-foreground border-border/60'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories Selection */}
              <div className="space-y-1.5">
                <label className={labelCls}>{tAdmin('form_categories')}</label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_CATEGORIES.map(cat => {
                    const sel = (editingChallenge.categorias || []).includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          const cur = editingChallenge.categorias || [];
                          const updated = cur.includes(cat.id) ? cur.filter((c: string) => c !== cat.id) : [...cur, cat.id];
                          setEditingChallenge({ ...editingChallenge, categorias: updated });
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                          sel
                            ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                            : 'bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted'
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Image URL */}
              <div className="space-y-1">
                <label className={labelCls}>{tAdmin('form_image_url')}</label>
                <input
                  type="url"
                  required
                  value={editingChallenge.imagem_principal || ''}
                  onChange={e => setEditingChallenge({ ...editingChallenge, imagem_principal: e.target.value })}
                  className={inputCls + ' font-mono text-xs'}
                />
                {editingChallenge.imagem_principal && isConvertibleUrl(editingChallenge.imagem_principal) && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1">
                    <RefreshCw className="w-3 h-3" />
                    {tAdmin('form_drive_detected')}
                  </p>
                )}
              </div>

              {/* Multilingual Content (PT, EN, ES) */}
              {[
                { lang: 'PT', flag: 'Português', key: 'pt' },
                { lang: 'EN', flag: 'English', key: 'en' },
                { lang: 'ES', flag: 'Español', key: 'es' },
              ].map(({ lang, flag, key }) => (
                <div key={key} className="space-y-2 p-3.5 rounded-2xl bg-muted/20 border border-border/40">
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-bold font-mono uppercase text-foreground/80">{flag} ({lang})</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className={labelCls}>{tAdmin('form_title_label')}</label>
                      <input
                        type="text"
                        required={key === 'pt' || key === 'en'}
                        value={editingChallenge.conteudo_i18n?.[key]?.titulo || ''}
                        onChange={e => setEditingChallenge({
                          ...editingChallenge,
                          conteudo_i18n: {
                            ...editingChallenge.conteudo_i18n,
                            [key]: { ...editingChallenge.conteudo_i18n?.[key], titulo: e.target.value }
                          }
                        })}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>{tAdmin('form_hint_label')}</label>
                      <textarea
                        required={key === 'pt' || key === 'en'}
                        value={editingChallenge.conteudo_i18n?.[key]?.dica || ''}
                        onChange={e => setEditingChallenge({
                          ...editingChallenge,
                          conteudo_i18n: {
                            ...editingChallenge.conteudo_i18n,
                            [key]: { ...editingChallenge.conteudo_i18n?.[key], dica: e.target.value }
                          }
                        })}
                        className={inputCls + ' h-16 resize-none'}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex gap-2 pt-2 border-t border-border/30">
                <button
                  type="button"
                  onClick={() => setEditingChallenge(null)}
                  className="flex-1 py-2.5 rounded-xl border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold cursor-pointer hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? tAdmin('form_saving') : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
