'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { 
  Megaphone, Calendar, Sparkles, Award, ArrowLeft, Check, X,
  Clock, ShieldCheck, ChevronRight, HelpCircle, Eye, MousePointerClick, 
  TrendingUp, MessageSquare, Send, CheckCircle2, Zap
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';

export default function AdvertiseSalesPage() {
  const tSales = useTranslations('sales_page');
  const locale = useLocale();
  const supabase = createClient();

  // Date Checker State
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(tomorrowStr);
  const [themeTopic, setThemeTopic] = useState('');
  const [checkResult, setCheckResult] = useState<{ available: boolean; message: string } | null>(null);

  // Proposal Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState('Desafio Diário de 1 Dia Inteiro');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [formSent, setFormSent] = useState(false);

  const handleCheckDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;
    const dateObj = new Date(selectedDate + 'T00:00:00');
    const formatted = dateObj.toLocaleDateString(locale === 'en' ? 'en-US' : locale === 'es' ? 'es-ES' : 'pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const isAvail = dateObj.getTime() > Date.now() - 86400000;
    setCheckResult({
      available: isAvail,
      message: isAvail
        ? `A data ${formatted} está DISPONÍVEL para reserva de Desafio Diário Patrocinado!`
        : `A data ${formatted} já passou. Escolha uma data futura!`
    });
  };

  const getWhatsAppLink = (dateStr?: string, pkg?: string) => {
    const d = dateStr ? new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR') : '';
    const text = `Olá! Gostaria de anunciar no YearGuessr.${
      dateStr ? ` Tenho interesse em patrocinar o Desafio Diário na data: ${d}.` : ''
    }${pkg ? ` Pacote de interesse: ${pkg}.` : ''}${
      themeTopic ? ` Tema pretendido: ${themeTopic}.` : ''
    }`;
    return `https://wa.me/5511999999999?text=${encodeURIComponent(text)}`;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    const proposalObj = {
      id: 'prop_' + Date.now(),
      nome: contactName,
      email: contactEmail,
      pacote: selectedPkg,
      mensagem: contactMessage,
      data_desejada: selectedDate || null,
      tema_pretendido: themeTopic || null,
      lida: false,
      created_at: new Date().toISOString()
    };

    // 1. Save in Supabase database table `anuncios_propostas`
    try {
      await supabase.from('anuncios_propostas').insert([proposalObj]);
    } catch {
      // Ignore if table not present
    }

    // 2. Fallback in LocalStorage for admin dashboard
    if (typeof window !== 'undefined') {
      try {
        const existing = JSON.parse(localStorage.getItem('yearguessr_advertiser_proposals') || '[]');
        localStorage.setItem('yearguessr_advertiser_proposals', JSON.stringify([proposalObj, ...existing]));
      } catch {
        // Fallback
      }
    }

    setSending(false);
    setFormSent(true);

    setTimeout(() => {
      setFormSent(false);
      setIsFormOpen(false);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 space-y-16">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border/60 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Jogo</span>
          </Link>
        </div>

        {/* HERO SECTION */}
        <div className="text-center space-y-6 max-w-3xl mx-auto pt-4 relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-bold font-mono tracking-wide uppercase shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{tSales('badge')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Anuncie & Conecte sua Marca no <span className="text-amber-500">YearGuessr</span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {tSales('hero_desc')}
          </p>

          {/* STATS CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
            <div className="p-4 rounded-2xl bg-card/60 border border-border/60 text-center backdrop-blur-xl">
              <p className="text-2xl sm:text-3xl font-black font-mono text-primary">+50K</p>
              <p className="text-[11px] font-mono text-muted-foreground uppercase font-bold mt-1">Jogadas Mensais</p>
            </div>
            <div className="p-4 rounded-2xl bg-card/60 border border-border/60 text-center backdrop-blur-xl">
              <p className="text-2xl sm:text-3xl font-black font-mono text-emerald-500">100%</p>
              <p className="text-[11px] font-mono text-muted-foreground uppercase font-bold mt-1">Engajamento Real</p>
            </div>
            <div className="p-4 rounded-2xl bg-card/60 border border-border/60 text-center backdrop-blur-xl">
              <p className="text-2xl sm:text-3xl font-black font-mono text-amber-500">300x50</p>
              <p className="text-[11px] font-mono text-muted-foreground uppercase font-bold mt-1">& 728x90 Banners</p>
            </div>
            <div className="p-4 rounded-2xl bg-card/60 border border-border/60 text-center backdrop-blur-xl">
              <p className="text-2xl sm:text-3xl font-black font-mono text-sky-500">SVG/PNG</p>
              <p className="text-[11px] font-mono text-muted-foreground uppercase font-bold mt-1">Suporte Completo</p>
            </div>
          </div>
        </div>

        {/* INTERACTIVE DATE AVAILABILITY CHECKER */}
        <section className="p-6 sm:p-10 rounded-3xl bg-card border-2 border-amber-500/40 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="space-y-2 text-center max-w-2xl mx-auto">
            <span className="text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
              Ferramenta Exclusiva
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{tSales('check_availability_title')}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">{tSales('check_availability_desc')}</p>
          </div>

          <form onSubmit={handleCheckDate} className="max-w-2xl mx-auto space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-muted-foreground mb-1.5">
                  Selecione a Data Desejada
                </label>
                <input
                  type="date"
                  min={tomorrowStr}
                  required
                  className="w-full p-3 rounded-2xl border border-border/70 bg-background text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-muted-foreground mb-1.5">
                  Tema da Empresa (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: História do Cinema, Marcas, Tech..."
                  className="w-full p-3 rounded-2xl border border-border/70 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  value={themeTopic}
                  onChange={e => setThemeTopic(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 text-black font-black text-sm uppercase tracking-wider hover:bg-amber-400 transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 active:scale-98"
            >
              <Calendar className="w-4 h-4" />
              <span>Consultar Disponibilidade de Data</span>
            </button>
          </form>

          {/* CHECK RESULT CARD */}
          {checkResult && (
            <div className={`max-w-2xl mx-auto p-5 rounded-2xl border ${checkResult.available ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-500'} space-y-3 animate-in fade-in duration-300`}>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <p className="text-sm font-bold">{checkResult.message}</p>
              </div>

              {checkResult.available && (
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <a
                    href={getWhatsAppLink(selectedDate, 'Desafio Diário Patrocinado de 1 Dia')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{tSales('reserve_btn')}</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPkg('Desafio Diário de 1 Dia Inteiro');
                      setIsFormOpen(true);
                    }}
                    className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-card border border-border hover:bg-muted text-foreground font-bold text-xs transition-all cursor-pointer"
                  >
                    Enviar Proposta Direta
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* 4 SPONSORSHIP PACKAGES */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">Formatos & Pacotes de Anúncio</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Escolha o formato ideal para atingir seus objetivos de marca e conversão.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Package 1: Letreiros Dinâmicos */}
            <div className="p-6 sm:p-8 rounded-3xl bg-card/60 border border-border/60 space-y-4 hover:border-amber-500/50 transition-all shadow-lg flex flex-col justify-between">
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 w-fit">
                  <Megaphone className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{tSales('pkg_banners_title')}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{tSales('pkg_banners_desc')}</p>
                <ul className="space-y-2 pt-2 text-xs font-medium">
                  <li className="flex items-center gap-2 text-foreground">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Letreiros 300x50px e Leaderboard 728x90px</span>
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Suporta SVG, PNG, WebP, JPG e GIF sem filtro</span>
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Painel Analytics com relatórios de CTR e cliques</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <a
                  href={getWhatsAppLink(undefined, 'Letreiros & Banners Dinâmicos')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-black font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Solicitar Cotação de Banners</span>
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Package 2: Tema Exclusivo */}
            <div className="p-6 sm:p-8 rounded-3xl bg-card/60 border border-border/60 space-y-4 hover:border-sky-500/50 transition-all shadow-lg flex flex-col justify-between">
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-500 w-fit">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{tSales('pkg_theme_title')}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{tSales('pkg_theme_desc')}</p>
                <ul className="space-y-2 pt-2 text-xs font-medium">
                  <li className="flex items-center gap-2 text-foreground">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Categoria com nome e selo da sua marca</span>
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Disponível no filtro de modos para todos os usuários</span>
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Perguntas e imagens personalizadas</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <a
                  href={getWhatsAppLink(undefined, 'Patrocínio de Tema Exclusivo')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30 hover:bg-sky-500 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Patrocinar um Tema Exclusivo</span>
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Package 3: Desafio Diário de 1 Dia */}
            <div className="p-6 sm:p-8 rounded-3xl bg-card/60 border-2 border-emerald-500/40 space-y-4 hover:border-emerald-500 transition-all shadow-xl flex flex-col justify-between relative overflow-hidden">
              <span className="absolute top-4 right-4 text-[9px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-500 text-black">
                Mais Popular
              </span>

              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 w-fit">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{tSales('pkg_daily_title')}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{tSales('pkg_daily_desc')}</p>
                <ul className="space-y-2 pt-2 text-xs font-medium">
                  <li className="flex items-center gap-2 text-foreground">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>100% do tráfego do dia responde ao seu desafio</span>
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Exibição em destaque na tela inicial do jogo</span>
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Reserva exclusiva por data no calendário</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <a
                  href={getWhatsAppLink(selectedDate, 'Desafio Diário de 1 Dia Inteiro')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-95"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Reservar Desafio Diário</span>
                </a>
              </div>
            </div>

            {/* Package 4: Patrocinador Master */}
            <div className="p-6 sm:p-8 rounded-3xl bg-card/60 border border-border/60 space-y-4 hover:border-amber-500/50 transition-all shadow-lg flex flex-col justify-between">
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 w-fit">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{tSales('pkg_master_title')}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{tSales('pkg_master_desc')}</p>
                <ul className="space-y-2 pt-2 text-xs font-medium">
                  <li className="flex items-center gap-2 text-foreground">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Exclusividade no banner Leaderboard (728x90)</span>
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Presença no rodapé e no cartão de compartilhamento</span>
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Relatórios avançados mensais de performance</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <a
                  href={getWhatsAppLink(undefined, 'Patrocinador Master Anual')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-2xl bg-card border border-border hover:bg-muted font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Falar com Gerente de Mídia</span>
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="space-y-6 max-w-3xl mx-auto pt-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Perguntas Frequentes (FAQ)</h2>
            <p className="text-xs text-muted-foreground">Tudo o que você precisa saber sobre como veicular sua marca.</p>
          </div>

          <div className="space-y-3">
            <div className="p-5 rounded-2xl bg-card border border-border/60 space-y-2">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-500" />
                <span>Como funciona a reserva do Desafio Diário?</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Você escolhe uma data disponível no calendário. Naquele dia específico, 100% dos usuários que jogarem o Desafio Diário responderão a perguntas e verão imagens vinculadas à sua empresa ou tema escolhido.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border/60 space-y-2">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-500" />
                <span>Quais formatos de anúncio são aceitos?</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Aceitamos arquivos SVG, PNG, WebP, JPG, GIF ou código SVG puro. Nossos banners exibem a imagem original sem nenhum filtro ou máscara sobreposta.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border/60 space-y-2">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-500" />
                <span>Como acompanho os resultados da minha campanha?</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Fornecemos um link de relatório de desempenho com dados em tempo real de visualizações, cliques concretos e taxa de clique (CTR %). Todas as propostas são enviadas diretamente ao Painel de Administração e notificada via WhatsApp.
              </p>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA BANNER */}
        <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-amber-500/15 via-card to-emerald-500/15 border border-amber-500/30 text-center space-y-6 relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-foreground">Pronto para Conectar sua Marca ao YearGuessr?</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Fale diretamente com nossa equipe via WhatsApp ou envie uma proposta por formulário.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Falar no WhatsApp Agora</span>
            </a>

            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-card border border-border hover:bg-muted font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Enviar Formulário de Contato
            </button>
          </div>
        </section>

      </main>

      {/* PROPOSAL FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 p-6 sm:p-8 rounded-3xl max-w-lg w-full space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">YearGuessr Mídia</span>
              <h3 className="text-xl font-black text-foreground pt-1">Solicitar Proposta Comercial</h3>
              <p className="text-xs text-muted-foreground">Preencha seus dados. A proposta será salva no Painel do Administrador!</p>
            </div>

            {formSent ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-foreground">Proposta Registrada com Sucesso!</p>
                <p className="text-xs text-muted-foreground">Entraremos em contato com você pelo e-mail/WhatsApp informado em breve.</p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-muted-foreground mb-1">Seu Nome ou Empresa</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Maria Silva / Marca XYZ"
                    className="w-full p-2.5 rounded-xl border border-border/70 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-muted-foreground mb-1">E-mail Comercial</label>
                  <input
                    type="email"
                    required
                    placeholder="contato@empresa.com"
                    className="w-full p-2.5 rounded-xl border border-border/70 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-muted-foreground mb-1">Pacote de Interesse</label>
                  <select
                    className="w-full p-2.5 rounded-xl border border-border/70 bg-background text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    value={selectedPkg}
                    onChange={e => setSelectedPkg(e.target.value)}
                  >
                    <option value="Desafio Diário de 1 Dia Inteiro">Desafio Diário de 1 Dia Inteiro</option>
                    <option value="Patrocínio de Tema Exclusivo">Patrocínio de Tema Exclusivo</option>
                    <option value="Letreiros & Banners Dinâmicos">Letreiros & Banners Dinâmicos</option>
                    <option value="Patrocinador Master Anual">Patrocinador Master Anual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-muted-foreground mb-1">Detalhes do Projeto / Mensagem</label>
                  <textarea
                    rows={3}
                    placeholder="Conte um pouco sobre sua marca ou a data que gostaria de patrocinar..."
                    className="w-full p-2.5 rounded-xl border border-border/70 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    value={contactMessage}
                    onChange={e => setContactMessage(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-3 rounded-2xl bg-amber-500 text-black font-bold text-xs uppercase tracking-wider shadow-md hover:bg-amber-400 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{sending ? 'Enviando Proposta...' : 'Enviar Proposta ao Administrador'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
