import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Criar ou atualizar o perfil na tabela pública perfis
        await supabase.from('perfis').upsert(
          {
            id: user.id,
            username: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
            avatar_url: user.user_metadata?.avatar_url,
            e_anonimo: false
          },
          { onConflict: 'id' }
        );
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error('Exchange code error:', error);
  }

  return NextResponse.redirect(`${origin}/?error=auth-failed`);
}
