/**
 * FeedbackPulse — Utilities Module
 * Provides notification, validation, clipboard, and formatting helpers.
 */
const Utils = (() => {
  /**
   * Exibe uma notificação toast na tela.
   * @param {string} mensagem — Texto da notificação
   * @param {'info'|'success'|'error'} tipo — Tipo da notificação
   */
  function mostrarNotificacao(mensagem, tipo = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;

    const icons = {
      success: '<i data-lucide="check-circle" style="color:var(--color-positive); width:20px; height:20px;"></i>',
      error: '<i data-lucide="alert-circle" style="color:var(--color-negative); width:20px; height:20px;"></i>',
      info: '<i data-lucide="info" style="color:var(--accent-primary); width:20px; height:20px;"></i>',
    };

    toast.innerHTML = `
      <span class="toast-icon" style="display:flex; align-items:center;">${icons[tipo] || icons.info}</span>
      <span class="toast-message">${mensagem}</span>
    `;

    container.appendChild(toast);
    
    if (window.lucide) {
      lucide.createIcons({ root: toast });
    }

    // Auto-remove after 3 seconds
    setTimeout(() => {
      toast.classList.add('toast-exit');
      toast.addEventListener('animationend', () => {
        toast.remove();
      });
    }, 3000);
  }

  /**
   * Valida o texto do textarea e retorna os feedbacks separados.
   * @param {string} texto — Conteúdo cru do textarea
   * @returns {{ valido: boolean, feedbacks: string[], mensagem: string }}
   */
  function validarFeedbacks(texto) {
    if (!texto || !texto.trim()) {
      return {
        valido: false,
        feedbacks: [],
        mensagem: 'Por favor, insira pelo menos um feedback para análise.',
      };
    }

    const feedbacks = texto
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (feedbacks.length === 0) {
      return {
        valido: false,
        feedbacks: [],
        mensagem: 'Por favor, insira pelo menos um feedback para análise.',
      };
    }

    return {
      valido: true,
      feedbacks,
      mensagem: `${feedbacks.length} feedback(s) prontos para análise.`,
    };
  }

  /**
   * Conta o número de linhas não-vazias (feedbacks) no texto.
   * @param {string} texto
   * @returns {number}
   */
  function contarFeedbacks(texto) {
    if (!texto || !texto.trim()) return 0;
    return texto
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0).length;
  }

  /**
   * Retorna o número de caracteres do texto.
   * @param {string} texto
   * @returns {number}
   */
  function contarCaracteres(texto) {
    return (texto || '').length;
  }

  /**
   * Copia um relatório formatado dos dados de análise para a área de transferência.
   * @param {Object} dados — Objeto de resultados da análise
   */
  async function copiarRelatorio(dados) {
    const separator = '═══════════════════════════════════';
    const lines = [
      separator,
      '📊 RELATÓRIO FEEDBACKPULSE',
      separator,
      '',
      '📈 RESUMO GERAL',
      `Total de feedbacks: ${dados.total}`,
      `Sentimento geral: ${dados.sentimentoGeral}`,
      `Nota geral: ${dados.notaGeral}/10`,
      '',
      `😊 Positivos: ${dados.positivos}`,
      `😐 Neutros: ${dados.neutros}`,
      `😞 Negativos: ${dados.negativos}`,
      '',
    ];

    if (dados.problemas && dados.problemas.length > 0) {
      lines.push('⚠️ PROBLEMAS IDENTIFICADOS');
      dados.problemas.forEach((p) => {
        lines.push(`  - ${p.categoria} (${p.mencoes} menções)`);
      });
      lines.push('');
    }

    if (dados.sugestoes && dados.sugestoes.length > 0) {
      lines.push('💡 SUGESTÕES DE MELHORIA');
      dados.sugestoes.forEach((s) => {
        lines.push(`  - ${s}`);
      });
      lines.push('');
    }

    if (dados.palavrasFrequentes && dados.palavrasFrequentes.length > 0) {
      lines.push('🏷️ PALAVRAS MAIS FREQUENTES');
      dados.palavrasFrequentes.forEach((p) => {
        lines.push(`  - ${p.palavra} (${p.contagem}x)`);
      });
      lines.push('');
    }

    lines.push(separator);

    const texto = lines.join('\n');

    try {
      await navigator.clipboard.writeText(texto);
      mostrarNotificacao('Relatório copiado para a área de transferência!', 'success');
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = texto;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      mostrarNotificacao('Relatório copiado para a área de transferência!', 'success');
    }
  }

  /**
   * Abre a janela de impressão do navegador.
   */
  function imprimirRelatorio() {
    window.print();
  }

  /**
   * Exporta a tabela de feedbacks detalhados para um arquivo CSV.
   * @param {Object} dados — Objeto de resultados da análise
   */
  function exportarCsv(dados) {
    if (!dados || !dados.feedbacksDetalhados || dados.feedbacksDetalhados.length === 0) {
      mostrarNotificacao('Não há dados para exportar.', 'error');
      return;
    }

    const headers = ['#', 'Feedback', 'Sentimento'];
    const rows = dados.feedbacksDetalhados.map((f, i) => [
      i + 1,
      `"${f.texto.replace(/"/g, '""')}"`, // escape quotes
      f.sentimento
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'feedbacks_analise.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    mostrarNotificacao('Download do CSV iniciado.', 'success');
  }

  /**
   * Anima um elemento numérico de 0 até o valor final.
   */
  function animarContador(elemento, valorFinal, duracao = 1500) {
    if (!elemento) return;
    let valorInicial = 0;
    let tempoInicio = null;
    const formatador = new Intl.NumberFormat('pt-BR');

    function passo(tempo) {
      if (!tempoInicio) tempoInicio = tempo;
      const progresso = Math.min((tempo - tempoInicio) / duracao, 1);
      
      // Easing out easeOutQuart
      const ease = 1 - Math.pow(1 - progresso, 4);
      const valorAtual = valorInicial + (valorFinal - valorInicial) * ease;
      
      // Se for float (nota geral), manter 1 casa decimal, senão int
      if (valorFinal % 1 !== 0) {
        elemento.textContent = valorAtual.toFixed(1);
      } else {
        elemento.textContent = formatador.format(Math.floor(valorAtual));
      }

      if (progresso < 1) {
        requestAnimationFrame(passo);
      } else {
        // Garantir valor final exato
        elemento.textContent = valorFinal % 1 !== 0 ? valorFinal.toFixed(1) : formatador.format(valorFinal);
      }
    }
    requestAnimationFrame(passo);
  }

  /**
   * Salva uma análise no histórico (localStorage).
   */
  function salvarHistorico(dados) {
    try {
      let historico = carregarHistorico();
      const registro = {
        data: new Date().toISOString(),
        total: dados.total,
        notaGeral: dados.notaGeral,
        sentimentoGeral: dados.sentimentoGeral
      };
      historico.unshift(registro);
      if (historico.length > 5) historico = historico.slice(0, 5); // Manter os últimos 5
      localStorage.setItem('fp_historico', JSON.stringify(historico));
    } catch (e) {
      console.error('Erro ao salvar histórico', e);
    }
  }

  /**
   * Carrega o histórico de análises do localStorage.
   */
  function carregarHistorico() {
    try {
      const historicoStr = localStorage.getItem('fp_historico');
      return historicoStr ? JSON.parse(historicoStr) : [];
    } catch (e) {
      return [];
    }
  }

  return {
    mostrarNotificacao,
    validarFeedbacks,
    contarFeedbacks,
    contarCaracteres,
    copiarRelatorio,
    imprimirRelatorio,
    exportarCsv,
    animarContador,
    salvarHistorico,
    carregarHistorico
  };
})();
