import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { generateOrganicRulerRange } from '@/lib/ruler-calculator';

export function getLocalDateKey(d = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

type GameState = 'playing' | 'won' | 'finished';

export interface Challenge {
  id: string;
  ano_correto?: number;
  minYear: number;
  maxYear: number;
  imagem_principal: string;
  categorias?: string[];
  dificuldade?: 'facil' | 'normal' | 'dificil';
  conteudo_i18n: {
    pt: { titulo: string; dica: string };
    en: { titulo: string; dica: string };
    es?: { titulo: string; dica: string };
  };
}


export interface GuessFeedback {
  guessedYear: number;
  distanceOff: number;
  direction: 'higher' | 'lower' | 'exact';
  score: number;
}

interface GameStore {
  currentYear: number;
  targetYear: number | null;
  guesses: number[];
  guessHistory: GuessFeedback[];
  gameState: GameState;
  isSubmitting: boolean;
  lastScore: number | null;
  lastDistance: number | null;
  currentChallenge: Challenge | null;
  themeOverride: string;
  colorMode: string;
  selectedCategory: string;
  selectedDifficulty: string;
  gameMode: 'daily' | 'practice' | 'timeattack' | 'chronological';
  dailyCompleted: boolean;
  duelTargetScore: number | null;
  challengeStartTime: number | null;
  soundEnabled: boolean;
  setCurrentYear: (year: number) => void;
  setTargetYear: (year: number) => void;
  setThemeOverride: (theme: string) => void;
  setColorMode: (mode: string) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedDifficulty: (difficulty: string) => void;
  setGameMode: (mode: 'daily' | 'practice' | 'timeattack' | 'chronological') => void;
  setDuelTargetScore: (score: number | null) => void;
  submitGuess: () => void;
  reset: () => void;
  fetchDailyChallenge: () => Promise<void>;
  loadSpecificChallenge: (challengeId: string) => Promise<void>;
}

export const useGameStore = create<GameStore>((set, get) => ({
  currentYear: 1950,
  targetYear: 1969,
  guesses: [],
  guessHistory: [],
  gameState: 'playing',
  isSubmitting: false,
  lastScore: null,
  lastDistance: null,
  currentChallenge: null,
  themeOverride: typeof window !== 'undefined' ? localStorage.getItem('yearguessr_theme') || 'auto' : 'auto',
  colorMode: typeof window !== 'undefined' ? localStorage.getItem('yearguessr_colormode') || 'system' : 'system',
  selectedCategory: 'all',
  selectedDifficulty: 'all',
  gameMode: 'daily',
  dailyCompleted: false,
  duelTargetScore: null,
  challengeStartTime: null,
  soundEnabled: typeof window !== 'undefined' ? localStorage.getItem('yearguessr_sound') !== 'false' : true,

  setSoundEnabled: (enabled) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('yearguessr_sound', String(enabled));
    }
    set({ soundEnabled: enabled });
  },
  
  setGameMode: (mode) => {
    set({ gameMode: mode, gameState: 'playing', guesses: [], lastScore: null, lastDistance: null });
    get().fetchDailyChallenge();
  },

  setDuelTargetScore: (score) => set({ duelTargetScore: score }),
  
  setSelectedCategory: (category) => {
    set({ selectedCategory: category, gameState: 'playing', guesses: [], lastScore: null, lastDistance: null });
    get().fetchDailyChallenge();
  },
  
  setSelectedDifficulty: (difficulty) => {
    set({ selectedDifficulty: difficulty, gameState: 'playing', guesses: [], lastScore: null, lastDistance: null });
    get().fetchDailyChallenge();
  },
  
  setCurrentYear: (year) => set({ currentYear: year }),
  
  setTargetYear: (year) => set({ targetYear: year }),

  setThemeOverride: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('yearguessr_theme', theme);
    }
    set({ themeOverride: theme });
  },

  setColorMode: (mode) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('yearguessr_colormode', mode);
    }
    set({ colorMode: mode });
  },

  fetchDailyChallenge: async () => {
    try {
      const supabase = createClient();
      const { selectedCategory, selectedDifficulty, gameMode } = get();
      const todayKey = getLocalDateKey();

      if (gameMode === 'daily') {
        // 1. Check DB for logged-in user
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);

          const { data: userMatches } = await supabase
            .from('partidas')
            .select('pontos, tempo_segundos, desafio_id, desafios(ano_correto)')
            .eq('user_id', user.id)
            .gte('created_at', todayStart.toISOString())
            .order('created_at', { ascending: false })
            .limit(1);

          if (userMatches && userMatches.length > 0) {
            const match = userMatches[0];
            const correctYear = (match.desafios as any)?.ano_correto || 1969;
            set({
              dailyCompleted: true,
              gameState: 'finished',
              lastScore: match.pontos,
              lastDistance: 0,
              targetYear: correctYear,
            });
            return;
          }
        }

        // 2. Check localStorage for guests / offline
        if (typeof window !== 'undefined') {
          const completedDate = localStorage.getItem('yearguessr_daily_completed_date');
          if (completedDate === todayKey) {
            const savedScore = Number(localStorage.getItem('yearguessr_daily_score')) || 0;
            const savedDistance = Number(localStorage.getItem('yearguessr_daily_distance')) || 0;
            const savedTarget = Number(localStorage.getItem('yearguessr_daily_target')) || 1969;
            set({
              dailyCompleted: true,
              gameState: 'finished',
              lastScore: savedScore,
              lastDistance: savedDistance,
              targetYear: savedTarget,
            });
            return;
          }
        }

        // 3. For daily mode: attempt to get challenge published today (deterministic)
        let dailyQuery = supabase
          .from('desafios')
          .select('*')
          .eq('data_publicacao', todayKey)
          .limit(1);

        if (selectedCategory !== 'all') {
          dailyQuery = dailyQuery.contains('categorias', [selectedCategory]);
        }
        if (selectedDifficulty !== 'all') {
          dailyQuery = dailyQuery.eq('dificuldade', selectedDifficulty);
        }

        const { data: dailyData, error: dailyError } = await dailyQuery;

        if (dailyData && dailyData.length > 0 && !dailyError) {
          const item = dailyData[0];
          set({
            currentChallenge: {
              id: item.id,
              minYear: item.janela_anos ? item.janela_anos[0] : 1800,
              maxYear: item.janela_anos ? item.janela_anos[1] : 2026,
              imagem_principal: item.imagem_principal,
              categorias: item.categorias || ['historia'],
              dificuldade: item.dificuldade || 'normal',
              conteudo_i18n: item.conteudo_i18n,
            },
            targetYear: null,
            currentYear: 1950,
            guesses: [],
            guessHistory: [],
            gameState: 'playing',
            challengeStartTime: Date.now(),
          });
          return;
        }
      }

      set({ dailyCompleted: false });

      let { data, error } = await supabase
        .from('desafios')
        .select('*')
        .lt('data_publicacao', todayKey)
        .order('data_publicacao', { ascending: false })
        .limit(100);

      if (!data || data.length === 0) {
        const fallbackRes = await supabase
          .from('desafios')
          .select('*')
          .lte('data_publicacao', todayKey)
          .order('data_publicacao', { ascending: false })
          .limit(100);
        data = fallbackRes.data || [];
        error = fallbackRes.error;
      }

      let candidatePool = data || [];

      if (selectedCategory !== 'all' && candidatePool.length > 0) {
        const catMatch = candidatePool.filter((item: any) => {
          if (!item.categorias) return false;
          if (Array.isArray(item.categorias)) {
            return item.categorias.some((c: string) => c.toLowerCase() === selectedCategory.toLowerCase());
          }
          if (typeof item.categorias === 'string') {
            return item.categorias.toLowerCase().includes(selectedCategory.toLowerCase());
          }
          return false;
        });
        if (catMatch.length > 0) {
          candidatePool = catMatch;
        }
      }

      if (selectedDifficulty !== 'all' && candidatePool.length > 0) {
        const diffMatch = candidatePool.filter((item: any) => 
          (item.dificuldade || 'normal').toLowerCase() === selectedDifficulty.toLowerCase()
        );
        if (diffMatch.length > 0) {
          candidatePool = diffMatch;
        }
      }

      if (candidatePool.length > 0 && !error) {
        const randomIndex = Math.floor(Math.random() * candidatePool.length);
        const item = candidatePool[randomIndex];
        const organicRuler = generateOrganicRulerRange(item.ano_correto, item.dificuldade || 'normal');
        const minYear = item.janela_anos ? item.janela_anos[0] : organicRuler.minYear;
        const maxYear = item.janela_anos ? item.janela_anos[1] : organicRuler.maxYear;

        set({
          currentChallenge: {
            id: item.id,
            minYear,
            maxYear,
            imagem_principal: item.imagem_principal,
            categorias: item.categorias || ['historia'],
            dificuldade: item.dificuldade || 'normal',
            conteudo_i18n: item.conteudo_i18n,
          },
          targetYear: null,
          currentYear: Math.floor((minYear + maxYear) / 2),
          guesses: [],
          guessHistory: [],
          gameState: 'playing',
          challengeStartTime: Date.now(),
        });
      } else {
        set({
          currentChallenge: {
            id: 'demo-1969',
            minYear: 1900,
            maxYear: 2000,
            imagem_principal: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=1200&auto=format&fit=crop',
            conteudo_i18n: {
              pt: { titulo: 'Chegada do Homem à Lua (Apollo 11)', dica: 'Ocorreu no ápice da Guerra Fria e da Corrida Espacial.' },
              en: { titulo: 'Apollo 11 Moon Landing', dica: 'Occurred during the peak of the Cold War and Space Race.' }
            }
          },
          targetYear: null,
          currentYear: 1950,
          guesses: [],
          guessHistory: [],
          gameState: 'playing',
          challengeStartTime: Date.now(),
        });
      }
    } catch (err) {
      console.error('Falha ao buscar desafio:', err);
    }
  },

  loadSpecificChallenge: async (challengeId: string) => {
    try {
      const supabase = createClient();
      const { data: item } = await supabase
        .from('desafios')
        .select('*')
        .eq('id', challengeId)
        .single();

      if (item) {
        const organicRuler = generateOrganicRulerRange(item.ano_correto, item.dificuldade || 'normal');
        const minYear = item.janela_anos ? item.janela_anos[0] : organicRuler.minYear;
        const maxYear = item.janela_anos ? item.janela_anos[1] : organicRuler.maxYear;

        set({
          currentChallenge: {
            id: item.id,
            minYear,
            maxYear,
            imagem_principal: item.imagem_principal,
            categorias: item.categorias || ['historia'],
            dificuldade: item.dificuldade || 'normal',
            conteudo_i18n: item.conteudo_i18n,
          },
          targetYear: null,
          currentYear: Math.floor((minYear + maxYear) / 2),
          guesses: [],
          guessHistory: [],
          gameState: 'playing',
          challengeStartTime: Date.now(),
        });
      }
    } catch {
      // Ignore
    }
  },
  
  submitGuess: async () => {
    const { currentYear, guesses, currentChallenge, gameMode, challengeStartTime, isSubmitting } = get();
    if (!currentChallenge || isSubmitting) return;

    set({ isSubmitting: true });
    const newGuesses = [...guesses, currentYear];
    const timeInSeconds = challengeStartTime
      ? Math.min(Math.round((Date.now() - challengeStartTime) / 1000), 300)
      : 30;
    
    try {
      const response = await fetch('/api/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guessYear: currentYear,
          challengeId: currentChallenge.id,
          timeInSeconds,
          cluesUsed: 0,
          gameMode,
          attemptNumber: newGuesses.length
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      const score = typeof data.pontos === 'number' ? data.pontos : (data.score || 0);
      const distanceOff = typeof data.distancia === 'number' ? data.distancia : (data.distanceOff || 0);
      const isWin = data.acertou === true || data.isCorrect === true || distanceOff === 0;
      const isGameOver = data.gameOver === true || isWin || newGuesses.length >= 3;
      const directionStr = data.direcao === 'MAIS_RECENTE' ? 'higher' : data.direcao === 'MAIS_ANTIGO' ? 'lower' : 'exact';

      const feedback: GuessFeedback = { 
        guessedYear: currentYear, 
        distanceOff, 
        direction: directionStr, 
        score 
      };

      const updatedHistory = [...get().guessHistory, feedback];

      if (gameMode === 'daily' && isGameOver && typeof window !== 'undefined') {
        const todayKey = getLocalDateKey();
        localStorage.setItem('yearguessr_daily_completed_date', todayKey);
        localStorage.setItem('yearguessr_daily_score', String(score));
        localStorage.setItem('yearguessr_daily_distance', String(distanceOff));
        if (data.correctYear) {
          localStorage.setItem('yearguessr_daily_target', String(data.correctYear));
        }
        set({ dailyCompleted: true });
      }

      if (isWin) {
        set({ 
          guesses: newGuesses, 
          guessHistory: updatedHistory,
          gameState: 'won', 
          targetYear: data.correctYear || currentYear,
          lastScore: score,
          lastDistance: 0
        });
      } else if (isGameOver) {
        set({ 
          guesses: newGuesses, 
          guessHistory: updatedHistory,
          gameState: 'finished', 
          targetYear: data.correctYear || null,
          lastScore: score,
          lastDistance: distanceOff
        });
      } else {
        // Attempt 1 or 2 failed: stay in playing state for next attempt
        set({ 
          guesses: newGuesses, 
          guessHistory: updatedHistory,
          gameState: 'playing',
          lastScore: 0,
          lastDistance: distanceOff
        });
      }
    } catch (err) {
      console.error('Submit guess error:', err);
    } finally {
      set({ isSubmitting: false });
    }
  },
  
  reset: () => {
    const { gameMode, dailyCompleted } = get();
    if (gameMode === 'daily' && dailyCompleted) {
      set({ gameState: 'finished' });
      return;
    }
    if (gameMode === 'practice') {
      set({
        guesses: [],
        guessHistory: [],
        gameState: 'playing',
        lastScore: null,
        lastDistance: null,
      });
      get().fetchDailyChallenge();
      return;
    }
    set({
      guesses: [],
      guessHistory: [],
      gameState: 'playing',
      lastScore: null,
      lastDistance: null,
      challengeStartTime: Date.now(),
    });
  },
}));
