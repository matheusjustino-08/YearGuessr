import type { SupabaseClient } from '@supabase/supabase-js';

function getLocalDateKey(d = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates current consecutive days streak and all-time best streak for a user
 * based on their recorded matches in `partidas`, and updates `perfis`.
 */
export async function updateAndFetchUserStreak(
  supabase: SupabaseClient,
  userId: string
): Promise<{ streak_atual: number; maior_streak: number }> {
  try {
    // 1. Fetch user's match dates (created_at)
    const { data: matches, error } = await supabase
      .from('partidas')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !matches || matches.length === 0) {
      return { streak_atual: 0, maior_streak: 0 };
    }

    // 2. Extract unique calendar date strings (YYYY-MM-DD)
    const uniqueDatesSet = new Set<string>();
    matches.forEach(m => {
      if (m.created_at) {
        const dateStr = getLocalDateKey(new Date(m.created_at));
        uniqueDatesSet.add(dateStr);
      }
    });

    const uniqueDates = Array.from(uniqueDatesSet).sort((a, b) => (a > b ? -1 : 1)); // descending

    if (uniqueDates.length === 0) {
      return { streak_atual: 0, maior_streak: 0 };
    }

    const todayStr = getLocalDateKey();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateKey(yesterday);

    // 3. Calculate streak_atual
    const mostRecentDate = uniqueDates[0];
    let streakAtual = 0;

    // Active if played today OR yesterday
    if (mostRecentDate === todayStr || mostRecentDate === yesterdayStr) {
      let expectedDate = new Date(mostRecentDate);

      for (const dateStr of uniqueDates) {
        const currentDate = new Date(dateStr);
        const diffInDays = Math.round((expectedDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24));

        if (diffInDays === 0) {
          streakAtual++;
          expectedDate.setDate(expectedDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // 4. Calculate maior_streak (all-time best consecutive streak chain)
    let maiorStreak = 0;
    let tempStreak = 0;
    let expectedChainDate: Date | null = null;

    for (const dateStr of uniqueDates) {
      const curDate = new Date(dateStr);
      if (!expectedChainDate) {
        tempStreak = 1;
        expectedChainDate = new Date(curDate);
        expectedChainDate.setDate(expectedChainDate.getDate() - 1);
      } else {
        const diff = Math.round((expectedChainDate.getTime() - curDate.getTime()) / (1000 * 3600 * 24));
        if (diff === 0) {
          tempStreak++;
          expectedChainDate.setDate(expectedChainDate.getDate() - 1);
        } else {
          maiorStreak = Math.max(maiorStreak, tempStreak);
          tempStreak = 1;
          expectedChainDate = new Date(curDate);
          expectedChainDate.setDate(expectedChainDate.getDate() - 1);
        }
      }
    }
    maiorStreak = Math.max(maiorStreak, tempStreak, streakAtual);

    // 5. Update user profile in Supabase
    await supabase
      .from('perfis')
      .update({
        streak_atual: streakAtual,
        maior_streak: maiorStreak,
      })
      .eq('id', userId);

    return { streak_atual: streakAtual, maior_streak: maiorStreak };
  } catch (err) {
    console.warn('Failed to update streak:', err);
    return { streak_atual: 0, maior_streak: 0 };
  }
}
