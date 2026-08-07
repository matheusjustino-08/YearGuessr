'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-12">
      <div className="relative w-56 sm:w-72 h-56 sm:h-72 mb-6 drop-shadow-2xl">
        <Image
          src="/mascot-shrug.png"
          alt="YearGuessr Mascot 404"
          fill
          className="object-contain animate-in fade-in zoom-in duration-500"
          priority
        />
      </div>

      <div className="space-y-3 max-w-md">
        <span className="px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 font-mono text-xs font-bold uppercase tracking-wider">
          Erro 404 — Não Encontrado
        </span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
          Ops! Em que ano essa página foi parar?
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Procuramos por toda a história, mas a página que você tentou acessar não existe ou mudou de endereço.
        </p>
      </div>

      <div className="mt-8 flex items-center gap-3">
        <Link
          href="/pt"
          className="py-3 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <Home className="w-4 h-4" />
          <span>Voltar ao Jogo</span>
        </Link>
      </div>
    </div>
  );
}
