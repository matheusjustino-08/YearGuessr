import { NextResponse } from 'next/server';
import { generateOrganicRulerRange } from '@/lib/ruler-calculator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic, apiKey: clientApiKey } = body;

    const apiKey = clientApiKey?.trim() || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave de API do Gemini não configurada. Insira sua chave Gemini no campo do painel admin ou no arquivo .env!' },
        { status: 400 }
      );
    }

    const systemPrompt = `Você é um historiador especialista e gerador de conteúdo para o YearGuessr, um jogo educativo de adivinhar o ano de eventos históricos.

Sua tarefa é gerar um desafio histórico fascinante e preciso no formato JSON estrito.

Regras do Estilo de Escrita do YearGuessr:
1. Títulos concisos e impactantes (máximo 65 caracteres).
2. Dicas contextualizadas que deem pistas históricas (época, século, contexto geopolítico) sem revelar o ano exato explicitamente.
3. Tradução natural nos 3 idiomas (Português, Inglês e Espanhol).

Formato JSON Obrigatório (retorne APENAS o JSON bruto, sem blocos de código \`\`\`json):
{
  "ano_correto": 1969,
  "dificuldade": "facil" | "normal" | "dificil",
  "categorias": ["guerra" | "ciencia" | "arte" | "cinema" | "esportes" | "politica"],
  "conteudo_i18n": {
    "pt": { "titulo": "Título em PT", "dica": "Dica em PT" },
    "en": { "titulo": "Título em EN", "dica": "Dica em EN" },
    "es": { "titulo": "Título em ES", "dica": "Dica em ES" }
  },
  "search_image_query": "Consulta em inglês para imagem no Unsplash"
}

${topic ? `O desafio DEVE ser sobre este tema específico: "${topic}".` : 'Gere um evento histórico marcante e icônico da história mundial.'}`;

    // 1. Dynamically query Google ListModels API to discover exact available models for this API key
    let dynamicModels: string[] = [];
    try {
      const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (listRes.ok) {
        const listData = await listRes.json();
        if (Array.isArray(listData.models)) {
          const valid = listData.models
            .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
            .map((m: any) => m.name.replace(/^models\//, ''));

          // Sort flash / latest models first
          valid.sort((a: string, b: string) => {
            if (a.includes('flash') && !b.includes('flash')) return -1;
            if (!a.includes('flash') && b.includes('flash')) return 1;
            return b.localeCompare(a);
          });
          dynamicModels = valid;
        }
      }
    } catch {
      // Dynamic list fallback
    }

    // 2. Comprehensive fallback list including latest Gemini 3.x / 2.x / 1.5 versions
    const fallbackModels = [
      'gemini-3.6-flash',
      'gemini-3.5-flash',
      'gemini-3.0-flash',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash',
      'gemini-1.5-flash-002',
      'gemini-1.5-pro-latest',
      'gemini-flash',
      'gemini-pro',
    ];

    const modelsToTry = dynamicModels.length > 0 
      ? Array.from(new Set([...dynamicModels, ...fallbackModels])) 
      : fallbackModels;

    let lastError = '';
    let candidateText = '';
    let usedModel = '';

    for (const modelName of modelsToTry) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const res = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
          }),
        });

        if (res.ok) {
          const geminiData = await res.json();
          candidateText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (candidateText) {
            usedModel = modelName;
            break;
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          lastError = errData.error?.message || `Modelo ${modelName} retornou erro ${res.status}`;
        }
      } catch (e: any) {
        lastError = e.message || 'Erro na requisição Gemini';
      }
    }

    if (!candidateText) {
      throw new Error(`Não foi possível comunicar com a API do Gemini. Detalhe do erro: ${lastError}`);
    }

    // Clean JSON response
    const cleanJsonStr = candidateText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();

    const parsed = JSON.parse(cleanJsonStr);

    const anoCorreto = Number(parsed.ano_correto) || 1950;
    const dificuldade = parsed.dificuldade || 'normal';
    const organicRuler = generateOrganicRulerRange(anoCorreto, dificuldade);

    return NextResponse.json({
      success: true,
      usedModel,
      data: {
        ano_correto: anoCorreto,
        dificuldade,
        categorias: parsed.categorias || ['historia'],
        minYear: organicRuler.minYear,
        maxYear: organicRuler.maxYear,
        titulo_pt: parsed.conteudo_i18n?.pt?.titulo || '',
        dica_pt: parsed.conteudo_i18n?.pt?.dica || '',
        titulo_en: parsed.conteudo_i18n?.en?.titulo || '',
        dica_en: parsed.conteudo_i18n?.en?.dica || '',
        titulo_es: parsed.conteudo_i18n?.es?.titulo || '',
        dica_es: parsed.conteudo_i18n?.es?.dica || '',
        search_image_query: parsed.search_image_query || '',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Falha ao gerar desafio com IA' },
      { status: 500 }
    );
  }
}
