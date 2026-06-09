// =============================================================================
// FeedbackPulse - Express Server
// =============================================================================
// HTTP API layer: serves the SPA client, exposes the analysis endpoint, and
// provides example feedback data for quick demos.
// =============================================================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const { analisarFeedbacks } = require('./analyzer');

const app = express();
const PORT = process.env.PORT || 3001;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(express.json());
app.use(cors());

// Serve the front-end client
app.use(express.static(path.join(__dirname, '../client')));

// ---------------------------------------------------------------------------
// POST /api/analisar
// ---------------------------------------------------------------------------
// Receives an array of feedback strings, validates input, runs the sentiment
// analysis pipeline, and returns the full result object.
// ---------------------------------------------------------------------------
app.post('/api/analisar', (req, res) => {
  try {
    const { feedbacks } = req.body;

    // Validate presence and type
    if (!feedbacks || !Array.isArray(feedbacks) || feedbacks.length === 0) {
      return res.status(400).json({
        erro: 'Nenhum feedback válido foi enviado'
      });
    }

    // Filter out empty / whitespace-only strings
    const feedbacksValidos = feedbacks
      .map((f) => (typeof f === 'string' ? f.trim() : ''))
      .filter((f) => f.length > 0);

    if (feedbacksValidos.length === 0) {
      return res.status(400).json({
        erro: 'Nenhum feedback válido foi enviado'
      });
    }

    const resultado = analisarFeedbacks(feedbacksValidos);
    return res.json(resultado);
  } catch (error) {
    console.error('Erro ao analisar feedbacks:', error);
    return res.status(500).json({
      erro: 'Erro interno ao processar os feedbacks'
    });
  }
});

// ---------------------------------------------------------------------------
// GET /api/exemplos
// ---------------------------------------------------------------------------
// Returns a curated set of example feedbacks in Portuguese covering a
// realistic mix of positive, negative, and neutral sentiments.
// ---------------------------------------------------------------------------
app.get('/api/exemplos', (_req, res) => {
  const exemplos = [
    'Ótimo atendimento! Fui muito bem recebido e o produto chegou antes do prazo.',
    'Péssima experiência. O produto veio com defeito e ninguém resolveu meu problema.',
    'O preço é um pouco caro, mas a qualidade compensa.',
    'Entrega demorada, levou 20 dias para chegar. Muito atraso!',
    'Produto excelente, superou minhas expectativas. Recomendo!',
    'Atendimento grosseiro, o funcionário foi mal educado comigo.',
    'Gostei bastante do produto, é prático e fácil de usar.',
    'Não recomendo. O site é confuso e dificultou minha compra.',
    'Serviço rápido e eficiente, parabéns à equipe!',
    'O produto quebrou na primeira semana de uso. Qualidade péssima.',
    'Preço justo e entrega pontual. Estou satisfeito com a compra.',
    'A embalagem chegou danificada, mas o produto estava ok.',
    'Incrível! Melhor compra que fiz este ano. Simplesmente perfeito.',
    'Dificuldade para entrar em contato com o suporte. Descaso total.',
    'Produto bom, atendeu ao que eu esperava. Nada de especial.'
  ];

  return res.json(exemplos);
});

// ---------------------------------------------------------------------------
// SPA Catch-All
// ---------------------------------------------------------------------------
// Any non-API GET request serves the client index.html so client-side
// routing works correctly.
// ---------------------------------------------------------------------------
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// ---------------------------------------------------------------------------
// Start Server
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 FeedbackPulse rodando em http://localhost:${PORT}`);
});

module.exports = app;
