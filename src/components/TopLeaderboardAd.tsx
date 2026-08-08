'use client';

import { useState, useEffect, useRef } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const trackedSessionRef = useRef<Set<string>>(new Set());

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

  // Rotate banner visually (without spamming view count)
  useEffect(() => {
    if (topAds.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % topAds.length);
    }, 7000);

    return () => clearInterval(timer);
  }, [topAds]);

  const currentAd = topAds.length > 0 ? topAds[currentIndex % topAds.length] : null;

  // Track view ONLY when ad container is visible in viewport and ONLY ONCE per session per ad ID
  useEffect(() => {
    if (!currentAd || !currentAd.id) return;
    const adId = currentAd.id;

    // Check if already tracked in this session
    if (trackedSessionRef.current.has(adId)) return;
    try {
      if (sessionStorage.getItem(`ad_view_${adId}`)) {
        trackedSessionRef.current.add(adId);
        return;
      }
    } catch {}

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          trackedSessionRef.current.add(adId);
          try {
            sessionStorage.setItem(`ad_view_${adId}`, '1');
          } catch {}

          fetch('/api/anuncios/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adId, action: 'view' }),
          }).catch(() => {});

          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [currentAd]);

  const handleAdClick = async (ad: any) => {
    if (!ad || !ad.id) return;
    try {
      fetch('/api/anuncios/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId: ad.id, action: 'click' }),
      });
    } catch {
      // Fallback
    }
  };

  if (topAds.length > 0) {
    const currentAd = topAds[currentIndex % topAds.length];

    return (
      <div ref={containerRef} className="w-full max-w-4xl mx-auto mb-4 flex items-center justify-center">
        <div className="h-16 sm:h-20 relative overflow-hidden flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAd.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full flex items-center justify-center"
            >
              <SingleTopAdItem topAd={currentAd} tAd={tAd} handleAdClick={handleAdClick} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mb-4 flex items-center justify-center">
      <div className="w-full h-14 sm:h-16 px-4 rounded-2xl bg-card/70 border border-border/60 backdrop-blur-xl flex items-center justify-between text-card-foreground">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Megaphone className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-foreground">{tAd('sponsor_banner')}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{tAd('sponsor_sub')}</p>
          </div>
        </div>

        <AdvertiseModal
          trigger={
            <button className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-all flex items-center gap-1 cursor-pointer">
              <span>{tAd('announce_now')}</span>
              <Sparkles className="w-3 h-3" />
            </button>
          }
        />
      </div>
    </div>
  );
}
