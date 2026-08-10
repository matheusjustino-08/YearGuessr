'use client';

import { useState, useEffect } from 'react';
import { Globe, Plus, Minus, RefreshCw, Sparkles, Zap, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { CustomDatePicker } from '@/components/CustomDatePicker';
import type { SupabaseClient } from '@supabase/supabase-js';
import { useCategories } from './useCategories';
import { resolveImageUrl, isConvertibleUrl } from '@/lib/resolveImageUrl';
import { generateOrganicRulerRange } from '@/lib/ruler-calculator';
import { compressImageToWebP } from '@/lib/image-compressor';
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
  
  // AI Gemini Generator State
  const [showAiPanel, setShowAiPanel] = useState(true);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('yearguessr_gemini_key') || '';
      if (savedKey) setGeminiApiKey(savedKey);
    }
  }, []);

  const handleGenerateWithAi = async () => {
    setIsAiGenerating(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/generate-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic,
          apiKey: geminiApiKey,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Erro ao comunicar com a IA Gemini');
      }

      const data = json.data;

      setFormData((prev) => ({
        ...prev,
        ano_correto: data.ano_correto || 1969,
        minYear: data.minYear || 1800,
        maxYear: data.maxYear || 2026,
        dificuldade: data.dificuldade || 'normal',
        categorias: Array.isArray(data.categorias) && data.categorias.length > 0 ? data.categorias : ['guerra'],
        titulo_pt: data.titulo_pt || '',
        dica_pt: data.dica_pt || '',
        titulo_en: data.titulo_en || '',
        dica_en: data.dica_en || '',
        titulo_es: data.titulo_es || '',
        dica_es: data.dica_es || '',
      }));

      setMessage(
        `✓ Desafio gerado com sucesso pela IA Gemini! Campos preenchidos (Ano ${data.ano_correto}, Dificuldade ${data.dificuldade}). Cole a URL da imagem abaixo!`
      );
    } catch (err: any) {
      setMessage(`Erro na IA: ${err.message || 'Verifique sua API Key do Gemini.'}`);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleAutoGenerateRuler = () => {
    const range = generateOrganicRulerRange(formData.ano_correto, formData.dificuldade as any);
    setFormData(prev => ({
      ...prev,
      minYear: range.minYear,
      maxYear: range.maxYear,
    }));
  };

  const toggleCategory = (catId: string) => {
    setFormData(prev => ({
      ...prev,
      categorias: prev.categorias.includes(catId)
        ? prev.categorias.filter(c => c !== catId)
        : [...prev.categorias, catId],
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setMessage('Comprimindo imagem para WebP...');
      const compressedFile = await compressImageToWebP(file, 1200, 0.82);
      const filePath = `desafios/${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;

      const { error: uploadErr } = await supabase.storage
        .from('desafios')
        .upload(filePath, compressedFile, {
          contentType: 'image/webp',
          cacheControl: '31536000',
          upsert: true,
        });

      if (uploadErr) throw uploadErr;

      const { data: publicUrlData } = supabase.storage.from('desafios').getPublicUrl(filePath);
      if (publicUrlData?.publicUrl) {
        setFormData(prev => ({ ...prev, imagem_principal_url: publicUrlData.publicUrl }));
        setMessage('✓ Imagem comprimida para WebP e enviada com sucesso ao CDN!');
      }
    } catch (err: any) {
      console.warn('Storage upload warning:', err);
      setMessage('Aviso: Certifique-se de criar o bucket public "desafios" no Supabase Storage. Você também pode colar a URL direta.');
    } finally {
      setIsLoading(false);
    }
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
        en: { titulo: formData.titulo_en, dica: formData.dica_en },
        es: { titulo: formData.titulo_es, dica: formData.dica_es },
      };

      const payload = {
        data_publicacao: formData.data_publicacao || new Date().toISOString().split('T')[0],
        ano_correto: Number(formData.ano_correto),
        janela_anos: [Number(formData.minYear), Number(formData.maxYear)],
        imagem_principal: imageUrl,
        conteudo_i18n,
        dificuldade: formData.dificuldade,
        categorias: formData.categorias,
      };

      const { error } = await supabase.from('desafios').insert([payload]);
      if (error) throw error;

      setMessage('✓ Desafio criado com sucesso no banco de dados!');
      setFormData({
        data_publicacao: '',
        ano_correto: 1969,
        minYear: 1800,
        maxYear: 2026,
        titulo_pt: '', titulo_en: '', titulo_es: '',
        dica_pt: '', dica_en: '', dica_es: '',
        imagem_principal_url: '',
        dificuldade: 'normal',
        categorias: ['guerra'],
      });
    } catch (err: any) {
      setMessage(`Erro: ${err.message || 'Falha ao salvar desafio'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = 'w-full p-2.5 rounded-xl border border-border/70 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all';
  const labelCls = 'block text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-mono mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* AI Gemini Challenge Generator Box */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-purple-500/5 to-sky-500/10 border border-amber-500/30 space-y-4 backdrop-blur-md shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/40">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black font-mono uppercase text-foreground">Gerador Inteligente com IA (Gemini API)</h3>
              <p className="text-[11px] text-muted-foreground font-mono">Gere ano, réguas, dificuldade, categorias e textos em PT/EN/ES baseados na escrita do jogo!</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAiPanel(!showAiPanel)}
            className="text-xs font-mono font-bold text-amber-500 hover:underline cursor-pointer"
          >
            {showAiPanel ? 'Ocultar Painel' : 'Abrir Painel IA'}
          </button>
        </div>

        {showAiPanel && (
          <div className="space-y-3 pt-2 border-t border-amber-500/20">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Gemini API Key Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase flex items-center justify-between">
                  <span>Chave API do Gemini</span>
                  <span className="text-[9px] text-amber-500 font-normal">Salva localmente</span>
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={geminiApiKey}
                    onChange={(e) => {
                      setGeminiApiKey(e.target.value);
                      if (typeof window !== 'undefined') localStorage.setItem('yearguessr_gemini_key', e.target.value);
                    }}
                    placeholder="Cole sua chave (AIzaSy...)"
                    className="w-full p-2.5 pr-9 rounded-xl border border-border/70 bg-background text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Challenge Topic Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
                  Tema do Evento (Opcional)
                </label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="Ex: Queda do Muro de Berlim, Invenção da Lâmpada..."
                  className="w-full p-2.5 rounded-xl border border-border/70 bg-background text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateWithAi}
              disabled={isAiGenerating}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 font-mono disabled:opacity-50"
            >
              {isAiGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Consultando Gemini IA...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>⚡ GERAR DESAFIO COMPLETO COM IA GEMINI</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

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
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className={labelCls}>{tAdmin('form_ruler_start')} & {tAdmin('form_ruler_end')}</label>
          <button
            type="button"
            onClick={handleAutoGenerateRuler}
            className="py-1 px-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-mono text-[11px] font-bold hover:bg-amber-500/20 transition-all flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{tAdmin('auto_ruler_btn')}</span>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <input type="number" required className={inputCls} value={formData.minYear} onChange={e => setFormData(p => ({...p, minYear: +e.target.value}))} />
          </div>
          <div className="space-y-1">
            <input type="number" required className={inputCls} value={formData.maxYear} onChange={e => setFormData(p => ({...p, maxYear: +e.target.value}))} />
          </div>
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  sel ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/50'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Image URL & Upload */}
      <div className="space-y-2">
        <label className={labelCls}>{tAdmin('form_image_url')}</label>
        <input
          type="text"
          required
          placeholder="https://..."
          className={inputCls}
          value={formData.imagem_principal_url}
          onChange={e => setFormData(p => ({...p, imagem_principal_url: e.target.value}))}
        />
        <div className="flex items-center gap-2">
          <label className="py-2 px-4 rounded-xl bg-muted border border-border/60 text-xs font-bold hover:bg-muted/80 cursor-pointer transition-all font-mono">
            {tAdmin('upload_file_btn')}
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Multilingual Titles & Hints */}
      <div className="space-y-4 pt-2 border-t border-border/40">
        <h4 className="text-xs font-black uppercase font-mono tracking-wider text-muted-foreground">
          {tAdmin('form_i18n_titles_hints')}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-3 p-3 rounded-2xl bg-muted/20 border border-border/50">
            <span className="text-[10px] font-bold uppercase font-mono text-primary flex items-center gap-1">
              <Globe className="w-3 h-3" /> Português (PT)
            </span>
            <input
              type="text"
              required
              placeholder="Título em Português"
              className={inputCls}
              value={formData.titulo_pt}
              onChange={e => setFormData(p => ({...p, titulo_pt: e.target.value}))}
            />
            <textarea
              required
              rows={3}
              placeholder="Dica em Português"
              className={inputCls}
              value={formData.dica_pt}
              onChange={e => setFormData(p => ({...p, dica_pt: e.target.value}))}
            />
          </div>

          <div className="space-y-3 p-3 rounded-2xl bg-muted/20 border border-border/50">
            <span className="text-[10px] font-bold uppercase font-mono text-sky-500 flex items-center gap-1">
              <Globe className="w-3 h-3" /> English (EN)
            </span>
            <input
              type="text"
              required
              placeholder="Title in English"
              className={inputCls}
              value={formData.titulo_en}
              onChange={e => setFormData(p => ({...p, titulo_en: e.target.value}))}
            />
            <textarea
              required
              rows={3}
              placeholder="Hint in English"
              className={inputCls}
              value={formData.dica_en}
              onChange={e => setFormData(p => ({...p, dica_en: e.target.value}))}
            />
          </div>

          <div className="space-y-3 p-3 rounded-2xl bg-muted/20 border border-border/50">
            <span className="text-[10px] font-bold uppercase font-mono text-amber-500 flex items-center gap-1">
              <Globe className="w-3 h-3" /> Español (ES)
            </span>
            <input
              type="text"
              required
              placeholder="Título en Español"
              className={inputCls}
              value={formData.titulo_es}
              onChange={e => setFormData(p => ({...p, titulo_es: e.target.value}))}
            />
            <textarea
              required
              rows={3}
              placeholder="Pista en Español"
              className={inputCls}
              value={formData.dica_es}
              onChange={e => setFormData(p => ({...p, dica_es: e.target.value}))}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-primary/90 transition-all shadow-xl active:scale-95 cursor-pointer font-mono disabled:opacity-50"
      >
        {isLoading ? 'Salvando...' : 'Salvar Desafio no Banco'}
      </button>
    </form>
  );
}
