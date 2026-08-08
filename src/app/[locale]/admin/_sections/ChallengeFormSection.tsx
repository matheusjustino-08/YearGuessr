'use client';

import { useState } from 'react';
import { Globe, Plus, Minus, RefreshCw } from 'lucide-react';
import { CustomDatePicker } from '@/components/CustomDatePicker';
import type { SupabaseClient } from '@supabase/supabase-js';
import { useCategories } from './useCategories';
import { resolveImageUrl, isConvertibleUrl } from '@/lib/resolveImageUrl';
import { useTranslations } from 'next-intl';

interface Props { supabase: SupabaseClient }

export function ChallengeFormSection({ supabase }: Props) {
  const { categories: AVAILABLE_CATEGORIES } = useCategories(supabase);
  const tAdmin = useTranslations('admin');
  const tDiff = useTranslations('difficulty');

  const DIFFICULTIES = [
    { id: 'facil', label: tDiff('facil'), desc: tAdmin('diff_easy_desc') },
    { id: 'normal', label: tDiff('normal'), desc: tAdmin('diff_normal_desc') },
    { id: 'dificil', label: tDiff('dificil'), desc: tAdmin('diff_hard_desc') },
  ];

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    data_publicacao: '',
    ano_correto: 1969,
    minYear: 1800,
    maxYear: 2026,
    titulo_pt: '', titulo_en: '', titulo_es: '',
    dica_pt: '', dica_en: '', dica_es: '',
    imagem_principal_url: '',
    dificuldade: 'normal',
    categorias: ['guerra'] as string[],
  });

  const toggleCategory = (catId: string) => {
    setFormData(prev => ({
      ...prev,
      categorias: prev.categorias.includes(catId)
        ? prev.categorias.filter(c => c !== catId)
        : [...prev.categorias, catId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    try {
      const imageUrl = resolveImageUrl(formData.imagem_principal_url.trim());
      if (!imageUrl) throw new Error('Informe a URL da imagem do desafio.');

      const conteudo_i18n = {
        pt: { titulo: formData.titulo_pt, dica: formData.dica_pt },
        en: { titulo: formData.titulo_en || formData.titulo_pt, dica: formData.dica_en || formData.dica_pt },
        es: { titulo: formData.titulo_es || formData.titulo_pt, dica: formData.dica_es || formData.dica_pt },
      };

      const { error } = await supabase.from('desafios').insert({
        data_publicacao: formData.data_publicacao,
        ano_correto: formData.ano_correto,
        janela_anos: [formData.minYear, formData.maxYear],
        conteudo_i18n,
        imagem_principal: imageUrl,
        categorias: formData.categorias,
        dificuldade: formData.dificuldade,
      });

      if (error) throw error;
      setMessage(tAdmin('form_success'));
    } catch (err: any) {
      setMessage(`Erro: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = 'w-full p-2.5 rounded-xl border border-border/70 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all';
  const labelCls = 'block text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-mono mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className={`p-3 rounded-xl text-sm font-medium border ${message.startsWith('Erro') ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-green-500/10 text-green-600 border-green-500/20'}`}>
          {message}
        </div>
      )}

      {/* Date & Year */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-1 space-y-1">
          <label className={labelCls}>{tAdmin('form_pub_date')}</label>
          <CustomDatePicker value={formData.data_publicacao} onChange={v => setFormData(p => ({...p, data_publicacao: v}))} />
        </div>
        <div className="space-y-1">
          <label className={labelCls}>{tAdmin('form_correct_year')}</label>
          <input type="number" required className={inputCls} value={formData.ano_correto} onChange={e => setFormData(p => ({...p, ano_correto: +e.target.value}))} />
        </div>
        <div className="hidden" />
      </div>

      {/* Timeline Range */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className={labelCls}>{tAdmin('form_ruler_start')}</label>
          <input type="number" required className={inputCls} value={formData.minYear} onChange={e => setFormData(p => ({...p, minYear: +e.target.value}))} />
        </div>
        <div className="space-y-1">
          <label className={labelCls}>{tAdmin('form_ruler_end')}</label>
          <input type="number" required className={inputCls} value={formData.maxYear} onChange={e => setFormData(p => ({...p, maxYear: +e.target.value}))} />
        </div>
      </div>

      {/* Difficulty */}
      <div className="space-y-2">
        <label className={labelCls}>{tAdmin('form_difficulty')}</label>
        <div className="grid grid-cols-3 gap-2">
          {DIFFICULTIES.map(d => (
            <button
              key={d.id}
              type="button"
              onClick={() => setFormData(p => ({...p, dificuldade: d.id}))}
              className={`p-3 rounded-xl text-xs font-bold transition-all cursor-pointer border text-left space-y-1 ${
                formData.dificuldade === d.id
                  ? 'bg-primary/10 text-primary border-primary/40 ring-1 ring-primary/20'
                  : 'bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/50'
              }`}
            >
              <div>{d.label}</div>
              <div className="text-[10px] font-normal opacity-70 leading-snug">{d.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <label className={labelCls}>{tAdmin('form_categories')}</label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_CATEGORIES.map(cat => {
            const sel = formData.categorias.includes(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                  sel
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : 'bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted'
                }`}
              >
                {sel ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* I18n Content */}
      <div className="space-y-4">
        {[
          { lang: 'PT', flag: 'Português', tKey: 'pt' },
          { lang: 'EN', flag: 'English', tKey: 'en' },
          { lang: 'ES', flag: 'Español', tKey: 'es' },
        ].map(({ lang, flag, tKey }) => (
          <div key={lang} className="p-4 rounded-xl border border-border/50 bg-muted/20 space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-bold font-mono uppercase text-foreground/80">{flag} ({lang})</span>
              {lang !== 'PT' && <span className="text-[10px] text-muted-foreground">{tAdmin('form_fallback_hint')}</span>}
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1">
                <label className={labelCls}>{tAdmin('form_title_label')}</label>
                <input
                  type="text"
                  required={lang === 'PT' || lang === 'EN'}
                  className={inputCls}
                  value={(formData as any)[`titulo_${tKey}`]}
                  onChange={e => setFormData(p => ({...p, [`titulo_${tKey}`]: e.target.value}))}
                />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>{tAdmin('form_hint_label')}</label>
                <textarea
                  required={lang === 'PT' || lang === 'EN'}
                  className={`${inputCls} h-20 resize-none`}
                  value={(formData as any)[`dica_${tKey}`]}
                  onChange={e => setFormData(p => ({...p, [`dica_${tKey}`]: e.target.value}))}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Image URL */}
      <div className="space-y-1">
        <label className={labelCls}>{tAdmin('form_image_url')}</label>
        <input
          type="url"
          required
          placeholder="https://images.unsplash.com/photo-... ou qualquer URL direta"
          className={inputCls + ' font-mono text-xs'}
          value={formData.imagem_principal_url}
          onChange={e => setFormData(p => ({...p, imagem_principal_url: e.target.value}))}
        />
        <p className="text-[11px] text-muted-foreground">{tAdmin('form_image_hint')}</p>
        {formData.imagem_principal_url && isConvertibleUrl(formData.imagem_principal_url) && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5">
            <RefreshCw className="w-3 h-3" />
            {tAdmin('form_drive_detected')}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer text-sm tracking-wide"
      >
        {isLoading ? tAdmin('form_saving') : tAdmin('form_publish_btn')}
      </button>
    </form>
  );
}
