'use client';

interface DiffLevel {
  id: string;
  label: string;
  color: string;
  textColor: string;
  items: string[];
  meta: string;
}

const LEVELS: DiffLevel[] = [
  {
    id: 'facil',
    label: 'Fácil',
    color: 'bg-emerald-500/5 border-emerald-500/30',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    items: [
      'Evento marcante mundialmente (ex: Apollo 11)',
      'Imagem icônica e reconhecível por todos',
      'Janela de anos ampla — fácil de contextualizar',
      'Errar por mais de 10 anos seria improvável',
      'Boa para atrair e reter novos jogadores',
    ],
    meta: '>70% de acerto na 1ª tentativa',
  },
  {
    id: 'normal',
    label: 'Normal',
    color: 'bg-amber-500/5 border-amber-500/30',
    textColor: 'text-amber-600 dark:text-amber-400',
    items: [
      'Evento importante, mas não trivialmente óbvio',
      'Imagem contextual — exige raciocínio histórico',
      'Janela de anos média (50–100 anos)',
      'A dica é essencial para afunilar o palpite',
      'Nível padrão recomendado para o desafio diário',
    ],
    meta: '>50% de acerto em até 2 tentativas',
  },
  {
    id: 'dificil',
    label: 'Difícil',
    color: 'bg-rose-500/5 border-rose-500/30',
    textColor: 'text-rose-600 dark:text-rose-400',
    items: [
      'Evento obscuro ou regional, pouco documentado',
      'Imagem ambígua, sem elementos datáveis óbvios',
      'Janela de anos estreita (<50 anos)',
      'Requer conhecimento aprofundado, mesmo com a dica',
      'Reservado para fins de semana ou modo avançado',
    ],
    meta: '<30% de acerto em qualquer tentativa',
  },
];

export function DifficultyGuidelinesSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {LEVELS.map(level => (
        <div key={level.id} className={`p-5 rounded-2xl border space-y-3 ${level.color}`}>
          <div>
            <span className={`text-sm font-black ${level.textColor}`}>{level.label}</span>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1.5 list-none">
            {level.items.map((item, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-muted-foreground/40 mt-0.5 shrink-0">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className={`text-[10px] font-mono font-semibold ${level.textColor} opacity-70`}>
            Meta: {level.meta}
          </p>
        </div>
      ))}
    </div>
  );
}
