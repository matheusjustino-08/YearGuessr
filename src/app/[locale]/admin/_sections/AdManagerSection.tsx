'use client';

import { useState, useEffect } from 'react';
import { Pencil, X, Check, RefreshCw, Eye, MousePointerClick, TrendingUp, Share2, Copy, Inbox, Mail, MessageSquare, Trash2, Calendar } from 'lucide-react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { resolveImageUrl, isConvertibleUrl } from '@/lib/resolveImageUrl';
import { CustomSelect } from '@/components/CustomSelect';

interface Ad {
  id: string;
  titulo: string;
  subtitulo?: string;
  link_destino?: string;
  imagem_url?: string;
  formato: string;
  posicao?: string;
  ativo: boolean;
  mostrar_botao?: boolean;
  texto_botao?: string;
  visualizacoes?: number;
  cliques?: number;
  created_at?: string;
}

interface Proposal {
  id: string;
  nome: string;
  email: string;
  pacote?: string;
  mensagem?: string;
  data_desejada?: string;
  created_at?: string;
}

function formatErrorMessage(err: unknown): string {
  if (!err) return 'Erro desconhecido ao comunicar com o servidor';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null) {
    const obj = err as Record<string, any>;
    if (obj.message && typeof obj.message === 'string') return obj.message;
    if (obj.details && typeof obj.details === 'string') return obj.details;
    if (obj.error_description && typeof obj.error_description === 'string') return obj.error_description;
    try {
      return JSON.stringify(err);
    } catch {
      return String(err);
    }
  }
  return String(err);
}

interface Props { supabase: SupabaseClient }

interface AdFormData {
  titulo: string;
  subtitulo: string;
  link_destino: string;
  imagem_url: string;
  formato: string;
  posicao: string;
  ativo: boolean;
  mostrar_botao: boolean;
  texto_botao: string;
}

const inputCls = 'w-full p-2.5 rounded-xl border border-border/70 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all';
const labelCls = 'block text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-mono mb-1.5';

const EMPTY_AD: AdFormData = {
  titulo: '',
  subtitulo: '',
  link_destino: '',
  imagem_url: '',
  formato: '300x50',
  posicao: 'ambos',
  ativo: true,
  mostrar_botao: true,
  texto_botao: 'Acessar',
};

function AdForm({ data, onChange, onSubmit, submitLabel, saving }: {
  data: AdFormData;
  onChange: (d: AdFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  saving?: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Nome / Identificador do Anúncio (Interno / Análise)</label>
          <input
            type="text"
            required
            placeholder="Ex: Campanha Empresa XYZ - Março 2026"
            className={inputCls}
            value={data.titulo}
            onChange={e => onChange({ ...data, titulo: e.target.value })}
          />
        </div>
        <div>
          <label className={labelCls}>Descrição Interna / Anotações do Cliente</label>
          <input
            type="text"
            placeholder="Descrição ou dados do anunciante"
            className={inputCls}
            value={data.subtitulo}
            onChange={e => onChange({ ...data, subtitulo: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>URL da Imagem ou Código SVG (SVG, PNG, WebP, JPG, GIF)</label>
        <input
          type="text"
          placeholder="Cole o link da imagem (.svg, .png...) ou o código RAW <svg viewBox=...>"
          className={inputCls + ' font-mono text-xs'}
          value={data.imagem_url}
          onChange={e => onChange({ ...data, imagem_url: e.target.value })}
        />
        {data.imagem_url && isConvertibleUrl(data.imagem_url) && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" />
            Link especial detectado — será convertido automaticamente.
          </p>
        )}
        {data.imagem_url && (
          <div className="mt-2 rounded-xl overflow-hidden border border-border/40 h-16 flex items-center justify-center bg-muted/30 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveImageUrl(data.imagem_url)}
              alt="Preview"
              className="w-full h-full object-contain p-1"
              onError={e => { (e.target as HTMLImageElement).style.opacity = '0.3'; }}
            />
          </div>
        )}
        <p className="text-[11px] text-muted-foreground mt-1">Aceita SVG, PNG, WebP, JPG, GIF e Data URIs de qualquer servidor.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Link de Destino</label>
          <input
            type="text"
            placeholder="https://wa.me/55... ou https://site.com"
            className={inputCls}
            value={data.link_destino}
            onChange={e => onChange({ ...data, link_destino: e.target.value })}
          />
        </div>
        <div>
          <label className={labelCls}>Formato do Anúncio</label>
          <CustomSelect
            value={data.formato}
            onChange={val => onChange({ ...data, formato: val })}
            options={[
              { value: '300x50', label: '300x50 — Letreiro Inferior' },
              { value: '728x90', label: '728x90 — Leaderboard Topo' },
            ]}
          />
        </div>
        <div>
          <label className={labelCls}>Posição do Letreiro (Slot)</label>
          <CustomSelect
            value={data.posicao || 'ambos'}
            onChange={val => onChange({ ...data, posicao: val })}
            options={[
              { value: 'ambos', label: 'Ambos / Rotação Geral' },
              { value: 'esquerda', label: 'Esquerda (Slot 1)' },
              { value: 'direita', label: 'Direita (Slot 2)' },
            ]}
          />
        </div>
      </div>

      {/* Button Customization Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/30">
        <div>
          <label className={labelCls}>Exibir Botão de Ação (CTA)</label>
          <button
            type="button"
            onClick={() => onChange({ ...data, mostrar_botao: !data.mostrar_botao })}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              data.mostrar_botao
                ? 'bg-primary/15 text-primary border-primary/40'
                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/40 font-black'
            }`}
          >
            {data.mostrar_botao ? '✓ Botão Habilitado' : '✕ Botão Desabilitado (Sem Botão)'}
          </button>
        </div>

        {data.mostrar_botao && (
          <div>
            <label className={labelCls}>Texto do Botão (Ex: Visitar, Acessar)</label>
            <input
              type="text"
              placeholder="Ex: Acessar, Ver Oferta"
              className={inputCls}
              value={data.texto_botao}
              onChange={e => onChange({ ...data, texto_botao: e.target.value })}
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm cursor-pointer hover:bg-primary/90 transition-colors shadow-md active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Salvando Alterações...</span>
          </>
        ) : (
          <span>{submitLabel}</span>
        )}
      </button>
    </form>
  );
}

export function AdManagerSection({ supabase }: Props) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newAd, setNewAd] = useState<AdFormData>({ ...EMPTY_AD });
  const [editingAd, setEditingAd] = useState<(Ad & AdFormData) | null>(null);
  const [modalError, setModalError] = useState('');
  const [selectedReportAd, setSelectedReportAd] = useState<Ad | null>(null);
  const [msg, setMsg] = useState('');

  const loadAds = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('anuncios')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAds(data || []);
    } catch (err: unknown) {
      showMsg(`Erro ao carregar anúncios: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const loadProposals = async () => {
    let list: Proposal[] = [];
    try {
      const { data } = await supabase.from('anuncios_propostas').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) list = data;
    } catch {
      // Ignore if table missing
    }

    if (typeof window !== 'undefined') {
      try {
        const localProposals: Proposal[] = JSON.parse(localStorage.getItem('yearguessr_advertiser_proposals') || '[]');
        // Merge without duplicates by id or timestamp
        const combined = [...list];
        for (const lp of localProposals) {
          if (!combined.some(item => item.id === lp.id || item.created_at === lp.created_at)) {
            combined.push(lp);
          }
        }
        list = combined;
      } catch {
        // Fallback
      }
    }

    setProposals(list);
  };

  useEffect(() => {
    loadAds();
    loadProposals();
  }, []);

  const showMsg = (txt: string) => {
    setMsg(txt);
    setTimeout(() => setMsg(''), 4000);
  };

  const handleDeleteProposal = async (id: string) => {
    if (!confirm('Deseja remover esta proposta da lista?')) return;
    setProposals(prev => prev.filter(p => p.id !== id));
    if (typeof window !== 'undefined') {
      try {
        const existing: Proposal[] = JSON.parse(localStorage.getItem('yearguessr_advertiser_proposals') || '[]');
        localStorage.setItem('yearguessr_advertiser_proposals', JSON.stringify(existing.filter(p => p.id !== id)));
      } catch {
        // Ignore
      }
    }
    try {
      await supabase.from('anuncios_propostas').delete().eq('id', id);
    } catch {
      // Ignore
    }
  };

  const handleToggle = async (id: string, currentAtivo: boolean) => {
    try {
      const { error } = await supabase.from('anuncios').update({ ativo: !currentAtivo }).eq('id', id);
      if (error) throw error;
      setAds(prev => prev.map(a => a.id === id ? { ...a, ativo: !a.ativo } : a));
    } catch (err: unknown) {
      showMsg(`Erro ao alterar status: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este anúncio?')) return;
    try {
      const { error } = await supabase.from('anuncios').delete().eq('id', id);
      if (error) throw error;
      setAds(prev => prev.filter(a => a.id !== id));
      showMsg('Anúncio excluído.');
    } catch (err: unknown) {
      showMsg(`Erro ao excluir: ${formatErrorMessage(err)}`);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        titulo: newAd.titulo,
        subtitulo: newAd.subtitulo,
        link_destino: newAd.link_destino,
        imagem_url: newAd.imagem_url ? resolveImageUrl(newAd.imagem_url) : null,
        formato: newAd.formato,
        posicao: newAd.posicao || 'ambos',
        ativo: newAd.ativo,
        mostrar_botao: newAd.mostrar_botao,
        texto_botao: newAd.texto_botao || 'Acessar',
      };

      const { error } = await supabase.from('anuncios').insert([payload]);
      if (error) {
        // Fallback to core fields if database table schema doesn't have custom columns
        const corePayload = {
          titulo: newAd.titulo,
          subtitulo: newAd.subtitulo,
          link_destino: newAd.link_destino,
          imagem_url: newAd.imagem_url ? resolveImageUrl(newAd.imagem_url) : null,
          formato: newAd.formato,
          ativo: newAd.ativo,
        };
        const { error: coreErr } = await supabase.from('anuncios').insert([corePayload]);
        if (coreErr) throw coreErr;
      }

      showMsg('Anúncio criado com sucesso!');
      setNewAd({ ...EMPTY_AD });
      await loadAds();
    } catch (err: unknown) {
      showMsg(`Erro ao criar anúncio: ${formatErrorMessage(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAd) return;
    setSaving(true);
    setModalError('');
    try {
      const pos = editingAd.posicao || 'ambos';
      const showBtn = editingAd.mostrar_botao !== false;
      const textBtn = editingAd.texto_botao || 'Acessar';

      // Update local state immediately for smooth response
      setAds(prev => prev.map(a => a.id === editingAd.id ? { ...editingAd, posicao: pos, mostrar_botao: showBtn, texto_botao: textBtn } : a));

      const payload = {
        titulo: editingAd.titulo,
        subtitulo: editingAd.subtitulo,
        link_destino: editingAd.link_destino,
        imagem_url: editingAd.imagem_url ? resolveImageUrl(editingAd.imagem_url) : null,
        formato: editingAd.formato,
        posicao: pos,
        ativo: editingAd.ativo,
        mostrar_botao: showBtn,
        texto_botao: textBtn,
      };

      const { error } = await supabase
        .from('anuncios')
        .update(payload)
        .eq('id', editingAd.id);

      if (error) {
        // Fallback to core fields if schema lacks custom column
        const corePayload = {
          titulo: editingAd.titulo,
          subtitulo: editingAd.subtitulo,
          link_destino: editingAd.link_destino,
          imagem_url: editingAd.imagem_url ? resolveImageUrl(editingAd.imagem_url) : null,
          formato: editingAd.formato,
          ativo: editingAd.ativo,
        };
        const { error: coreErr } = await supabase.from('anuncios').update(corePayload).eq('id', editingAd.id);
        if (coreErr) throw coreErr;
      }

      showMsg('Anúncio atualizado com sucesso!');
      setEditingAd(null);
      await loadAds();
    } catch (err: unknown) {
      const errMsg = formatErrorMessage(err);
      setModalError(`Erro ao salvar: ${errMsg}`);
      showMsg(`Erro ao salvar: ${errMsg}`);
    } finally {
      setSaving(false);
    }
  };

  const copyReportToClipboard = (ad: Ad) => {
    const views = ad.visualizacoes || 0;
    const clicks = ad.cliques || 0;
    const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : '0.0';
    const reportText = `RELATÓRIO DE DESEMPENHO - YEARGUESSR ADS
----------------------------------------
Campanha: ${ad.titulo}
Formato: ${ad.formato}
Posição: ${ad.posicao || 'ambos'}
Status: ${ad.ativo ? 'Ativo' : 'Inativo'}
Visualizações: ${views.toLocaleString('pt-BR')}
Cliques: ${clicks.toLocaleString('pt-BR')}
Taxa de Clique (CTR): ${ctr}%
Link: ${ad.link_destino || 'N/A'}
Data de Registro: ${ad.created_at ? new Date(ad.created_at).toLocaleDateString('pt-BR') : 'N/A'}
----------------------------------------
Gerado por YearGuessr Analytics`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(reportText);
      showMsg('Relatório do anunciante copiado para a área de transferência!');
    }
  };

  return (
    <div className="space-y-8">
      {msg && (
        <div className={`p-3 rounded-xl text-sm font-medium border ${msg.startsWith('Erro') ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-green-500/10 text-green-600 border-green-500/20'}`}>
          {msg}
        </div>
      )}

      {/* PROPOSALS INBOX SECTION */}
      <div className="p-5 sm:p-6 rounded-2xl border-2 border-amber-500/30 bg-amber-500/5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-foreground flex items-center gap-2">
            <Inbox className="w-4 h-4 text-amber-500" />
            <span>Propostas de Anunciantes Recebidas ({proposals.length})</span>
          </h3>
          <button
            type="button"
            onClick={loadProposals}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {proposals.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nenhuma proposta recebida ainda.</p>
        ) : (
          <div className="space-y-3">
            {proposals.map(prop => (
              <div key={prop.id} className="p-4 rounded-xl bg-card border border-border/60 space-y-2 shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      {prop.pacote || 'Contato Geral'}
                    </span>
                    <h4 className="text-xs font-black text-foreground pt-1">{prop.nome}</h4>
                    <p className="text-[11px] font-mono text-muted-foreground">{prop.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {prop.created_at ? new Date(prop.created_at).toLocaleDateString('pt-BR') : 'Hoje'}
                    </span>
                  </div>
                </div>

                {prop.data_desejada && (
                  <p className="text-[11px] font-mono text-emerald-500 font-bold flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Data Desejada: {new Date(prop.data_desejada + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                  </p>
                )}

                {prop.mensagem && (
                  <p className="text-xs text-foreground/90 bg-muted/30 p-2.5 rounded-lg border border-border/40 leading-relaxed">
                    &ldquo;{prop.mensagem}&rdquo;
                  </p>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Olá ${prop.nome}! Vi sua proposta no YearGuessr para o pacote ${prop.pacote || 'Mídia'}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Responder no WhatsApp</span>
                  </a>

                  <a
                    href={`mailto:${prop.email}?subject=Proposta%20YearGuessr%20-${encodeURIComponent(prop.nome)}`}
                    className="py-1 px-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    <Mail className="w-3 h-3" />
                    <span>Responder por E-mail</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleDeleteProposal(prop.id)}
                    className="py-1 px-2 rounded-lg text-rose-500 hover:bg-rose-500/10 text-[10px] font-bold ml-auto cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remover</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Form */}
      <div className="p-5 rounded-2xl border border-border/60 bg-muted/20 space-y-4">
        <h3 className="text-sm font-bold text-foreground">Novo Letreiro / Anúncio</h3>
        <AdForm data={newAd} onChange={setNewAd} onSubmit={handleCreate} submitLabel="Criar Letreiro" saving={saving} />
      </div>

      {/* List & Live Analytics */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center justify-between">
          <span>Letreiros Cadastrados ({ads.length})</span>
        </h3>

        {loading && <p className="text-xs text-muted-foreground">Carregando...</p>}

        {!loading && ads.length === 0 && (
          <p className="text-xs text-muted-foreground py-3">Nenhum anúncio cadastrado.</p>
        )}

        {ads.map(ad => {
          const views = ad.visualizacoes || 0;
          const clicks = ad.cliques || 0;
          const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : '0.0';
          const isButtonEnabled = !(ad.mostrar_botao === false || (ad.mostrar_botao as unknown) === 'false');
          const slotPos = ad.posicao === 'esquerda' ? 'Letreiro Esquerdo' : ad.posicao === 'direita' ? 'Letreiro Direito' : 'Ambos (Rotação)';

          return (
            <div key={ad.id} className="p-5 rounded-2xl border border-border/60 bg-card/60 space-y-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-black truncate text-foreground">{ad.titulo}</p>
                    <span className="text-[10px] font-mono font-bold text-muted-foreground border border-border/50 rounded px-2 py-0.5">{ad.formato}</span>
                    <span className="text-[10px] font-mono font-bold text-sky-500 border border-sky-500/30 rounded px-2 py-0.5 bg-sky-500/10">{slotPos}</span>
                    {!isButtonEnabled ? (
                      <span className="text-[10px] font-mono font-bold text-rose-500 border border-rose-500/30 rounded px-2 py-0.5 bg-rose-500/10">Sem Botão</span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-emerald-500 border border-emerald-500/30 rounded px-2 py-0.5 bg-emerald-500/10">Com Botão ({ad.texto_botao || 'Acessar'})</span>
                    )}
                  </div>
                  {ad.subtitulo && <p className="text-xs text-muted-foreground">{ad.subtitulo}</p>}
                  {ad.link_destino && (
                    <p className="text-[11px] font-mono text-primary truncate">{ad.link_destino}</p>
                  )}
                </div>

                {ad.imagem_url && (
                  <div className="w-20 h-10 rounded-xl overflow-hidden border border-border/40 bg-muted/30 shrink-0 shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ad.imagem_url} alt={ad.titulo} className="w-full h-full object-contain p-0.5" />
                  </div>
                )}
              </div>

              {/* LIVE ANALYTICS CARDS */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-muted/30 border border-border/40">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase text-muted-foreground font-bold">Views</p>
                    <p className="text-xs font-mono font-black text-foreground">{views.toLocaleString('pt-BR')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                    <MousePointerClick className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase text-muted-foreground font-bold">Cliques</p>
                    <p className="text-xs font-mono font-black text-foreground">{clicks.toLocaleString('pt-BR')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase text-muted-foreground font-bold">CTR %</p>
                    <p className="text-xs font-mono font-black text-emerald-500">{ctr}%</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/30">
                <button
                  type="button"
                  onClick={() => handleToggle(ad.id, ad.ativo)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    ad.ativo
                      ? 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30'
                      : 'bg-muted/60 text-muted-foreground border-border/50'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  {ad.ativo ? 'Ativo' : 'Inativo'}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedReportAd(ad)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Relatório do Anunciante
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setModalError('');
                    setEditingAd({
                      ...ad,
                      subtitulo: ad.subtitulo || '',
                      link_destino: ad.link_destino || '',
                      imagem_url: ad.imagem_url || '',
                      posicao: ad.posicao || 'ambos',
                      mostrar_botao: !(ad.mostrar_botao === false || (ad.mostrar_botao as unknown) === 'false'),
                      texto_botao: ad.texto_botao || 'Acessar',
                    });
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-border/60 bg-muted/30 hover:bg-muted text-foreground transition-all cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Editar
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(ad.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all cursor-pointer ml-auto"
                >
                  <X className="w-3.5 h-3.5" />
                  Excluir
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editingAd && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 p-6 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">Editar Letreiro</h3>
              <button
                type="button"
                onClick={() => {
                  setEditingAd(null);
                  setModalError('');
                }}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs font-bold">
                {modalError}
              </div>
            )}

            <AdForm
              data={editingAd}
              onChange={d => setEditingAd(prev => prev ? { ...prev, ...d } : null)}
              onSubmit={handleSaveEdit}
              submitLabel="Salvar Alterações"
              saving={saving}
            />
          </div>
        </div>
      )}

      {/* Advertiser Report Modal */}
      {selectedReportAd && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 p-6 sm:p-8 rounded-3xl max-w-md w-full space-y-5 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setSelectedReportAd(null)}
              className="absolute top-5 right-5 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20">YearGuessr Analytics</span>
              <h3 className="text-xl font-black text-foreground pt-1">{selectedReportAd.titulo}</h3>
              <p className="text-xs text-muted-foreground">{selectedReportAd.subtitulo || 'Relatório de Desempenho Publicitário'}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 text-center">
                <p className="text-[10px] font-mono font-bold uppercase text-muted-foreground">Visualizações</p>
                <p className="text-2xl font-black font-mono text-foreground mt-1">{(selectedReportAd.visualizacoes || 0).toLocaleString('pt-BR')}</p>
              </div>
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 text-center">
                <p className="text-[10px] font-mono font-bold uppercase text-muted-foreground">Cliques Concretos</p>
                <p className="text-2xl font-black font-mono text-amber-500 mt-1">{(selectedReportAd.cliques || 0).toLocaleString('pt-BR')}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
              <p className="text-[10px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">Taxa de Conversão (CTR %)</p>
              <p className="text-3xl font-black font-mono text-emerald-500 mt-0.5">
                {(selectedReportAd.visualizacoes || 0) > 0 ? (((selectedReportAd.cliques || 0) / (selectedReportAd.visualizacoes || 1)) * 100).toFixed(1) : '0.0'}%
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => copyReportToClipboard(selectedReportAd)}
                className="w-full py-3 px-4 rounded-2xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Copy className="w-4 h-4" />
                <span>Copiar Relatório para Anunciante</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
