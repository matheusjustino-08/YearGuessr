import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { generateOrganicRulerRange } from '@/lib/ruler-calculator';

type GameState = 'playing' | 'won' | 'finished';

export interface Challenge {
  id: string;
  ano_correto: number;
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
  targetYear: number;
  guesses: number[];
  guessHistory: GuessFeedback[];
  gameState: GameState;
  lastScore: number | null;
  lastDistance: number | null;
  currentChallenge: Challenge | null;
  themeOverride: string;
  colorMode: string;
  selectedCategory: string;
  selectedDifficulty: string;
  gameMode: 'daily' | 'practice';
  dailyCompleted: boolean;
  challengeStartTime: number | null;
  soundEnabled: boolean;
  setCurrentYear: (year: number) => void;
  setTargetYear: (year: number) => void;
  setThemeOverride: (theme: string) => void;
  setColorMode: (mode: string) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedDifficulty: (difficulty: string) => void;
  setGameMode: (mode: 'daily' | 'practice') => void;
  submitGuess: () => void;
  reset: () => void;
  fetchDailyChallenge: () => Promise<void>;
}

export const useGameStore = create<GameStore>((set, get) => ({
  currentYear: 1950,
  targetYear: 1969,
  guesses: [],
  guessHistory: [],
  gameState: 'playing',
  lastScore: null,
  lastDistance: null,
  currentChallenge: null,
  themeOverride: typeof window !== 'undefined' ? localStorage.getItem('yearguessr_theme') || 'auto' : 'auto',
  colorMode: typeof window !== 'undefined' ? localStorage.getItem('yearguessr_colormode') || 'system' : 'system',
  selectedCategory: 'all',
  selectedDifficulty: 'all',
  gameMode: 'daily',
  dailyCompleted: false,
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
        const todayKey = new Date().toISOString().split('T')[0];
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
              ano_correto: item.ano_correto,
              minYear: item.janela_anos ? item.janela_anos[0] : 1800,
              maxYear: item.janela_anos ? item.janela_anos[1] : 2026,
              imagem_principal: item.imagem_principal,
              categorias: item.categorias || ['historia'],
              dificuldade: item.dificuldade || 'normal',
              conteudo_i18n: item.conteudo_i18n,
            },
            targetYear: item.ano_correto,
            currentYear: item.janela_anos ? Math.floor((item.janela_anos[0] + item.janela_anos[1]) / 2) : 1950,
            guesses: [],
            gameState: 'playing',
            dailyCompleted: false,
            challengeStartTime: Date.now(),
          });
          return;
        }
      }

      set({ dailyCompleted: false });

      const todayKey = new Date().toISOString().split('T')[0];

      // In practice mode: fetch pool of past challenges and apply resilient filtering
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

      // Filter by Category
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

      // Filter by Difficulty
      if (selectedDifficulty !== 'all' && candidatePool.length > 0) {
        const diffMatch = candidatePool.filter((item: any) => 
          (item.dificuldade || 'normal').toLowerCase() === selectedDifficulty.toLowerCase()
        );
        if (diffMatch.length > 0) {
          candidatePool = diffMatch;
        }
      }

      if (candidatePool.length > 0 && !error) {
        // Select random challenge from filtered candidates (practice mode)
        const randomIndex = Math.floor(Math.random() * candidatePool.length);
        const item = candidatePool[randomIndex];
        const organicRuler = generateOrganicRulerRange(item.ano_correto, item.dificuldade || 'normal');
        const minYear = item.janela_anos ? item.janela_anos[0] : organicRuler.minYear;
        const maxYear = item.janela_anos ? item.janela_anos[1] : organicRuler.maxYear;

        set({
          currentChallenge: {
            id: item.id,
            ano_correto: item.ano_correto,
            minYear,
            maxYear,
            imagem_principal: item.imagem_principal,
            categorias: item.categorias || ['historia'],
            dificuldade: item.dificuldade || 'normal',
            conteudo_i18n: item.conteudo_i18n,
          },
          targetYear: item.ano_correto,
          currentYear: Math.floor((minYear + maxYear) / 2),
          guesses: [],
          gameState: 'playing',
          challengeStartTime: Date.now(),
        });
      } else {
        // Fallback demo challenge if DB has no challenges yet or query fails
        set({
          currentChallenge: {
            id: 'demo-1969',
            ano_correto: 1969,
            minYear: 1900,
            maxYear: 2000,
            imagem_principal: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=1200&auto=format&fit=crop',
            conteudo_i18n: {
              pt: { titulo: 'Chegada do Homem à Lua (Apollo 11)', dica: 'Ocorreu no ápice da Guerra Fria e da Corrida Espacial.' },
              en: { titulo: 'Apollo 11 Moon Landing', dica: 'Occurred during the peak of the Cold War and Space Race.' }
            }
          },
          targetYear: 1969,
          currentYear: 1950,
          guesses: [],
          gameState: 'playing',
          challengeStartTime: Date.now(),
        });
      }
    } catch (err) {
      console.error('Falha ao buscar desafio:', err);
    }
  },
  
  submitGuess: async () => {
    const { currentYear, guesses, currentChallenge, gameMode, challengeStartTime } = get();
    if (!currentChallenge) return;

    const newGuesses = [...guesses, currentYear];
    // Calculate real time elapsed since challenge loaded (cap at 300 seconds)
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

      if (gameMode === 'daily' && typeof window !== 'undefined') {
        const todayKey = new Date().toISOString().split('T')[0];
        localStorage.setItem('yearguessr_daily_completed_date', todayKey);
        localStorage.setItem('yearguessr_daily_score', String(data.score));
        localStorage.setItem('yearguessr_daily_distance', String(data.distanceOff));
        localStorage.setItem('yearguessr_daily_target', String(data.correctYear));
        set({ dailyCompleted: true });
      }

      if (data.isCorrect || data.distanceOff === 0) {
        const direction = 'exact';
        const feedback: GuessFeedback = { guessedYear: currentYear, distanceOff: 0, direction, score: data.score };
        set({ 
          guesses: newGuesses, 
          guessHistory: [...get().guessHistory, feedback],
          gameState: 'won', 
          targetYear: data.correctYear,
          lastScore: data.score,
          lastDistance: 0
        });
      } else if (newGuesses.length >= 3) {
        const direction = currentYear < data.correctYear ? 'higher' : 'lower';
        const feedback: GuessFeedback = { guessedYear: currentYear, distanceOff: data.distanceOff, direction, score: data.score };
        set({ 
          guesses: newGuesses, 
          guessHistory: [...get().guessHistory, feedback],
          gameState: 'finished', 
          targetYear: data.correctYear,
          lastScore: data.score,
          lastDistance: data.distanceOff
        });
      } else {
        // Attempt 1 or 2 failed, record feedback and stay in playing state for next attempt
        const direction = currentYear < data.correctYear ? 'higher' : 'lower';
        const feedback: GuessFeedback = { guessedYear: currentYear, distanceOff: data.distanceOff, direction, score: data.score };
        set({ 
          guesses: newGuesses, 
          guessHistory: [...get().guessHistory, feedback],
          gameState: 'playing', 
          targetYear: data.correctYear,
          lastScore: data.score,
          lastDistance: data.distanceOff
        });
      }
    } catch (error) {
      console.error('Failed to submit guess:', error);
      const fallbackYear = currentChallenge?.ano_correto ?? currentYear;
      const fallbackDist = Math.abs(currentYear - fallbackYear);
      const direction = currentYear < fallbackYear ? 'higher' : 'lower';
      const feedback: GuessFeedback = { guessedYear: currentYear, distanceOff: fallbackDist, direction, score: 0 };
      const newHist = [...get().guessHistory, feedback];

      set({ 
        guesses: newGuesses,
        guessHistory: newHist,
        gameState: newGuesses.length >= 3 ? 'finished' : 'playing',
        targetYear: fallbackYear,
        lastScore: 0,
        lastDistance: fallbackDist
      });
    }
  },
  
  reset: () => {
    const { gameMode, dailyCompleted } = get();
    if (gameMode === 'daily' && dailyCompleted) {
      set({ gameState: 'finished' });
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
