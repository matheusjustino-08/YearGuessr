import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Only create ratelimiter if env vars are present
const ratelimit = process.env.UPSTASH_REDIS_REST_URL
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      analytics: true,
    })
  : null;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Validate auth (guest or registered)
    const { data: { user } } = await supabase.auth.getUser();
    
    const body = await request.json();
    const { guessYear, challengeId, timeInSeconds = 10, cluesUsed = 0, gameMode = 'daily' } = body;
    
    if (typeof guessYear !== 'number' || !challengeId) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Check if logged-in user already completed daily challenge today
    if (user?.id && gameMode === 'daily') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data: existingMatches } = await supabase
        .from('partidas')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', todayStart.toISOString())
        .limit(1);

      if (existingMatches && existingMatches.length > 0) {
        return NextResponse.json(
          { error: 'Daily challenge already completed today' },
          { status: 400 }
        );
      }
    }
    
    // Rate limit check
    if (ratelimit) {
      const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
      const { success } = await ratelimit.limit(`ratelimit_guess_${ip}`);
      if (!success) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      }
    }

    // 1. Fetch real challenge year from Supabase
    let anoCorreto = 1969;
    if (challengeId && challengeId !== 'demo-1969') {
      const { data: challenge } = await supabase
        .from('desafios')
        .select('ano_correto')
        .eq('id', challengeId)
        .single();

      if (challenge?.ano_correto) {
        anoCorreto = challenge.ano_correto;
      }
    }
    
    // 2. Calculate score
    const errorEmAnos = Math.abs(guessYear - anoCorreto);
    let pontos = 0;
    
    if (errorEmAnos <= 1) {
      // Bullseye
      pontos = 5000;
    } else {
      // Formula
      pontos = 5000 - (errorEmAnos * 150) - (cluesUsed * 500) - (timeInSeconds * 2);
      pontos = Math.max(0, pontos);
    }
    
    const acertou = errorEmAnos <= 1;

    // 3. Store result in Supabase (if user logged in)
    if (user?.id) {
      try {
        await supabase.from('partidas').insert({
          user_id: user.id,
          desafio_id: challengeId !== 'demo-1969' ? challengeId : null,
          tentativas: 1,
          acertou,
          pontos,
          tempo_segundos: Math.max(1, timeInSeconds)
        });
      } catch (dbErr) {
        console.warn('Could not record match in Supabase:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      correctYear: anoCorreto,
      distanceOff: errorEmAnos,
      score: pontos,
      isCorrect: acertou,
    });
    
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
