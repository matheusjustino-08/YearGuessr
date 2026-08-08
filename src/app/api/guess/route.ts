import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { User, SupabaseClient } from '@supabase/supabase-js';
import { updateAndFetchUserStreak } from '@/lib/streak-calculator';
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
  let attemptNumber = 1;

  try {
    const body = await request.json();
    if (typeof body.guessYear === 'number') guessYear = body.guessYear;
    if (body.challengeId) challengeId = body.challengeId;
    if (typeof body.timeInSeconds === 'number') timeInSeconds = body.timeInSeconds;
    if (typeof body.cluesUsed === 'number') cluesUsed = body.cluesUsed;
    if (typeof body.attemptNumber === 'number') attemptNumber = body.attemptNumber;
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

  // 2. Continuous Gaussian Exponential Decay Score Calculation
  const errorEmAnos = Math.abs(guessYear - anoCorreto);
  
  // Exponential decay curve: 5000 * e^(-0.018 * distance)
  const baseDistanceScore = 5000 * Math.exp(-0.018 * errorEmAnos);
  const timePenalty = Math.min(300, timeInSeconds * 3);
  const cluePenalty = cluesUsed * 400;

  const rawScore = Math.max(0, baseDistanceScore - timePenalty - cluePenalty);

  // Attempt Multipliers: Attempt 1 = 1.0x (100%), Attempt 2 = 0.72x (72%), Attempt 3 = 0.50x (50%)
  const attemptMultiplier = attemptNumber === 1 ? 1.0 : attemptNumber === 2 ? 0.72 : 0.50;

  const pontos = errorEmAnos === 0 && attemptNumber === 1
    ? 5000
    : Math.max(0, Math.round(rawScore * attemptMultiplier));

  const win = errorEmAnos === 0;
  const gameOver = win || attemptNumber >= 3;
  const direcao = guessYear < anoCorreto ? 'MAIS_RECENTE' : guessYear > anoCorreto ? 'MAIS_ANTIGO' : 'EXATO';
  const badge = errorEmAnos === 0 ? 'NA_MOSCA' : errorEmAnos <= 3 ? 'SUPER_PERTO' : errorEmAnos <= 15 ? 'PERTO' : 'LONGE';

  // 3. Store result in Supabase (if user logged in & game over)
  if (supabase && user?.id && gameOver) {
    try {
      await supabase.from('partidas').insert({
        user_id: user.id,
        desafio_id: challengeId !== 'demo-1969' ? challengeId : null,
        tentativas: attemptNumber,
        acertou: win,
        pontos,
        tempo_segundos: Math.max(1, timeInSeconds)
      });
      await updateAndFetchUserStreak(supabase, user.id);
    } catch (dbErr) {
      console.warn('Could not record match in Supabase:', dbErr);
    }
  }

  return NextResponse.json({
    success: true,
    acertou: win,
    gameOver,
    pontos,
    distancia: errorEmAnos,
    direcao,
    badge,
    // Anti-cheat: correctYear is ONLY revealed when game is over!
    correctYear: gameOver ? anoCorreto : undefined,
  });
}
