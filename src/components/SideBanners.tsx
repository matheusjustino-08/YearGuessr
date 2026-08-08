'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { AdvertiseModal } from './AdvertiseModal';
import { Building2, Globe2, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { resolveImageUrl } from '@/lib/resolveImageUrl';
import { motion, AnimatePresence } from 'framer-motion';

function SingleBannerItem({ ad, tAd, handleAdClick }: { ad: any; tAd: any; handleAdClick: (ad: any) => void }) {
  const imageUrl = ad.imagem_url ? resolveImageUrl(ad.imagem_url) : null;
  const showBtn = !(ad.mostrar_botao === false || ad.mostrar_botao === 'false');
  const btnText = ad.texto_botao || tAd('access_btn');

  if (imageUrl) {
    return (
      <a
        href={ad.link_destino || 'https://wa.me/5511999999999'}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => handleAdClick(ad)}
        className="relative inline-flex items-center justify-center cursor-pointer max-w-full h-full"
      >
        {/* PURE IMAGE ONLY - NO CARD BACKGROUND, NO BORDER, NO SHADOW, NO HOVER SCALE */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={ad.titulo || 'Anúncio'}
          className="max-h-[58px] w-auto h-auto object-contain block"
        />

        {/* Optional Floating CTA Button */}
        {showBtn && (
          <span className="absolute right-1 bottom-1 py-1 px-2.5 rounded-full bg-amber-500 text-black font-bold text-[10px] font-mono shrink-0 flex items-center gap-1 shadow-md z-10">
            <span>{btnText}</span>
            <ExternalLink className="w-3 h-3" />
          </span>
        )}
      </a>
    );
  }

  // Fallback text layout if no image is uploaded
  return (
    <a
      href={ad.link_destino || 'https://wa.me/5511999999999'}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => handleAdClick(ad)}
      className="w-full sm:w-[340px] h-[58px] px-4 rounded-2xl bg-card/90 border border-amber-500/40 shadow-md backdrop-blur-xl flex items-center justify-between text-card-foreground overflow-hidden block"
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
          <Building2 className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase tracking-tight text-foreground truncate">
            {ad.titulo}
          </p>
          <p className="text-[10px] text-muted-foreground truncate">{ad.subtitulo || tAd('official_sponsor')}</p>
        </div>
      </div>

      {showBtn && (
        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold font-mono shrink-0 flex items-center gap-1">
          <span>{btnText}</span>
          <ExternalLink className="w-3 h-3" />
        </span>
      )}
    </a>
  );
}

export function SideBanners() {
  const tAd = useTranslations('advertise');
  const supabase = createClient();
  const [leftAds, setLeftAds] = useState<any[]>([]);
  const [rightAds, setRightAds] = useState<any[]>([]);
  const [indexSlot1, setIndexSlot1] = useState(0);
  const [indexSlot2, setIndexSlot2] = useState(0);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const { data, error } = await supabase
          .from('anuncios')
          .select('*')
          .eq('ativo', true)
          .eq('formato', '300x50')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const left = data.filter(ad => !ad.posicao || ad.posicao === 'ambos' || ad.posicao === 'esquerda');
          const right = data.filter(ad => !ad.posicao || ad.posicao === 'ambos' || ad.posicao === 'direita');
          setLeftAds(left);
          setRightAds(right);

          // Initial view count
          if (left[0]) trackView(left[0]);
          if (right[0] && right[0].id !== left[0]?.id) trackView(right[0]);
        }
      } catch {
        // Fallback
      }
    };

    fetchAds();
  }, [supabase]);

  // Automatic Rotation Carousel every 5.5 seconds for Slot 1
  useEffect(() => {
    if (leftAds.length <= 1) return;

    const timer = setInterval(() => {
      setIndexSlot1(prev => {
        const next = (prev + 1) % leftAds.length;
        trackView(leftAds[next]);
        return next;
      });
    }, 5500);

    return () => clearInterval(timer);
  }, [leftAds]);

  // Automatic Rotation Carousel every 5.5 seconds for Slot 2
  useEffect(() => {
    if (rightAds.length <= 1) return;

    const timer = setInterval(() => {
      setIndexSlot2(prev => {
        const next = (prev + 1) % rightAds.length;
        trackView(rightAds[next]);
        return next;
      });
    }, 5500);

    return () => clearInterval(timer);
  }, [rightAds]);

  const trackedViewsRef = useRef<Map<string, number>>(new Map());

  const trackView = async (ad: any) => {
    if (!ad || !ad.id) return;
    const now = Date.now();
    const lastTracked = trackedViewsRef.current.get(ad.id) || 0;

    // Cooldown guard: prevent double counting ad impression within 10s
    if (now - lastTracked < 10000) return;
    trackedViewsRef.current.set(ad.id, now);

    try {
      await fetch('/api/anuncios/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId: ad.id, action: 'view' }),
      });
    } catch {
      // Fallback
    }
  };

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

  const adLeft = leftAds.length > 0 ? leftAds[indexSlot1 % leftAds.length] : null;
  const adRight = rightAds.length > 0 ? rightAds[indexSlot2 % rightAds.length] : null;

  return (
    <div className="w-full max-w-4xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
      {/* Slot 1 (Left Banner Slot) */}
      {adLeft ? (
        <div className="h-[58px] relative overflow-hidden flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={adLeft.id + '-' + indexSlot1}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="h-full flex items-center justify-center"
            >
              <SingleBannerItem ad={adLeft} tAd={tAd} handleAdClick={handleAdClick} />
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        <AdvertiseModal
          trigger={
            <div className="w-full sm:w-[320px] h-[54px] px-4 rounded-2xl bg-card/90 border border-amber-500/30 shadow-md backdrop-blur-xl flex items-center justify-between text-card-foreground">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-tight text-foreground truncate">
                    {tAd('banner_title')}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">{tAd('partner_label')} (300x50px)</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold font-mono shrink-0">
                {tAd('advertise_btn')}
              </span>
            </div>
          }
        />
      )}

      {/* Slot 2 (Right Banner Slot) */}
      {adRight && (adRight.id !== adLeft?.id || adRight.posicao === 'ambos' || (leftAds.length === 1 && rightAds.length === 1)) ? (
        <div className="h-[58px] relative overflow-hidden flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={adRight.id + '-' + indexSlot2}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="h-full flex items-center justify-center"
            >
              <SingleBannerItem ad={adRight} tAd={tAd} handleAdClick={handleAdClick} />
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        <AdvertiseModal
          trigger={
            <div className="w-full sm:w-[340px] h-[58px] px-4 rounded-2xl bg-card/90 border border-sky-500/30 shadow-md backdrop-blur-xl flex items-center justify-between text-card-foreground">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20 shrink-0">
                  <Globe2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-tight text-foreground truncate">
                    {tAd('brand_history')}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">{tAd('edition_label')} (300x50px)</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 text-[10px] font-bold font-mono shrink-0">
                {tAd('know_more_btn')}
              </span>
            </div>
          }
        />
      )}
    </div>
  );
}
