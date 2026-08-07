'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AdvertiseModal } from './AdvertiseModal';
import { Megaphone, Sparkles, ExternalLink, Award } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { resolveImageUrl } from '@/lib/resolveImageUrl';

export function TopLeaderboardAd() {
  const tAd = useTranslations('advertise');
  const supabase = createClient();
  const [topAd, setTopAd] = useState<any | null>(null);

  useEffect(() => {
    const fetchTopAd = async () => {
      try {
        const { data, error } = await supabase
          .from('anuncios')
          .select('*')
          .eq('ativo', true)
          .eq('formato', '728x90')
          .order('created_at', { ascending: false })
          .limit(1);

        if (!error && data && data.length > 0) {
          const ad = data[0];
          
          if (typeof window !== 'undefined') {
            const localBtnSetting = localStorage.getItem(`yearguessr_ad_showbtn_${ad.id}`);
            if (localBtnSetting !== null) {
              ad.mostrar_botao = localBtnSetting === 'true';
            }
            const localTextSetting = localStorage.getItem(`yearguessr_ad_textbtn_${ad.id}`);
            if (localTextSetting !== null) {
              ad.texto_botao = localTextSetting;
            }
          }

          setTopAd(ad);

          // Track view in background
          try {
            await supabase
              .from('anuncios')
              .update({ visualizacoes: (ad.visualizacoes || 0) + 1 })
              .eq('id', ad.id);
          } catch {
            // Ignore view error silently
          }
        }
      } catch {
        // Fallback
      }
    };

    fetchTopAd();
  }, [supabase]);

  const handleAdClick = async (ad: any) => {
    try {
      await supabase
        .from('anuncios')
        .update({ cliques: (ad.cliques || 0) + 1 })
        .eq('id', ad.id);
    } catch {
      // Ignore click error silently
    }
  };

  // If a 728x90 ad is active in Supabase, render it!
  if (topAd) {
    const imageUrl = topAd.imagem_url ? resolveImageUrl(topAd.imagem_url) : null;
    const showBtn = !(topAd.mostrar_botao === false || topAd.mostrar_botao === 'false');
    const btnText = topAd.texto_botao || tAd('visit_btn');

    if (imageUrl) {
      return (
        <div className="w-full max-w-4xl mx-auto mb-4">
          <a
            href={topAd.link_destino || 'https://wa.me/5511999999999'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleAdClick(topAd)}
            className="w-full h-16 sm:h-20 rounded-2xl border-2 border-amber-500/40 hover:border-amber-500 shadow-xl flex items-center justify-end transition-all duration-300 group cursor-pointer hover:scale-[1.01] overflow-hidden relative bg-card/90"
          >
            {/* FULL UNZOOMED BANNER IMAGE (OBJECT CONTAIN - NO ZOOM) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={topAd.titulo || 'Anúncio Topo'}
              className="absolute inset-0 w-full h-full object-contain p-1"
            />

            {showBtn && (
              <span className="relative z-10 mr-4 px-4 py-2 rounded-full bg-amber-500 text-black font-bold text-xs font-mono shrink-0 group-hover:bg-amber-400 transition-colors flex items-center gap-1.5 shadow-lg">
                <span>{btnText}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </span>
            )}
          </a>
        </div>
      );
    }

    // Fallback text layout if no image is uploaded
    return (
      <div className="w-full max-w-4xl mx-auto mb-4">
        <a
          href={topAd.link_destino || 'https://wa.me/5511999999999'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleAdClick(topAd)}
          className="w-full h-14 sm:h-16 px-4 rounded-2xl bg-card/90 border-2 border-amber-500/40 hover:border-amber-500 shadow-lg backdrop-blur-xl flex items-center justify-between transition-all duration-300 group cursor-pointer hover:scale-[1.01] text-card-foreground overflow-hidden"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/30 shrink-0 group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <div className="min-w-0 text-left flex-1">
              <p className="text-xs sm:text-sm font-black uppercase tracking-tight text-foreground truncate group-hover:text-amber-500 transition-colors">
                {topAd.titulo}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{topAd.subtitulo || tAd('official_sponsor_full')}</p>
            </div>
          </div>

          {showBtn && (
            <span className="px-3 py-1.5 rounded-full bg-amber-500 text-black font-bold text-xs font-mono shrink-0 group-hover:bg-amber-400 transition-colors flex items-center gap-1 shadow-xs">
              <span>{btnText}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </span>
          )}
        </a>
      </div>
    );
  }

  // Fallback default Leaderboard Topo banner (728x90)
  return (
    <div className="w-full max-w-4xl mx-auto mb-4">
      <AdvertiseModal
        trigger={
          <div className="w-full h-14 sm:h-16 px-4 rounded-2xl bg-card/90 border border-border/70 hover:border-primary/50 shadow-md backdrop-blur-xl flex items-center justify-between transition-all duration-300 group cursor-pointer hover:scale-[1.01] text-card-foreground">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0 group-hover:scale-110 transition-transform">
                <Megaphone className="w-5 h-5" />
              </div>
              <div className="min-w-0 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">{tAd('top_leaderboard_tag')}</span>
                  <p className="text-xs sm:text-sm font-black uppercase tracking-tight text-foreground truncate group-hover:text-primary transition-colors">
                    {tAd('master_ad_title')}
                  </p>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{tAd('master_ad_desc')}</p>
              </div>
            </div>

            <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/30 font-bold text-xs font-mono shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{tAd('ad_here_btn')}</span>
            </span>
          </div>
        }
      />
    </div>
  );
}
