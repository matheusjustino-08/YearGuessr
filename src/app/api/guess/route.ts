import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { User, SupabaseClient } from '@supabase/supabase-js';
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
  let guessYear = 1969;
  let challengeId = 'demo-1969';
  let timeInSeconds = 10;
  let cluesUsed = 0;

  try {
    const body = await request.json();
    if (typeof body.guessYear === 'number') guessYear = body.guessYear;
    if (body.challengeId) challengeId = body.challengeId;
    if (typeof body.timeInSeconds === 'number') timeInSeconds = body.timeInSeconds;
    if (typeof body.cluesUsed === 'number') cluesUsed = body.cluesUsed;
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  let user: User | null = null;
  let supabase: SupabaseClient | null = null;

  try {
    supabase = await createClient();
    const authRes = await supabase.auth.getUser();
    user = authRes.data?.user;
  } catch {
    // Ignore Supabase connection failures gracefully
  }

  // Rate limit check
  if (ratelimit) {
    try {
      const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
      const { success } = await ratelimit.limit(`ratelimit_guess_${ip}`);
      if (!success) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      }
    } catch {
      // Ignore rate limit connection errors
    }
  }

  // 1. Fetch real challenge year from Supabase if available
  let anoCorreto = 1969;
  if (supabase && challengeId && challengeId !== 'demo-1969') {
    try {
      const { data: challenge } = await supabase
        .from('desafios')
        .select('ano_correto')
        .eq('id', challengeId)
        .single();

      if (challenge?.ano_correto) {
        anoCorreto = challenge.ano_correto;
      }
    } catch {
      // Fallback
    }
  }

  // 2. Calculate score
  const errorEmAnos = Math.abs(guessYear - anoCorreto);
  let pontos = 0;

  if (errorEmAnos <= 1) {
    pontos = 5000;
  } else {
    pontos = 5000 - (errorEmAnos * 150) - (cluesUsed * 500) - (timeInSeconds * 2);
    pontos = Math.max(0, pontos);
  }

  const acertou = errorEmAnos <= 1;

  // 3. Store result in Supabase (if user logged in)
  if (supabase && user?.id) {
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
}
