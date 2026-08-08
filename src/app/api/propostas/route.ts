import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// In-memory fallback proposals array to prevent losing proposals if DB table is missing
let memoryProposals: any[] = [];

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from('anuncios_propostas')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Merge DB proposals with memory proposals
      const map = new Map();
      memoryProposals.forEach(p => map.set(p.id, p));
      data.forEach(p => map.set(p.id, p));
      return NextResponse.json({ proposals: Array.from(map.values()) });
    }
  } catch {
    // Ignore and return memory proposals
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
      pacote: body.pacote || 'Contato Geral',
      mensagem: body.mensagem || body.message || '',
      created_at: new Date().toISOString(),
    };

    memoryProposals.unshift(proposalObj);

    // Try saving to Supabase
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from('anuncios_propostas').insert([proposalObj]);
    } catch {
      // Ignore DB error and rely on memory/local storage
    }

    return NextResponse.json({ success: true, proposal: proposalObj });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error processing proposal' }, { status: 500 });
  }
}
