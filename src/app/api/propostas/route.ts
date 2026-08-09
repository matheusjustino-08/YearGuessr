import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let memoryProposals: any[] = [];

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from('perfis')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const adminClient = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await adminClient
      .from('anuncios_propostas')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const map = new Map();
      memoryProposals.forEach(p => map.set(p.id, p));
      data.forEach(p => map.set(p.id, p));
      return NextResponse.json({ proposals: Array.from(map.values()) });
    }
  } catch {
    // Ignore and fallback
  }

  return NextResponse.json({ proposals: memoryProposals });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const proposalObj = {
      id: body.id || 'prop_' + Date.now(),
      nome: body.nome || body.name || 'Anunciante Sem Nome',
      email: body.email || 'sem-email@anunciante.com',
      linkedin: body.linkedin || body.linkedin_url || null,
      pacote: body.pacote || 'Contato Geral',
      mensagem: body.mensagem || body.message || '',
      created_at: new Date().toISOString(),
    };

    memoryProposals.unshift(proposalObj);

    try {
      const adminClient = createClient(supabaseUrl, supabaseKey);
      await adminClient.from('anuncios_propostas').insert([proposalObj]);
    } catch {
      // Fallback
    }

    return NextResponse.json({ success: true, proposal: proposalObj });
  } catch {
    return NextResponse.json({ error: 'Error processing proposal' }, { status: 500 });
  }
}
