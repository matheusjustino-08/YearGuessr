'use client';

import "./globals.css";
import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <html lang="pt" className="dark">
      <body className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center text-center px-4 font-sans">
        <div className="relative w-56 sm:w-72 h-56 sm:h-72 mb-4 drop-shadow-2xl flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mascot-shrug.png"
            alt="YearGuessr Mascot 404"
            className="w-full h-full object-contain animate-in fade-in slide-in-from-bottom-5 duration-700"
            style={{
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 96%)',
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 96%)',
            }}
          />
        </div>

        <div className="space-y-3 max-w-md">
          <span className="px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
            Erro 404 — Não Encontrado
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Ops! Em que ano essa página foi parar?
          </h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            Procuramos por toda a história, mas a página que você tentou acessar não existe ou mudou de endereço.
          </p>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <Link
            href="/pt"
            className="py-3.5 px-7 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Voltar ao Jogo</span>
          </Link>
        </div>
      </body>
    </html>
  );
}
