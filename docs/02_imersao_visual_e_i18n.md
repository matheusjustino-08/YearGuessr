# 2. Imersão Visual, i18n e UI

## Viagem Completa no Tempo (Temas & Shaders)

Ao arrastar a barra da linha do tempo, a interface reage dinamicamente. O plano de fundo, fontes, bordas e efeitos sonoros mudam para refletir a era selecionada:

| Era Temporal | Estilo Visual & Estética | Efeito de Áudio (SFX) | Shader / Filtro CSS / Textura |
| :--- | :--- | :--- | :--- |
| **Antiguidade e Idade Média (Até 1499)** | Papel pergaminho, caligrafia, iluminações e bordas rústicas | Som de escrita com pena, harpa antiga / instrumentos de sopro | `sepia(0.9) contrast(1.1)` + textura de pergaminho sobreposta |
| **Renascimento e Iluminismo (1500–1799)** | Gravuras em metal, tons de tinta nanquim, mapas antigos | Som de engrenagens de relógio solar e pêndulos | `sepia(0.5) grayscale(0.3) contrast(1.2)` + vinheta clássica |
| **Era Industrial e Vitoriana (1800–1899)**| Estética Steampunk, placas de bronze, fototipia inicial | Apitos de vapor, ruídos mecânicos e relógio de bolso | `grayscale(0.8) sepia(0.3) contrast(1.3)` + grão pesado |
| **Início do Século XX (1900–1949)** | Cinema mudo, tom P&B severo, linhas de película gastas | Chiado de vinil, som de projeção de filme de 16mm | `grayscale(1) contrast(1.4)` + partículas de poeira e flashes no canvas |
| **Era Dourada e Psicodélica (1950–1979)** | Technicolor, posters de festival, cores quentes saturadas | Ruído analógico de rádio AM / sintetizador clássico | `saturate(2) contrast(1.1)` + vinheta arredondada de TV antiga |
| **Retro / Cyberpunk (1980–1999)** | Estética VHS, néon, scanlines de monitores CRT | Beeps de computador 8-bits / som de fita rebobinando | Lines CRT sobrepostas + efeito Chromatic Aberration nos textos |
| **Era Digital e Moderna (2000–Hoje)** | Minimalismo, Glassmorphism, bordas brilhantes e sombras | Efeitos de clique limpos (pop/glass), som futurista sutil | `backdrop-blur-md`, elementos translúcidos e cores sólidas |

## Internacionalização (i18n) & Localização Global

Para escalar o jogo globalmente sem duplicar código:

**Estrutura de Arquivos de Tradução (`/messages/pt.json`, `/messages/en.json`, `/messages/es.json`):**
```json
{
  "game": {
    "title": "Chronos",
    "guess_button": "Confirmar Ano",
    "distance_off": "Você errou por {years} {years, plural, =1 {ano} other {anos}}!"
  },
  "share": {
    "title": "Meu Resultado no Chronos",
    "attempts": "Acertou em {count} {count, plural, =1 {tentativa} other {tentativas}}"
  }
}
```

**Localização de Eventos:** Os desafios diários no banco de dados podem possuir traduções para título e dicas, servindo o conteúdo no idioma selecionado pelo jogador (locale).

## Card de Compartilhamento em SVG Dinâmico (i18n Nativo)

Em vez de enviar emojis genéricos de texto, o jogo gera um card em SVG vetorial adaptado ao idioma do usuário. Exemplo de implementação:

```tsx
interface CardResultadoProps {
  anoCorreto: number;
  palpites: number[];
  locale: string;
  t: (key: string, params?: Record<string, any>) => string;
}

export function CardResultadoSVG({ anoCorreto, palpites, locale, t }: CardResultadoProps) {
  return (
    <svg width="400" height="220" viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg" className="rounded-xl bg-slate-900">
      <rect width="100%" height="100%" fill="#0f172a" rx="12" />
      
      {/* Título Traduzido */}
      <text x="20" y="40" fill="#f8fafc" fontSize="18" fontWeight="bold">
        Chronos #{palpites.length}
      </text>
      
      {/* Régua da Linha do Tempo em SVG */}
      <line x1="30" y1="120" x2="370" y2="120" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
      
      {/* Pontos de Palpites no SVG */}
      {palpites.map((ano, index) => {
        const posX = 30 + ((ano - 1800) / 226) * 340; 
        const isCorreto = ano === anoCorreto;
        return (
          <circle 
            key={index} 
            cx={posX} 
            cy="120" 
            r={isCorreto ? "8" : "5"} 
            fill={isCorreto ? "#22c55e" : "#ef4444"} 
          />
        );
      })}

      {/* Rótulo Formatado via i18n */}
      <text x="20" y="180" fill="#94a3b8" fontSize="14">
        {t('share.attempts', { count: palpites.length })}
      </text>
    </svg>
  );
}
```
