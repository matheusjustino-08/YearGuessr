import { getTranslations } from 'next-intl/server';
import { AdvertiseSalesClient } from '../anuncie/AdvertiseSalesClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const tSales = await getTranslations({ locale, namespace: 'sales_page' });

  return {
    title: `Advertise & Sponsorships — YearGuessr`,
    description: tSales('hero_desc'),
    openGraph: {
      title: `Advertise & Sponsorships — YearGuessr`,
      description: tSales('hero_desc'),
      url: 'https://yearguessr.vercel.app/advertise',
      siteName: 'YearGuessr',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=1200&auto=format&fit=crop',
          width: 1200,
          height: 630,
          alt: 'YearGuessr Media Kit',
        },
      ],
      locale: locale === 'en' ? 'en_US' : locale === 'es' ? 'es_ES' : 'pt_BR',
      type: 'website',
    },
  };
}

export default function AdvertisePage() {
  return <AdvertiseSalesClient />;
}
