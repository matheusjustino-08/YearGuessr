'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AdvertiseModal } from './AdvertiseModal';
import { Building2, Globe2, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { resolveImageUrl } from '@/lib/resolveImageUrl';

export function SideBanners() {
  const tAd = useTranslations('advertise');
  const supabase = createClient();
  const [dynamicAds, setDynamicAds] = useState<any[]>([]);

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
          // Merge local storage button overrides if present
          const processedData = data.map(ad => {
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
            return ad;
          });

          setDynamicAds(processedData);

          // Track ad views in background
          processedData.slice(0, 2).forEach(async (ad) => {
            try {
              await supabase
                .from('anuncios')
                .update({ visualizacoes: (ad.visualizacoes || 0) + 1 })
                .eq('id', ad.id);
            } catch {
              // Ignore view errors silently
            }
          });
        }
      } catch {
        // Fallback to default ads
      }
    };

    fetchAds();
  }, [supabase]);

  const handleAdClick = async (ad: any) => {
    try {
      await supabase
        .from('anuncios')
        .update({ cliques: (ad.cliques || 0) + 1 })
        .eq('id', ad.id);
    } catch {
      // Ignore click errors silently
    }
  };

  // If dynamic ads exist in Supabase, render them in standard 300x50 banner format!
  if (dynamicAds.length > 0) {
    return (
      <div className="w-full max-w-4xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
        {dynamicAds.slice(0, 2).map((ad) => {
          const imageUrl = ad.imagem_url ? resolveImageUrl(ad.imagem_url) : null;
          const showBtn = !(ad.mostrar_botao === false || ad.mostrar_botao === 'false');
          const btnText = ad.texto_botao || tAd('access_btn');

          if (imageUrl) {
            return (
              <a
                key={ad.id}
                href={ad.link_destino || 'https://wa.me/5511999999999'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleAdClick(ad)}
                className="w-full sm:w-[340px] h-[58px] rounded-2xl border border-amber-500/40 hover:border-amber-500 shadow-md flex items-center justify-between transition-all duration-300 group cursor-pointer hover:scale-[1.02] hover:-translate-y-0.5 relative overflow-hidden shrink-0 bg-card/90"
              >
                {/* FULL UNZOOMED BANNER IMAGE (OBJECT CONTAIN - NO ZOOM) */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={ad.titulo || 'Anúncio'}
                  className="absolute inset-0 w-full h-full object-contain p-1"
                />

                {/* Floating CTA Button (If enabled) */}
                {showBtn && (
                  <span className="absolute right-3.5 py-1.5 px-3 rounded-full bg-amber-500 text-black font-bold text-[11px] font-mono shrink-0 group-hover:bg-amber-400 transition-colors flex items-center gap-1 shadow-lg z-10">
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
              key={ad.id}
              href={ad.link_destino || 'https://wa.me/5511999999999'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleAdClick(ad)}
              className="w-full sm:w-[340px] h-[58px] px-4 rounded-2xl bg-card/90 border border-amber-500/40 hover:border-amber-500 shadow-md backdrop-blur-xl flex items-center justify-between transition-all duration-300 group cursor-pointer hover:scale-[1.02] hover:-translate-y-0.5 text-card-foreground overflow-hidden shrink-0"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover:scale-110 transition-transform shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black uppercase tracking-tight text-foreground truncate group-hover:text-amber-500 transition-colors">
                    {ad.titulo}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">{ad.subtitulo || tAd('official_sponsor')}</p>
                </div>
              </div>

              {showBtn && (
                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold font-mono shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors flex items-center gap-1">
                  <span>{btnText}</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              )}
            </a>
          );
        })}
      </div>
    );
  }

  // Fallback to default partnership letreiros (300x50px format)
  return (
    <div className="w-full max-w-4xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
      {/* Left Small Ad Letreiro (300x50px format) */}
      <AdvertiseModal
        trigger={
          <div className="w-full sm:w-[320px] h-[54px] px-4 rounded-2xl bg-card/90 border border-amber-500/30 hover:border-amber-500 shadow-md backdrop-blur-xl flex items-center justify-between transition-all duration-300 group cursor-pointer hover:scale-[1.02] hover:-translate-y-0.5 text-card-foreground">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover:scale-110 transition-transform shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-tight text-foreground truncate group-hover:text-amber-500 transition-colors">
                  {tAd('banner_title')}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">{tAd('partner_label')} (300x50px)</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold font-mono shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              {tAd('advertise_btn')}
            </span>
          </div>
        }
      />

      {/* Right Small Ad Letreiro (300x50px format) */}
      <AdvertiseModal
        trigger={
          <div className="w-full sm:w-[320px] h-[54px] px-4 rounded-2xl bg-card/90 border border-sky-500/30 hover:border-sky-500 shadow-md backdrop-blur-xl flex items-center justify-between transition-all duration-300 group cursor-pointer hover:scale-[1.02] hover:-translate-y-0.5 text-card-foreground">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20 group-hover:scale-110 transition-transform shrink-0">
                <Globe2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-tight text-foreground truncate group-hover:text-sky-500 transition-colors">
                  {tAd('brand_history')}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">{tAd('edition_label')} (300x50px)</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 text-[10px] font-bold font-mono shrink-0 group-hover:bg-sky-500 group-hover:text-white transition-colors">
              {tAd('know_more_btn')}
            </span>
          </div>
        }
      />
    </div>
  );
}
