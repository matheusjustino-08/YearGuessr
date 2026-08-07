import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// We need a Service Role client to bypass RLS and update rows belonging to a different user ID
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { guestId, newUserId } = body;
    
    if (!guestId || !newUserId) {
      return NextResponse.json({ error: 'Missing IDs' }, { status: 400 });
    }

    // Update all matches from the guest to the new authenticated user
    const { data, error } = await supabaseAdmin
      .from('partidas')
      .update({ user_id: newUserId })
      .eq('user_id', guestId);
      
    if (error) {
      console.error('Merge Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Optional: Delete the guest profile if it exists in 'perfis'
    await supabaseAdmin
      .from('perfis')
      .delete()
      .eq('id', guestId);

    return NextResponse.json({ success: true, merged: true });
    
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
