'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AdvertiseModal } from './AdvertiseModal';
import { Megaphone, Sparkles, ExternalLink, Award } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { resolveImageUrl } from '@/lib/resolveImageUrl';
import { motion, AnimatePresence } from 'framer-motion';

function SingleTopAdItem({ topAd, tAd, handleAdClick }: { topAd: any; tAd: any; handleAdClick: (ad: any) => void }) {
  const imageUrl = topAd.imagem_url ? resolveImageUrl(topAd.imagem_url) : null;
  const showBtn = !(topAd.mostrar_botao === false || topAd.mostrar_botao === 'false');
  const btnText = topAd.texto_botao || tAd('visit_btn');

  if (imageUrl) {
    return (
      <a
        href={topAd.link_destino || 'https://wa.me/5511999999999'}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => handleAdClick(topAd)}
        className="relative inline-flex items-center justify-center cursor-pointer max-w-full h-full"
      >
        {/* PURE IMAGE ONLY - NO CARD BACKGROUND, NO BORDER, NO SHADOW, NO HOVER SCALE */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={topAd.titulo || 'Anúncio Topo'}
          className="max-h-[80px] w-auto h-auto object-contain block"
        />

        {showBtn && (
          <span className="absolute right-3 bottom-2 py-1.5 px-3.5 rounded-full bg-amber-500 text-black font-bold text-xs font-mono shrink-0 flex items-center gap-1.5 shadow-md z-10">
            <span>{btnText}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </span>
        )}
      </a>
    );
  }

  // Fallback text layout if no image is uploaded
  return (
    <a
      href={topAd.link_destino || 'https://wa.me/5511999999999'}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => handleAdClick(topAd)}
      className="w-full h-14 sm:h-16 px-4 rounded-2xl bg-card/90 border-2 border-amber-500/40 shadow-lg backdrop-blur-xl flex items-center justify-between text-card-foreground overflow-hidden block"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/30 shrink-0">
          <Award className="w-5 h-5" />
        </div>
        <div className="min-w-0 text-left flex-1">
          <p className="text-xs sm:text-sm font-black uppercase tracking-tight text-foreground truncate">
            {topAd.titulo}
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{topAd.subtitulo || tAd('official_sponsor_full')}</p>
        </div>
      </div>

      {showBtn && (
        <span className="px-3 py-1.5 rounded-full bg-amber-500 text-black font-bold text-xs font-mono shrink-0 flex items-center gap-1 shadow-xs">
          <span>{btnText}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </span>
      )}
    </a>
  );
}

export function TopLeaderboardAd() {
  const tAd = useTranslations('advertise');
  const supabase = createClient();
  const [topAds, setTopAds] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchTopAds = async () => {
      try {
        const { data, error } = await supabase
          .from('anuncios')
          .select('*')
          .eq('ativo', true)
          .eq('formato', '728x90')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          setTopAds(data);
        }
      } catch {
        // Fallback
      }
    };

    fetchTopAds();
  }, [supabase]);

  // Rotate Top Ads every 5.5 seconds if multiple active 728x90 ads exist
  useEffect(() => {
    if (topAds.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => {
        const next = (prev + 1) % topAds.length;
        trackView(topAds[next]);
        return next;
      });
    }, 5500);

    return () => clearInterval(timer);
  }, [topAds]);

  const trackView = async (ad: any) => {
    if (!ad) return;
    try {
      await supabase
        .from('anuncios')
        .update({ visualizacoes: (ad.visualizacoes || 0) + 1 })
        .eq('id', ad.id);
    } catch {
      // Ignore
    }
  };

  const handleAdClick = async (ad: any) => {
    try {
      await supabase
        .from('anuncios')
        .update({ cliques: (ad.cliques || 0) + 1 })
        .eq('id', ad.id);
    } catch {
      // Ignore
    }
  };

  // Render rotating 728x90 top ads
  if (topAds.length > 0) {
    const currentAd = topAds[currentIndex % topAds.length];

    return (
      <div className="w-full max-w-4xl mx-auto mb-4 flex items-center justify-center">
        <div className="h-16 sm:h-20 relative overflow-hidden flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAd.id + '-' + currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.45, ease: 'easeInOut' }}
              className="h-full flex items-center justify-center"
            >
              <SingleTopAdItem topAd={currentAd} tAd={tAd} handleAdClick={handleAdClick} />
            </motion.div>
          </AnimatePresence>
        </div>
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
