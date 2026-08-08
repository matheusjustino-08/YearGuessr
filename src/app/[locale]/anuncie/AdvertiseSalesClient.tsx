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

export function AdvertiseSalesClient() {
  const tSales = useTranslations('sales_page');
  const locale = useLocale();

  // Date Checker State
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(tomorrowStr);
  const [themeTopic, setThemeTopic] = useState('');
  const [checkResult, setCheckResult] = useState<{ available: boolean; message: string } | null>(null);

  // Proposal Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState('Desafio Diário de 1 Dia');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactLinkedin, setContactLinkedin] = useState('');
  const [formSent, setFormSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSendProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/propostas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome_empresa: contactName,
          email: contactEmail,
          mensagem: contactMessage,
          linkedin: contactLinkedin,
          pacote: selectedPkg,
          data_reserva: selectedDate || null,
        }),
      });

      if (!res.ok) throw new Error('Falha ao enviar proposta.');
      setFormSent(true);
    } catch (err) {
      console.error(err);
      alert('Ocorreu um erro ao enviar sua proposta. Tente novamente ou use o WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      <main className="flex-grow space-y-16 pb-20">
        {/* Hero Section */}
        <section className="relative pt-12 pb-16 px-4 overflow-hidden border-b border-border/40 bg-radial from-primary/10 via-background to-background">
          <div className="max-w-5xl mx-auto space-y-6 text-center">
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider animate-in fade-in slide-in-from-bottom-2">
              <Sparkles className="w-4 h-4" />
              <span>{tSales('badge')}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight">
              {tSales('hero_title')}
            </h1>

            <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {tSales('hero_desc')}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                onClick={() => { setSelectedPkg('Desafio Diário de 1 Dia'); setIsFormOpen(true); }}
                className="px-6 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Megaphone className="w-4 h-4" />
                <span>Enviar Proposta de Mídia</span>
              </button>

              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md active:scale-95 flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Atendimento via WhatsApp</span>
              </a>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto pt-8">
              {[
                { label: 'Jogadores Ativos', val: '+50.000', icon: <TrendingUp className="w-4 h-4 text-emerald-500" /> },
                { label: 'Visualizações / Mês', val: '+250.000', icon: <Eye className="w-4 h-4 text-blue-500" /> },
                { label: 'CTR Médio dos Banners', val: '4.8%', icon: <MousePointerClick className="w-4 h-4 text-amber-500" /> },
                { label: 'Engajamento Médio', val: '4.2 min/sessão', icon: <Clock className="w-4 h-4 text-purple-500" /> },
              ].map((m, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-card/60 border border-border/50 text-center space-y-1 backdrop-blur-md">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-semibold">
                    {m.icon}
                    <span>{m.label}</span>
                  </div>
                  <p className="text-base sm:text-xl font-black font-mono text-foreground">{m.val}</p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* Date Checker Tool Section */}
        <section className="max-w-4xl mx-auto px-4">
          <div className="p-6 sm:p-8 rounded-3xl bg-card/80 border border-primary/20 shadow-2xl backdrop-blur-xl space-y-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-primary font-mono text-xs font-bold uppercase tracking-wider">
                <Calendar className="w-4 h-4" />
                <span>Calendário de Disponibilidade</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-foreground">
                {tSales('check_availability_title')}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {tSales('check_availability_desc')}
              </p>
            </div>

            <form onSubmit={handleCheckDate} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6 space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider font-mono text-muted-foreground">Data Desejada</label>
                <input
                  type="date"
                  required
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border/70 bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="sm:col-span-6 space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider font-mono text-muted-foreground">Tema da Marca / Evento (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Lançamento do Filme X, História da Empresa Y"
                  value={themeTopic}
                  onChange={(e) => setThemeTopic(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border/70 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="sm:col-span-12 flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  Consultar Disponibilidade de Data
                </button>

                {selectedDate && (
                  <a
                    href={getWhatsAppLink(selectedDate)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-500 flex items-center gap-1"
                  >
                    <span>Reservar esta data no WhatsApp</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </form>

            {checkResult && (
              <div className={`p-4 rounded-2xl border text-xs font-bold animate-in fade-in ${
                checkResult.available 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
              }`}>
                {checkResult.message}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Proposal Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 p-6 sm:p-8 rounded-3xl max-w-md w-full space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-foreground">Solicitar Proposta Comercial</h3>
              <p className="text-xs text-muted-foreground">Preencha seus dados para receber o Mídia Kit oficial.</p>
            </div>

            {formSent ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Proposta enviada com sucesso!</p>
                <p className="text-xs text-muted-foreground">Nossa equipe entrará em contato via e-mail em até 24 horas úteis.</p>
                <button
                  onClick={() => { setFormSent(false); setIsFormOpen(false); }}
                  className="px-4 py-2 bg-muted text-foreground font-bold text-xs rounded-xl"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendProposal} className="space-y-3">
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-muted-foreground">Nome da Empresa / Contato</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border/70 bg-background text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-muted-foreground">E-mail Comercial</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border/70 bg-background text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-muted-foreground">LinkedIn da Empresa (Opcional)</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/company/sua-empresa"
                    value={contactLinkedin}
                    onChange={(e) => setContactLinkedin(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border/70 bg-background text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-muted-foreground">Mensagem / Objetivos</label>
                  <textarea
                    rows={3}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border/70 bg-background text-xs resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
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
