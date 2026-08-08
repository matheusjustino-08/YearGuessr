import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(request: Request) {
  try {
    const { adId, action } = await request.json();
    if (!adId || !action) {
      return NextResponse.json({ error: 'Missing adId or action' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: ad, error: fetchErr } = await supabase
      .from('anuncios')
      .select('id, visualizacoes, cliques')
      .eq('id', adId)
      .single();

    if (fetchErr || !ad) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    const updatePayload: Record<string, number> = {};
    if (action === 'view') {
      updatePayload.visualizacoes = (ad.visualizacoes || 0) + 1;
    } else if (action === 'click') {
      updatePayload.cliques = (ad.cliques || 0) + 1;
    }

    const { error: updateErr } = await supabase
      .from('anuncios')
      .update(updatePayload)
      .eq('id', adId);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, updated: updatePayload });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
