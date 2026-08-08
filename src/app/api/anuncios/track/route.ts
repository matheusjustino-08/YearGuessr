import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Server in-memory fallback stats store so views/clicks are recorded even if DB columns aren't created yet
const statsStore: Record<string, { views: number; clicks: number }> = {};

export async function GET() {
  return NextResponse.json({ stats: statsStore });
}

export async function POST(request: Request) {
  try {
    const { adId, action } = await request.json();
    if (!adId || !action) {
      return NextResponse.json({ error: 'Missing adId or action' }, { status: 400 });
    }

    if (!statsStore[adId]) {
      statsStore[adId] = { views: 0, clicks: 0 };
    }

    if (action === 'view') {
      statsStore[adId].views += 1;
    } else if (action === 'click') {
      statsStore[adId].clicks += 1;
    }

    // Try updating Supabase database
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: ad } = await supabase
        .from('anuncios')
        .select('id, visualizacoes, cliques')
        .eq('id', adId)
        .single();

      if (ad) {
        const updatePayload: Record<string, number> = {};
        if (action === 'view') {
          updatePayload.visualizacoes = (ad.visualizacoes || 0) + 1;
        } else if (action === 'click') {
          updatePayload.cliques = (ad.cliques || 0) + 1;
        }
        await supabase.from('anuncios').update(updatePayload).eq('id', adId);
      }
    } catch {
      // Fallback to statsStore
    }

    return NextResponse.json({ success: true, stats: statsStore[adId] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
