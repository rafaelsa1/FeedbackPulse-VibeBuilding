// =============================================================================
// FeedbackPulse - Sentiment Analyzer Engine
// =============================================================================
// Core analysis logic: classifies individual feedbacks, aggregates sentiment
// statistics, identifies problem categories, and generates actionable
// improvement suggestions.
// =============================================================================

const {
  palavrasPositivas,
  palavrasNegativas,
  categoriasProblemas,
  sugestoesPorCategoria
} = require('./keywords');

/**
 * Checks whether a keyword appears in the given text.
 * Uses `.includes()` for multi-word phrases and a custom boundary check
 * for single words to avoid partial matches (e.g. "bom" inside "bombom").
 * 
 * Standard \b regex boundaries don't work with accented Portuguese characters
 * (ó, é, á, ã, etc.), so we use a custom word-character class that includes
 * accented letters.
 *
 * @param {string} texto  - Lowercased feedback text
 * @param {string} palavra - Keyword to search for
 * @returns {boolean}
 */
function textoContemPalavra(texto, palavra) {
  if (palavra.includes(' ')) {
    // Multi-word phrase – simple substring match is appropriate
    return texto.includes(palavra);
  }
  // Single word – use custom boundary that supports accented characters
  // The word char class includes a-z, 0-9, underscore and all common
  // Portuguese accented characters (à-ÿ covers the Latin-1 supplement range)
  const wordChar = '[a-zA-ZÀ-ÿ0-9_]';
  const escaped = escapeRegex(palavra);
  const regex = new RegExp(`(?<![a-zA-ZÀ-ÿ0-9_])${escaped}(?!${wordChar})`, 'i');
  return regex.test(texto);
}

/**
 * Escapes special regex characters in a string.
 * @param {string} str
 * @returns {string}
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Classifies a single feedback and returns keyword hit counts.
 *
 * @param {string} texto - Raw feedback string
 * @returns {{ texto: string, textoLower: string, positivas: number, negativas: number, sentimento: string }}
 */
function classificarFeedback(texto) {
  const textoLower = texto.toLowerCase();

  let positivas = 0;
  let negativas = 0;

  for (const palavra of palavrasPositivas) {
    if (textoContemPalavra(textoLower, palavra)) {
      positivas++;
    }
  }

  for (const palavra of palavrasNegativas) {
    if (textoContemPalavra(textoLower, palavra)) {
      negativas++;
    }
  }

  let sentimento;
  if (positivas > negativas) {
    sentimento = 'positivo';
  } else if (negativas > positivas) {
    sentimento = 'negativo';
  } else {
    sentimento = 'neutro';
  }

  return { texto, textoLower, positivas, negativas, sentimento };
}

/**
 * Counts keyword occurrences across all feedbacks and returns the top 10
 * most frequent keywords, sorted by count descending.
 *
 * @param {string[]} textosLower - Array of lowercased feedback strings
 * @returns {{ palavra: string, contagem: number, tipo: 'positiva'|'negativa' }[]}
 */
function contarPalavrasFrequentes(textosLower) {
  const contagens = new Map();

  // Check positive keywords
  for (const palavra of palavrasPositivas) {
    let total = 0;
    for (const texto of textosLower) {
      if (textoContemPalavra(texto, palavra)) {
        total++;
      }
    }
    if (total > 0) {
      contagens.set(palavra, { contagem: total, tipo: 'positiva' });
    }
  }

  // Check negative keywords
  for (const palavra of palavrasNegativas) {
    let total = 0;
    for (const texto of textosLower) {
      if (textoContemPalavra(texto, palavra)) {
        total++;
      }
    }
    if (total > 0) {
      contagens.set(palavra, { contagem: total, tipo: 'negativa' });
    }
  }

  // Sort by count descending and take top 10
  return Array.from(contagens.entries())
    .map(([palavra, { contagem, tipo }]) => ({ palavra, contagem, tipo }))
    .sort((a, b) => b.contagem - a.contagem)
    .slice(0, 10);
}

/**
 * Identifies problem categories mentioned in negative/neutral feedbacks.
 * Only counts a category if its keywords appear in feedbacks classified
 * as 'negativo' or 'neutro'.
 *
 * @param {{ textoLower: string, sentimento: string }[]} classificados
 * @returns {{ categoria: string, mencoes: number }[]}
 */
function identificarProblemas(classificados) {
  const feedbacksNegativos = classificados.filter(
    (f) => f.sentimento === 'negativo' || f.sentimento === 'neutro'
  );

  const problemas = [];

  for (const [categoria, keywords] of Object.entries(categoriasProblemas)) {
    let mencoes = 0;

    for (const feedback of feedbacksNegativos) {
      const mencionaCategoria = keywords.some((kw) =>
        textoContemPalavra(feedback.textoLower, kw)
      );
      if (mencionaCategoria) {
        mencoes++;
      }
    }

    if (mencoes > 0) {
      problemas.push({ categoria, mencoes });
    }
  }

  // Sort by number of mentions descending
  problemas.sort((a, b) => b.mencoes - a.mencoes);
  return problemas;
}

/**
 * Generates improvement suggestions based on identified problems and
 * overall analysis metrics.
 *
 * @param {{ categoria: string }[]} problemas
 * @param {number} notaGeral
 * @param {number} negativos
 * @param {number} positivos
 * @returns {string[]}
 */
function gerarSugestoes(problemas, notaGeral, negativos, positivos) {
  const sugestoes = [];

  // Category-specific suggestions
  for (const { categoria } of problemas) {
    if (sugestoesPorCategoria[categoria]) {
      sugestoes.push(sugestoesPorCategoria[categoria]);
    }
  }

  // Generic suggestions based on thresholds
  if (notaGeral < 5) {
    sugestoes.push('Realizar pesquisa aprofundada de satisfação do cliente');
  }
  if (negativos > positivos) {
    sugestoes.push(
      'Criar canal de comunicação direta para resolução de problemas'
    );
  }

  return sugestoes;
}

/**
 * Main analysis function. Receives an array of feedback strings and returns
 * a comprehensive analysis object.
 *
 * @param {string[]} feedbacksArray - Array of raw feedback strings
 * @returns {Object} Complete analysis result
 */
function analisarFeedbacks(feedbacksArray) {
  // 1. Classify each feedback
  const classificados = feedbacksArray.map(classificarFeedback);

  // 2. Aggregate sentiment counts
  let positivos = 0;
  let neutros = 0;
  let negativos = 0;

  for (const f of classificados) {
    if (f.sentimento === 'positivo') positivos++;
    else if (f.sentimento === 'neutro') neutros++;
    else negativos++;
  }

  const total = classificados.length;

  // 3. Determine overall sentiment (tie-breaking: positivo > neutro > negativo)
  let sentimentoGeral;
  if (positivos >= neutros && positivos >= negativos) {
    sentimentoGeral = 'positivo';
  } else if (neutros >= negativos) {
    sentimentoGeral = 'neutro';
  } else {
    sentimentoGeral = 'negativo';
  }

  // 4. Calculate overall score (0-10)
  const notaGeral =
    total > 0
      ? Math.round(((positivos + neutros * 0.5) / total) * 10 * 10) / 10
      : 0;

  // 5. Count frequent keywords across all feedbacks
  const textosLower = classificados.map((f) => f.textoLower);
  const palavrasFrequentes = contarPalavrasFrequentes(textosLower);

  // 6. Identify problem categories (negative/neutral context only)
  const problemas = identificarProblemas(classificados);

  // 7. Generate improvement suggestions
  const sugestoes = gerarSugestoes(problemas, notaGeral, negativos, positivos);

  // 8. Build detailed feedback list
  const feedbacksDetalhados = classificados.map((f) => ({
    texto: f.texto,
    sentimento: f.sentimento
  }));

  return {
    total,
    sentimentoGeral,
    positivos,
    neutros,
    negativos,
    palavrasFrequentes,
    problemas,
    sugestoes,
    notaGeral,
    feedbacksDetalhados
  };
}

module.exports = { analisarFeedbacks };
