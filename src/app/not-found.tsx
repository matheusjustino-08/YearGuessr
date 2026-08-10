'use client';

import './globals.css';
import Link from 'next/link';
import Image from 'next/image';
import { Home, Trophy, ArrowRight, Sparkles, History } from 'lucide-react';

export default function NotFound() {
  return (
    <html lang="pt" className="dark">
      <body className="min-h-screen bg-[#09090b] text-foreground flex flex-col items-center justify-center text-center px-4 font-sans relative overflow-hidden selection:bg-amber-500/30 selection:text-amber-400">
        
        {/* Background Grid Pattern & Glowing Orbs */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* 404 Giant Watermark Backing */}
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[14rem] sm:text-[22rem] font-mono font-black text-amber-500/[0.04] select-none pointer-events-none tracking-tighter">
          404
        </span>

        {/* Main Content Box */}
        <div className="relative z-10 max-w-lg w-full space-y-6 p-8 sm:p-10 rounded-3xl bg-card/60 border border-border/70 backdrop-blur-2xl shadow-2xl animate-in zoom-in-95 duration-300">
          
          {/* Mascot Image with Baked Soft Alpha Gradient */}
          <div className="relative w-44 h-44 sm:w-52 sm:h-52 mx-auto drop-shadow-2xl -mt-4 -mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mascot-shrug.png"
              alt="YearGuessr Mascot 404"
              className="w-full h-full object-contain animate-in fade-in slide-in-from-bottom-5 duration-700"
              style={{
                WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 90%)',
                maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 90%)',
              }}
            />
          </div>

          {/* Badge & Typography */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 dark:text-amber-400 font-mono text-[11px] font-bold uppercase tracking-wider shadow-xs">
              <History className="w-3.5 h-3.5" />
              <span>404 — Página Perdida no Tempo</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground font-sans">
              Ops! Em que ano essa página foi parar?
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
              Procuramos por toda a linha do tempo histórica, mas este endereço não existe ou foi transportado para outra época.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/pt"
              className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Voltar ao Jogo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/pt/ranking"
              className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-muted/60 hover:bg-muted border border-border/60 text-foreground font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Ver Ranking</span>
            </Link>
          </div>
        </div>

        {/* Footer Brand Credit */}
        <p className="relative z-10 mt-8 text-[11px] font-mono text-muted-foreground/60">
          YearGuessr &copy; {new Date().getFullYear()} &bull; Todos os direitos reservados
        </p>

      </body>
    </html>
  );
}
