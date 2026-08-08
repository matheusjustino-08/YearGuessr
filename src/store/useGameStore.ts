import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

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


interface GameStore {
  currentYear: number;
  targetYear: number;
  guesses: number[];
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
  currentYear: 2026,
  targetYear: 2026,
  guesses: [],
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

      let query = supabase
        .from('desafios')
        .select('*')
        .order('data_publicacao', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.contains('categorias', [selectedCategory]);
      }

      if (selectedDifficulty !== 'all') {
        query = query.eq('dificuldade', selectedDifficulty);
      }

      let { data, error } = await query.limit(10);

      // If filtered query yields no results, attempt unfiltered query
      if ((!data || data.length === 0) && (selectedCategory !== 'all' || selectedDifficulty !== 'all')) {
        const fallbackQuery = await supabase
          .from('desafios')
          .select('*')
          .order('data_publicacao', { ascending: false })
          .limit(10);
        if (fallbackQuery.data && fallbackQuery.data.length > 0) {
          data = fallbackQuery.data;
          error = null;
        }
      }

      if (data && data.length > 0 && !error) {
        // Select random challenge from filtered candidates (practice mode)
        const randomIndex = Math.floor(Math.random() * data.length);
        const item = data[randomIndex];
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
          gameMode
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

      if (data.isCorrect) {
        set({ 
          guesses: newGuesses, 
          gameState: 'won', 
          targetYear: data.correctYear,
          lastScore: data.score,
          lastDistance: data.distanceOff
        });
      } else {
        // Single guess mode: game transitions to result screen on guess
        set({ 
          guesses: newGuesses, 
          gameState: 'finished', 
          targetYear: data.correctYear,
          lastScore: data.score,
          lastDistance: data.distanceOff
        });
      }
    } catch (error) {
      console.error('Failed to submit guess:', error);
      const fallbackYear = currentChallenge?.ano_correto ?? currentYear;
      set({ 
        guesses: newGuesses,
        gameState: 'finished',
        targetYear: fallbackYear,
        lastScore: 0,
        lastDistance: Math.abs(currentYear - fallbackYear)
      });
    }
  },
  
  reset: () => {
    const { gameMode, dailyCompleted } = get();
    if (gameMode === 'daily' && dailyCompleted) {
      set({ gameMode: 'practice' });
    }
    get().fetchDailyChallenge();
  },
}));
