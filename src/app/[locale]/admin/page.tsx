'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';
import { 
  ChevronDown, 
  FilePlus, 
  LayoutList, 
  Tag, 
  BookOpen, 
  Megaphone, 
  Lock, 
  Settings 
} from 'lucide-react';
import { ChallengeFormSection } from './_sections/ChallengeFormSection';
import { ChallengeListSection } from './_sections/ChallengeListSection';
import { CategoryManagerSection } from './_sections/CategoryManagerSection';
import { DifficultyGuidelinesSection } from './_sections/DifficultyGuidelinesSection';
import { AdManagerSection } from './_sections/AdManagerSection';

function AdminAccordion({ 
  title, 
  description, 
  icon, 
  children, 
  defaultOpen = false 
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-border/60 rounded-2xl bg-card overflow-hidden transition-all duration-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-muted/40 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
            {icon}
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      
      {isOpen && (
        <div className="px-5 pb-5 pt-2 border-t border-border/40">
          {children}
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const tAdmin = useTranslations('admin');
  const supabase = createClient();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [stats, setStats] = useState({
    totalPartidas: 0,
    totalPerfis: 0,
    totalDesafios: 0,
    totalAnuncios: 0,
    totalPropostas: 0,
    totalViews: 0,
    totalClicks: 0,
  });

  useEffect(() => {
    async function checkRoleAndStats() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        return;
      }
      const { data: profile } = await supabase
        .from('perfis')
        .select('role')
        .eq('id', user.id)
        .single();
      const userIsAdmin = profile?.role === 'admin';
      setIsAdmin(userIsAdmin);

      if (userIsAdmin) {
        try {
          const [
            { count: countPartidas },
            { count: countPerfis },
            { count: countDesafios },
            { data: dataAnuncios },
            { count: countPropostas },
          ] = await Promise.all([
            supabase.from('partidas').select('*', { count: 'exact', head: true }),
            supabase.from('perfis').select('*', { count: 'exact', head: true }),
            supabase.from('desafios').select('*', { count: 'exact', head: true }),
            supabase.from('anuncios').select('visualizacoes, cliques'),
            supabase.from('anuncios_propostas').select('*', { count: 'exact', head: true }),
          ]);

          let views = 0;
          let clicks = 0;
          (dataAnuncios || []).forEach(ad => {
            views += ad.visualizacoes || 0;
            clicks += ad.cliques || 0;
          });

          setStats({
            totalPartidas: countPartidas || 0,
            totalPerfis: countPerfis || 0,
            totalDesafios: countDesafios || 0,
            totalAnuncios: (dataAnuncios || []).length,
            totalPropostas: countPropostas || 0,
            totalViews: views,
            totalClicks: clicks,
          });
        } catch {
          // Fallback stats silently
        }
      }
    }
    checkRoleAndStats();
  }, [supabase]);

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm px-6 py-8 rounded-3xl bg-card border border-border/60 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6 text-destructive" />
          </div>
          <h1 className="text-lg font-bold">{tAdmin('no_permission')}</h1>
          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/"
              className="w-full py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 transition-all text-center"
            >
              {tAdmin('back_to_game')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const ctr = stats.totalViews > 0 ? ((stats.totalClicks / stats.totalViews) * 100).toFixed(1) : '0.0';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-5 border-b border-border/40">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">{tAdmin('title')}</h1>
          <p className="text-xs text-muted-foreground">{tAdmin('subtitle')}</p>
        </div>
      </div>

      {/* Realtime KPI Analytics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-card border border-border/60 shadow-xs space-y-1">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">{tAdmin('kpi_matches')}</p>
          <p className="text-2xl font-black font-mono text-primary">{stats.totalPartidas}</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border/60 shadow-xs space-y-1">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">{tAdmin('kpi_players')}</p>
          <p className="text-2xl font-black font-mono text-amber-500">{stats.totalPerfis}</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border/60 shadow-xs space-y-1">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">{tAdmin('kpi_ad_views')}</p>
          <p className="text-2xl font-black font-mono text-sky-500">{stats.totalViews} <span className="text-xs font-normal text-muted-foreground">({ctr}% CTR)</span></p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border/60 shadow-xs space-y-1">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">{tAdmin('kpi_proposals')}</p>
          <p className="text-2xl font-black font-mono text-emerald-500">{stats.totalPropostas}</p>
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="space-y-3">
        <AdminAccordion
          title={tAdmin('sec_new_challenge')}
          description={tAdmin('sec_new_challenge_desc')}
          icon={<FilePlus className="w-4 h-4" />}
          defaultOpen={true}
        >
          <ChallengeFormSection supabase={supabase} />
        </AdminAccordion>

        <AdminAccordion
          title={tAdmin('sec_published')}
          description={tAdmin('sec_published_desc')}
          icon={<LayoutList className="w-4 h-4" />}
        >
          <ChallengeListSection supabase={supabase} />
        </AdminAccordion>

        <AdminAccordion
          title={tAdmin('sec_categories')}
          description={tAdmin('sec_categories_desc')}
          icon={<Tag className="w-4 h-4" />}
        >
          <CategoryManagerSection supabase={supabase} />
        </AdminAccordion>

        <AdminAccordion
          title={tAdmin('sec_ads')}
          description={tAdmin('sec_ads_desc')}
          icon={<Megaphone className="w-4 h-4" />}
        >
          <AdManagerSection supabase={supabase} />
        </AdminAccordion>

        <AdminAccordion
          title={tAdmin('sec_guidelines')}
          description={tAdmin('sec_guidelines_desc')}
          icon={<BookOpen className="w-4 h-4" />}
        >
          <DifficultyGuidelinesSection />
        </AdminAccordion>
      </div>
    </div>
  );
}
