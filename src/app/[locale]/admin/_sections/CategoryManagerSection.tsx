'use client';

import { useState, useEffect } from 'react';
import { Plus, X, AlertCircle, RefreshCw } from 'lucide-react';
import type { SupabaseClient } from '@supabase/supabase-js';

// ─── Default categories (seed) used if table doesn't exist / is empty ────────
export const DEFAULT_CATEGORIES = [
  { id: 'guerra',   label: 'Guerra & Conflitos',     icon_url: '' },
  { id: 'ciencia',  label: 'Ciência & Tecnologia',   icon_url: '' },
  { id: 'arte',     label: 'Arte & Cultura',          icon_url: '' },
  { id: 'cinema',   label: 'Cinema & Música',         icon_url: '' },
  { id: 'esportes', label: 'Esportes',                icon_url: '' },
  { id: 'politica', label: 'Política & História',     icon_url: '' },
];

interface Category {
  id: string;
  label: string;
  icon_url?: string;
}

interface Props { supabase: SupabaseClient }

const inputCls = 'w-full p-2.5 rounded-lg border border-border/70 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/50';
const labelCls = 'block text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-mono mb-1';

export function CategoryManagerSection({ supabase }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableExists, setTableExists] = useState(true);
  const [newCat, setNewCat] = useState({ id: '', label: '', icon_url: '' });
  const [msg, setMsg] = useState<{ text: string; type: 'ok' | 'err' } | null>(null);

  const showMsg = (text: string, type: 'ok' | 'err' = 'ok') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 4000);
  };

  const loadCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('label');

      if (error) {
        // Table might not exist — fall back to defaults
        setTableExists(false);
        setCategories(DEFAULT_CATEGORIES);
      } else {
        setTableExists(true);
        setCategories(data?.length ? data : DEFAULT_CATEGORIES);
      }
    } catch {
      setTableExists(false);
      setCategories(DEFAULT_CATEGORIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCategories(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.id.trim() || !newCat.label.trim()) return showMsg('ID e rótulo são obrigatórios.', 'err');

    const idSlug = newCat.id.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    if (tableExists) {
      const { error } = await supabase.from('categorias').insert([{
        id: idSlug,
        label: newCat.label.trim(),
        icon_url: newCat.icon_url.trim() || null,
      }]);
      if (error) return showMsg(`Erro: ${error.message}`, 'err');
    } else {
      // Local-only update
      setCategories(prev => [...prev, { id: idSlug, label: newCat.label.trim(), icon_url: newCat.icon_url.trim() }]);
    }

    setNewCat({ id: '', label: '', icon_url: '' });
    showMsg('Categoria adicionada!');
    if (tableExists) loadCategories();
  };

  const handleRemove = async (id: string) => {
    if (!confirm(`Remover categoria "${id}"? Os desafios que a usam não serão afetados.`)) return;

    if (tableExists) {
      const { error } = await supabase.from('categorias').delete().eq('id', id);
      if (error) return showMsg(`Erro: ${error.message}`, 'err');
      loadCategories();
    } else {
      setCategories(prev => prev.filter(c => c.id !== id));
    }
    showMsg('Categoria removida.');
  };

  const handleUpdateIcon = async (id: string, icon_url: string) => {
    if (tableExists) {
      await supabase.from('categorias').update({ icon_url: icon_url || null }).eq('id', id);
    }
    setCategories(prev => prev.map(c => c.id === id ? { ...c, icon_url } : c));
  };

  const handleUpdateLabel = async (id: string, newLabel: string) => {
    if (!newLabel.trim()) return;
    if (tableExists) {
      await supabase.from('categorias').update({ label: newLabel.trim() }).eq('id', id);
    }
    setCategories(prev => prev.map(c => c.id === id ? { ...c, label: newLabel.trim() } : c));
  };

  return (
    <div className="space-y-5">
      {/* SQL instruction if table doesn't exist */}
      {!tableExists && (
        <div className="p-4 rounded-xl bg-amber-500/8 border border-amber-500/30 space-y-3">
          <div className="flex items-start gap-2 text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="space-y-1.5">
              <p className="text-xs font-semibold">Tabela <code className="font-mono">categorias</code> não existe ainda.</p>
              <p className="text-[11px] text-muted-foreground">Execute o SQL abaixo no Supabase para persistir as categorias no banco:</p>
            </div>
          </div>
          <pre className="text-[11px] font-mono bg-black/20 rounded-lg p-3 overflow-x-auto text-amber-300/80 leading-relaxed">{`CREATE TABLE IF NOT EXISTS categorias (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  icon_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: permitir leitura pública e escrita para admins
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categorias_read" ON categorias FOR SELECT USING (true);
CREATE POLICY "categorias_admin" ON categorias FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');`}
          </pre>
          <p className="text-[11px] text-muted-foreground">Enquanto isso, as alterações abaixo são temporárias (sessão).</p>
        </div>
      )}

      {msg && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-xs font-medium border ${
          msg.type === 'err'
            ? 'bg-destructive/10 text-destructive border-destructive/20'
            : 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20'
        }`}>
          {msg.text}
        </div>
      )}

      {/* Add form */}
      <form onSubmit={handleAdd} className="p-4 rounded-xl border border-border/50 bg-muted/20 space-y-3">
        <p className="text-xs font-semibold text-foreground/70">Nova Categoria</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <label className={labelCls}>ID (slug)</label>
            <input
              type="text"
              required
              placeholder="ex: astronomia"
              className={inputCls}
              value={newCat.id}
              onChange={e => setNewCat(p => ({ ...p, id: e.target.value }))}
            />
            <p className="text-[10px] text-muted-foreground mt-1">Só letras, números e _</p>
          </div>
          <div className="sm:col-span-1">
            <label className={labelCls}>Rótulo</label>
            <input
              type="text"
              required
              placeholder="ex: Astronomia"
              className={inputCls}
              value={newCat.label}
              onChange={e => setNewCat(p => ({ ...p, label: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-1">
            <label className={labelCls}>Ícone SVG (URL)</label>
            <input
              type="url"
              placeholder="https://exemplo.com/icon.svg"
              className={inputCls + ' font-mono text-xs'}
              value={newCat.icon_url}
              onChange={e => setNewCat(p => ({ ...p, icon_url: e.target.value }))}
            />
          </div>
        </div>
        <button
          type="submit"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold cursor-pointer hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar Categoria
        </button>
      </form>

      {/* List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-foreground/70">
            Categorias Ativas
            <span className="ml-1.5 text-[11px] font-mono text-muted-foreground">({categories.length})</span>
          </p>
          <button
            type="button"
            onClick={loadCategories}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            Recarregar
          </button>
        </div>

        {loading ? (
          <p className="text-xs text-muted-foreground py-2">Carregando...</p>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-background hover:bg-muted/20 transition-colors group">
                {/* Icon preview */}
                <div className="w-8 h-8 rounded-lg border border-border/50 bg-muted/40 flex items-center justify-center shrink-0 overflow-hidden">
                  {cat.icon_url ? (
                    cat.icon_url.trim().startsWith('<svg') ? (
                      <span className="w-5 h-5 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: cat.icon_url }} />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cat.icon_url} alt={cat.label} className="w-5 h-5 object-contain" />
                    )
                  ) : (
                    <span className="text-[10px] font-bold text-muted-foreground/50 uppercase">{cat.id.slice(0, 2)}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    className="text-sm font-semibold text-foreground bg-transparent border-b border-transparent hover:border-border/60 focus:border-primary focus:bg-muted/30 focus:outline-none px-1 py-0.5 rounded transition-all w-full"
                    value={cat.label}
                    onChange={e => handleUpdateLabel(cat.id, e.target.value)}
                    onBlur={e => handleUpdateLabel(cat.id, e.target.value)}
                  />
                  <p className="text-[11px] font-mono text-muted-foreground mt-0.5 px-1">{cat.id}</p>
                </div>

                {/* Icon URL input (inline edit) */}
                <input
                  type="text"
                  placeholder="URL do ícone ou <svg>"
                  className="w-32 xs:w-44 sm:w-52 text-[11px] px-2 py-1.5 rounded-lg border border-border/50 bg-muted/30 font-mono focus:outline-none focus:ring-1 focus:ring-primary/30 text-muted-foreground placeholder:text-muted-foreground/40 transition-all truncate"
                  value={cat.icon_url ?? ''}
                  onChange={e => handleUpdateIcon(cat.id, e.target.value)}
                  onBlur={e => handleUpdateIcon(cat.id, e.target.value)}
                />

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => handleRemove(cat.id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
                  aria-label={`Remover ${cat.label}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
