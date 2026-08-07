'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { Megaphone, MessageSquare, Mail, X, Check, FileText, Send } from 'lucide-react';

export function AdvertiseModal({ trigger }: { trigger?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const tAd = useTranslations('advertise');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsOpen(false);
      setFormData({ name: '', email: '', message: '' });
    }, 3000);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-card text-card-foreground border border-border/60 w-full max-w-xl p-6 sm:p-8 rounded-3xl shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-border/40">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">{tAd('modal_title')}</h2>
            <p className="text-xs text-muted-foreground">{tAd('modal_desc')}</p>
          </div>
        </div>

        {/* Direct Quick Contact Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href="https://wa.me/5511999999999?text=Ol%C3%A1!%20Gostaria%20de%20anunciar%20no%20YearGuessr."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{tAd('btn_whatsapp')}</span>
          </a>

          <a
            href="mailto:anuncie@yearguessr.com?subject=Proposta%20de%20Anuncio%20YearGuessr"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Mail className="w-4 h-4" />
            <span>{tAd('btn_email')}</span>
          </a>
        </div>

        {/* Guidelines & Dimensions Card */}
        <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-wider text-primary">
            <FileText className="w-4 h-4" />
            <span>{tAd('guidelines_title')}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {tAd('guidelines_text')}
          </p>
          <div className="pt-1 flex flex-wrap gap-2 text-[10px] font-mono font-bold text-muted-foreground">
            <span className="px-2.5 py-1 rounded-md bg-card border border-border/50">Letreiro Inferior: 300x50 px</span>
            <span className="px-2.5 py-1 rounded-md bg-card border border-border/50">Leaderboard Topo: 728x90 px</span>
            <span className="px-2.5 py-1 rounded-md bg-card border border-border/50">Patrocínio Desafio Diário</span>
          </div>
        </div>

        {/* Lead Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {submitted ? (
            <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-500 text-xs font-bold text-center flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              <span>{tAd('success_msg')}</span>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-muted-foreground">{tAd('form_name')}</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-xs font-medium focus:ring-2 focus:ring-primary/40"
                  placeholder="Ex: Maria Silva / Empresa XYZ"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-muted-foreground">{tAd('form_email')}</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-xs font-medium focus:ring-2 focus:ring-primary/40"
                  placeholder="seuemail@empresa.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-muted-foreground">{tAd('form_message')}</label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-xs font-medium h-24 focus:ring-2 focus:ring-primary/40"
                  placeholder="Descreva o formato do anúncio ou orçamento pretendido..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>{tAd('form_submit')}</span>
              </button>
            </>
          )}
        </form>

      </div>
    </div>
  );

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {trigger || (
          <button
            type="button"
            className="w-full p-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-500 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Megaphone className="w-4 h-4" />
            <span>{tAd('banner_subtitle')}</span>
          </button>
        )}
      </div>

      {isOpen && mounted && createPortal(modalContent, document.body)}
    </>
  );
}
