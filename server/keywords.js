// =============================================================================
// FeedbackPulse - Keywords & Categories Dictionary
// =============================================================================
// Curated Portuguese keyword lists for sentiment analysis and problem
// categorization. Each list is tuned for Brazilian Portuguese e-commerce
// and service-industry feedback.
// =============================================================================

const palavrasPositivas = [
  'bom', 'ótimo', 'excelente', 'rápido', 'gostei', 'recomendo', 'perfeito',
  'incrível', 'maravilhoso', 'satisfeito', 'eficiente', 'prático', 'adorei',
  'parabéns', 'atencioso', 'educado', 'simpático', 'fácil', 'confiável',
  'qualidade', 'agilidade', 'pontual', 'show', 'top', 'sensacional',
  'fantástico', 'amei', 'melhor', 'surpreendeu', 'obrigado', 'nota 10'
];

const palavrasNegativas = [
  'ruim', 'demorado', 'atraso', 'problema', 'péssimo', 'não gostei', 'caro',
  'dificuldade', 'horrível', 'terrível', 'lento', 'confuso', 'complicado',
  'decepcionante', 'insatisfeito', 'desorganizado', 'descaso', 'falta',
  'quebrado', 'defeito', 'grosseiro', 'mal educado', 'enganoso', 'pior',
  'nojento', 'absurdo', 'incompetente', 'vergonha', 'prejuízo', 'raiva',
  'não recomendo', 'não funciona'
];

const categoriasProblemas = {
  'Atendimento': [
    'grosseiro', 'mal educado', 'descaso', 'incompetente',
    'grosseria', 'demora no atendimento', 'péssimo atendimento'
  ],
  'Entrega e Prazo': [
    'demorado', 'atraso', 'lento', 'prazo', 'entrega', 'demora'
  ],
  'Preço e Custo': [
    'caro', 'preço', 'custo', 'valor', 'barato'
  ],
  'Qualidade do Produto': [
    'defeito', 'quebrado', 'ruim', 'péssimo', 'qualidade', 'produto'
  ],
  'Usabilidade': [
    'confuso', 'complicado', 'difícil', 'dificuldade', 'funciona', 'site', 'app'
  ]
};

const sugestoesPorCategoria = {
  'Atendimento': 'Investir em treinamento da equipe de atendimento ao cliente',
  'Entrega e Prazo': 'Revisar processos logísticos e melhorar prazos de entrega',
  'Preço e Custo': 'Avaliar política de preços e oferecer opções mais competitivas',
  'Qualidade do Produto': 'Implementar controle de qualidade mais rigoroso nos produtos',
  'Usabilidade': 'Melhorar a experiência do usuário na plataforma digital'
};

module.exports = {
  palavrasPositivas,
  palavrasNegativas,
  categoriasProblemas,
  sugestoesPorCategoria
};
