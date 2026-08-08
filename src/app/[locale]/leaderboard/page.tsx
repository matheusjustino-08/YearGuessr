import { LeaderboardViewer } from './LeaderboardViewer';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const tLb = await getTranslations({ locale, namespace: 'leaderboard' });
  return {
    title: `${tLb('title')} — YearGuessr`,
    description: tLb('empty_desc'),
  };
}

export default function LeaderboardPage() {
  return <LeaderboardViewer />;
}
