'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Settings, FilePlus, LayoutList, Megaphone, BookOpen, Lock, Tag } from 'lucide-react';
import { AdminAccordion } from './_sections/AdminAccordion';
import { ChallengeFormSection } from './_sections/ChallengeFormSection';
import { ChallengeListSection } from './_sections/ChallengeListSection';
import { AdManagerSection } from './_sections/AdManagerSection';
import { DifficultyGuidelinesSection } from './_sections/DifficultyGuidelinesSection';
import { CategoryManagerSection } from './_sections/CategoryManagerSection';

export default function AdminPage() {
  const supabase = createClient();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsAdmin(false); return; }
      const { data: profile } = await supabase
        .from('perfis')
        .select('role')
        .eq('id', user.id)
        .single();
      setIsAdmin(profile?.role === 'admin');
    };
    checkAdmin();
  }, [supabase]);

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm px-4">
          <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6 text-destructive" />
          </div>
          <h1 className="text-xl font-bold">Acesso Restrito</h1>
          <p className="text-sm text-muted-foreground">
            Você não tem permissão para acessar o painel de administração.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 pb-5 border-b border-border/40">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">Painel CMS</h1>
          <p className="text-xs text-muted-foreground">Gerencie desafios, anúncios e configurações do YearGuessr</p>
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="space-y-3">
        <AdminAccordion
          title="Novo Desafio"
          description="Cadastrar um novo desafio histórico"
          icon={<FilePlus className="w-4 h-4" />}
          defaultOpen={true}
        >
          <ChallengeFormSection supabase={supabase} />
        </AdminAccordion>

        <AdminAccordion
          title="Desafios Publicados"
          description="Editar categorias, dificuldade e dados dos desafios existentes"
          icon={<LayoutList className="w-4 h-4" />}
        >
          <ChallengeListSection supabase={supabase} />
        </AdminAccordion>

        <AdminAccordion
          title="Gerenciador de Categorias"
          description="Adicionar, editar e remover categorias disponíveis para os desafios"
          icon={<Tag className="w-4 h-4" />}
        >
          <CategoryManagerSection supabase={supabase} />
        </AdminAccordion>

        <AdminAccordion
          title="Anúncios e Letreiros"
          description="Letreiros publicitários exibidos no jogo (300×50 e 728×90)"
          icon={<Megaphone className="w-4 h-4" />}
        >
          <AdManagerSection supabase={supabase} />
        </AdminAccordion>

        <AdminAccordion
          title="Diretrizes de Dificuldade"
          description="Critérios objetivos para classificar cada desafio"
          icon={<BookOpen className="w-4 h-4" />}
        >
          <DifficultyGuidelinesSection />
        </AdminAccordion>
      </div>
    </div>
  );
}
