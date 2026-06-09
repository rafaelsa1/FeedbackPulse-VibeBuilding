/**
 * FeedbackPulse — Main Application Module
 * Orchestrates navigation, API calls, and dashboard rendering.
 */
const App = (() => {
  // ─── State ───
  let dadosAnalise = null;
  let telaAtual = 'hero';

  // ─── DOM References (cached on init) ───
  let els = {};

  /**
   * Initialise the application: cache DOM, bind events, set up counters.
   */
  function init() {
    // Cache elements
    els = {
      hero: document.getElementById('hero'),
      analise: document.getElementById('analise'),
      dashboard: document.getElementById('dashboard'),
      feedbackInput: document.getElementById('feedbackInput'),
      feedbackCounter: document.getElementById('feedbackCounter'),
      charCounter: document.getElementById('charCounter'),
      loadingOverlay: document.getElementById('loadingOverlay'),
      metricasGrid: document.getElementById('metricasGrid'),
      sentimentoCard: document.getElementById('sentimentoCard'),
      notaCard: document.getElementById('notaCard'),
      problemasLista: document.getElementById('problemasLista'),
      sugestoesLista: document.getElementById('sugestoesLista'),
      palavrasContainer: document.getElementById('palavrasContainer'),
      feedbacksTabela: document.getElementById('feedbacksTabela'),
      toastContainer: document.getElementById('toastContainer'),
      btnComecar: document.getElementById('btnComecar'),
      btnAnalisar: document.getElementById('btnAnalisar'),
      btnExemplos: document.getElementById('btnExemplos'),
      btnImportar: document.getElementById('btnImportar'),
      arquivoInput: document.getElementById('arquivoInput'),
      btnLimpar: document.getElementById('btnLimpar'),
      btnNovaAnaliseNav: document.getElementById('btnNovaAnaliseNav'),
      logoLink: document.getElementById('logoLink'),
      fluidMenuWrapper: document.getElementById('fluidMenuWrapper'),
      fmNovaAnalise: document.getElementById('fmNovaAnalise'),
      fmImprimir: document.getElementById('fmImprimir'),
      fmCsv: document.getElementById('fmCsv'),
      fmHistorico: document.getElementById('fmHistorico'),
      tableFilters: document.getElementById('tableFilters'),
    };

    // Event listeners
    els.btnComecar.addEventListener('click', () => navegarPara('analise'));
    els.btnAnalisar.addEventListener('click', analisar);
    els.btnExemplos.addEventListener('click', carregarExemplos);
    els.btnLimpar.addEventListener('click', limpar);
    
    // File upload logic
    if (els.btnImportar && els.arquivoInput) {
      els.btnImportar.addEventListener('click', () => els.arquivoInput.click());
      els.arquivoInput.addEventListener('change', lerArquivo);
    }
    
    // Table filter logic
    if (els.tableFilters) {
      els.tableFilters.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
          Array.from(els.tableFilters.querySelectorAll('.filter-btn')).forEach(btn => btn.classList.remove('active'));
          e.target.classList.add('active');
          renderizarTabela(dadosAnalise, e.target.dataset.filter);
        }
      });
    }

    els.btnNovaAnaliseNav.addEventListener('click', (e) => {
      e.preventDefault();
      novaAnalise();
    });
    els.logoLink.addEventListener('click', (e) => {
      e.preventDefault();
      navegarPara('hero');
    });

    // Fluid menu actions
    if (els.fmNovaAnalise) {
      els.fmNovaAnalise.addEventListener('click', (e) => { e.preventDefault(); FluidMenu.fecharMenu(); novaAnalise(); });
      els.fmImprimir.addEventListener('click', (e) => { e.preventDefault(); FluidMenu.fecharMenu(); Utils.imprimirRelatorio(); });
      els.fmCsv.addEventListener('click', (e) => { e.preventDefault(); FluidMenu.fecharMenu(); if(dadosAnalise) Utils.exportarCsv(dadosAnalise); });
      els.fmHistorico.addEventListener('click', (e) => { e.preventDefault(); FluidMenu.fecharMenu(); verHistorico(); });
    }

    // Live textarea counter
    els.feedbackInput.addEventListener('input', atualizarContador);
  }

  // ─── Navigation ───

  /**
   * Navigate between the three main views.
   * @param {'hero'|'analise'|'dashboard'} tela
   */
  function navegarPara(tela) {
    // Hide all sections
    els.hero.classList.add('hidden');
    els.analise.classList.add('hidden');
    els.dashboard.classList.add('hidden');

    // Show target
    const targetEl = els[tela];
    if (targetEl) {
      targetEl.classList.remove('hidden');
      targetEl.classList.add('fade-in');
      setTimeout(() => targetEl.classList.remove('fade-in'), 600);
    }

    telaAtual = tela;

    // Toggle nav "Nova Análise" link visibility
    if (tela === 'dashboard') {
      els.btnNovaAnaliseNav.classList.remove('hidden');
      if (els.fluidMenuWrapper) els.fluidMenuWrapper.classList.remove('hidden');
    } else {
      els.btnNovaAnaliseNav.classList.add('hidden');
      if (els.fluidMenuWrapper) els.fluidMenuWrapper.classList.add('hidden');
    }

    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ─── Analysis Flow ───

  /**
   * Validate, send feedbacks to API, and render the dashboard.
   */
  async function analisar() {
    const texto = els.feedbackInput.value;
    const resultado = Utils.validarFeedbacks(texto);

    if (!resultado.valido) {
      Utils.mostrarNotificacao(resultado.mensagem, 'error');
      return;
    }

    // Show loading
    els.loadingOverlay.classList.remove('hidden');

    try {
      const dados = await API.analisarFeedbacks(resultado.feedbacks);
      dadosAnalise = dados;

      // Navigate to dashboard
      navegarPara('dashboard');
      renderizarDashboard(dados);
      Utils.salvarHistorico(dados);
      Utils.mostrarNotificacao(
        `Análise concluída! ${dados.total} feedbacks processados.`,
        'success'
      );
    } catch (error) {
      Utils.mostrarNotificacao(
        error.message || 'Erro ao analisar feedbacks. Tente novamente.',
        'error'
      );
    } finally {
      els.loadingOverlay.classList.add('hidden');
    }
  }

  /**
   * Mostra o histórico local (simplificado no Toast para não criar tela nova)
   */
  function verHistorico() {
    const historico = Utils.carregarHistorico();
    if (historico.length === 0) {
      Utils.mostrarNotificacao('Nenhuma análise no histórico.', 'info');
      return;
    }
    const recents = historico.map((h) => `${new Date(h.data).toLocaleDateString()} - ${h.total} fb, Nota: ${h.notaGeral}`).join('\n');
    alert("Histórico Recente:\n\n" + recents);
  }

  /**
   * Load example feedbacks from the API.
   */
  async function carregarExemplos() {
    try {
      const exemplos = await API.carregarExemplos();
      if (exemplos && exemplos.length > 0) {
        els.feedbackInput.value = exemplos.join('\n');
        atualizarContador();
        Utils.mostrarNotificacao(
          `${exemplos.length} exemplos carregados com sucesso!`,
          'success'
        );
      } else {
        Utils.mostrarNotificacao('Nenhum exemplo disponível.', 'info');
      }
    } catch (error) {
      Utils.mostrarNotificacao(
        error.message || 'Erro ao carregar exemplos.',
        'error'
      );
    }
  }

  /**
   * Reads the uploaded file and populates the textarea.
   */
  function lerArquivo(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
      els.feedbackInput.value = evt.target.result;
      atualizarContador();
      Utils.mostrarNotificacao('Arquivo carregado com sucesso!', 'success');
      els.arquivoInput.value = ''; // Reset
    };
    reader.onerror = function() {
      Utils.mostrarNotificacao('Erro ao ler o arquivo.', 'error');
    };
    reader.readAsText(file);
  }

  /**
   * Clear the textarea.
   */
  function limpar() {
    els.feedbackInput.value = '';
    atualizarContador();
    Utils.mostrarNotificacao('Feedbacks limpos.', 'info');
  }

  /**
   * Go back to analysis screen without clearing input.
   */
  function novaAnalise() {
    Charts.destruirGraficos();
    navegarPara('analise');
  }

  /**
   * Update feedback and character counters.
   */
  function atualizarContador() {
    const texto = els.feedbackInput.value;
    const count = Utils.contarFeedbacks(texto);
    const chars = Utils.contarCaracteres(texto);
    els.feedbackCounter.textContent = `${count} feedback${count !== 1 ? 's' : ''}`;
    els.charCounter.textContent = `${chars} caractere${chars !== 1 ? 's' : ''}`;
  }

  // ─── Dashboard Rendering ───

  /**
   * Render the entire dashboard from analysis data.
   * @param {Object} dados
   */
  function renderizarDashboard(dados) {
    renderizarMetricas(dados);
    renderizarSentimento(dados);
    renderizarNota(dados);
    renderizarProblemas(dados);
    renderizarSugestoes(dados);
    renderizarPalavras(dados);
    renderizarTabela(dados);

    // Reiniciar SVG icons
    if (window.lucide) {
      lucide.createIcons();
    }

    // Charts (slight delay so canvas is visible)
    setTimeout(() => {
      Charts.criarGraficoPizza(dados.positivos, dados.neutros, dados.negativos);
      Charts.criarGraficoBarras(dados.palavrasFrequentes);
    }, 300);
  }

  /**
   * Render the 4 top metric cards.
   */
  function renderizarMetricas(dados) {
    const metricas = [
      { valor: dados.total, label: 'Total de Feedbacks', icon: 'file-text', cor: '' },
      { valor: dados.positivos, label: 'Positivos', icon: 'smile', cor: 'var(--color-positive)' },
      { valor: dados.neutros, label: 'Neutros', icon: 'meh', cor: 'var(--color-neutral)' },
      { valor: dados.negativos, label: 'Negativos', icon: 'frown', cor: 'var(--color-negative)' },
    ];

    els.metricasGrid.innerHTML = metricas
      .map(
        (m, i) => `
      <div class="metrica-card stagger-${i + 1}">
        <i data-lucide="${m.icon}" class="metrica-icon" style="color: ${m.cor || 'inherit'};"></i>
        <div class="metrica-valor" id="metricaValor${i}" ${m.cor ? `style="-webkit-text-fill-color:${m.cor};background:none;"` : ''}>0</div>
        <div class="metrica-label">${m.label}</div>
      </div>`
      )
      .join('');

    // Animate numbers
    setTimeout(() => {
      metricas.forEach((m, i) => {
        Utils.animarContador(document.getElementById(`metricaValor${i}`), m.valor);
      });
    }, 100);
  }

  /**
   * Render the overall sentiment highlight card.
   */
  function renderizarSentimento(dados) {
    const sentimento = (dados.sentimentoGeral || 'neutro').toLowerCase();
    const map = {
      positivo: { icon: 'smile', texto: 'Positivo', desc: 'A maioria dos feedbacks expressa satisfação.', classe: 'sentimento-positivo', cor: 'var(--color-positive)' },
      neutro:   { icon: 'meh', texto: 'Neutro', desc: 'Os feedbacks são equilibrados entre positivos e negativos.', classe: 'sentimento-neutro', cor: 'var(--color-neutral)' },
      negativo: { icon: 'frown', texto: 'Negativo', desc: 'A maioria dos feedbacks expressa insatisfação.', classe: 'sentimento-negativo', cor: 'var(--color-negative)' },
    };
    const info = map[sentimento] || map.neutro;

    els.sentimentoCard.className = `sentimento-card ${info.classe} stagger-5`;
    els.sentimentoCard.innerHTML = `
      <i data-lucide="${info.icon}" class="sentimento-emoji" style="display:inline-block; width:64px; height:64px; margin-bottom:1rem; color:${info.cor};"></i>
      <div class="sentimento-texto" style="color:${info.cor}">${info.texto}</div>
      <div class="sentimento-descricao">${info.desc}</div>
    `;
  }

  /**
   * Render the overall score card with progress bar and trend indicator.
   */
  function renderizarNota(dados) {
    const nota = dados.notaGeral ?? 0;
    const pct = Math.min((nota / 10) * 100, 100);
    let cor = 'var(--color-positive)';
    let desc = 'Excelente! Os clientes estão muito satisfeitos.';
    let iconTrend = 'trending-up';

    if (nota < 4) {
      cor = 'var(--color-negative)';
      desc = 'Atenção! Há muitos pontos de melhoria.';
      iconTrend = 'trending-down';
    } else if (nota < 7) {
      cor = 'var(--color-neutral)';
      desc = 'Satisfação moderada. Há espaço para melhorias.';
      iconTrend = 'minus';
    }

    // Calcular tendência com o histórico
    const historico = Utils.carregarHistorico();
    let trendHtml = '';
    if (historico.length > 0) {
      // Pega o primeiro registro (que é a última análise salva ANTES dessa atual, pois já salvamos essa? 
      // Não, a atual foi salva no inicio de analisar(), então o índice 0 é a atual. O índice 1 é a anterior.)
      // Espera, Utils.salvarHistorico() foi chamado logo antes de renderizarDashboard().
      // Então historico[1] é a análise anterior.
      if (historico.length > 1) {
        const anterior = historico[1].notaGeral;
        const diff = (nota - anterior).toFixed(1);
        if (diff > 0) {
          trendHtml = `<span style="font-size:0.8rem; padding:0.2rem 0.5rem; background:rgba(16,185,129,0.15); color:var(--color-positive); border-radius:12px; margin-left:0.5rem;"><i data-lucide="arrow-up-right" style="width:14px; height:14px; display:inline-block; vertical-align:text-bottom;"></i> +${diff}</span>`;
        } else if (diff < 0) {
          trendHtml = `<span style="font-size:0.8rem; padding:0.2rem 0.5rem; background:rgba(239,68,68,0.15); color:var(--color-negative); border-radius:12px; margin-left:0.5rem;"><i data-lucide="arrow-down-right" style="width:14px; height:14px; display:inline-block; vertical-align:text-bottom;"></i> ${diff}</span>`;
        } else {
          trendHtml = `<span style="font-size:0.8rem; padding:0.2rem 0.5rem; background:rgba(255,255,255,0.1); color:var(--text-secondary); border-radius:12px; margin-left:0.5rem;">= 0.0</span>`;
        }
      }
    }

    els.notaCard.className = 'nota-card stagger-6';
    els.notaCard.innerHTML = `
      <div style="display:flex; justify-content:center; align-items:center; gap:0.5rem; margin-bottom:0.5rem;">
        <i data-lucide="${iconTrend}" style="color:${cor};"></i>
      </div>
      <div class="nota-valor" style="color:${cor}"><span id="notaValorAnimated">0.0</span><span class="nota-max">/10</span> ${trendHtml}</div>
      <div class="nota-barra-container">
        <div class="nota-barra-fill" style="width:0%;background:${cor}"></div>
      </div>
      <div class="nota-descricao">${desc}</div>
    `;

    // Animate progress bar and number
    requestAnimationFrame(() => {
      setTimeout(() => {
        const fill = els.notaCard.querySelector('.nota-barra-fill');
        if (fill) fill.style.width = `${pct}%`;
        Utils.animarContador(document.getElementById('notaValorAnimated'), nota);
      }, 100);
    });
  }

  /**
   * Render the problems list.
   */
  function renderizarProblemas(dados) {
    const problemas = dados.problemas || [];
    if (problemas.length === 0) {
      els.problemasLista.innerHTML = `<div class="no-data"><i data-lucide="check-circle" style="display:inline-block; vertical-align:text-bottom; margin-right:4px;"></i> Nenhum problema identificado!</div>`;
      return;
    }

    els.problemasLista.innerHTML = problemas
      .map(
        (p) => `
      <div class="problema-item">
        <i data-lucide="target" class="problema-icon"></i>
        <span class="problema-texto">${escapeHTML(p.categoria)}</span>
        <span class="problema-badge">${p.mencoes} menções</span>
      </div>`
      )
      .join('');
  }

  /**
   * Render the suggestions list.
   */
  function renderizarSugestoes(dados) {
    const sugestoes = dados.sugestoes || [];
    if (sugestoes.length === 0) {
      els.sugestoesLista.innerHTML = `<div class="no-data">Nenhuma sugestão gerada.</div>`;
      return;
    }

    els.sugestoesLista.innerHTML = sugestoes
      .map(
        (s) => `
      <div class="sugestao-item">
        <i data-lucide="check" style="color:var(--color-positive); width:18px; flex-shrink:0;"></i>
        <span class="sugestao-texto">${escapeHTML(s)}</span>
      </div>`
      )
      .join('');
  }

  /**
   * Render the frequent words as pill badges.
   */
  function renderizarPalavras(dados) {
    const palavras = dados.palavrasFrequentes || [];
    if (palavras.length === 0) {
      els.palavrasContainer.innerHTML = `<div class="no-data">Nenhuma palavra frequente encontrada.</div>`;
      return;
    }

    els.palavrasContainer.innerHTML = palavras
      .map((p) => {
        let classe = 'palavra-neutra';
        if (p.tipo === 'positiva') classe = 'palavra-positiva';
        else if (p.tipo === 'negativa') classe = 'palavra-negativa';

        return `<span class="palavra-tag ${classe}">${escapeHTML(p.palavra)} <span class="palavra-contagem">${p.contagem}x</span></span>`;
      })
      .join('');
  }

  /**
   * Render the detailed feedback table.
   * @param {Object} dados
   * @param {string} filter - 'todos', 'positivo', 'neutro', 'negativo'
   */
  function renderizarTabela(dados, filter = 'todos') {
    if (!dados || !dados.feedbacksDetalhados) return;
    
    let feedbacks = dados.feedbacksDetalhados;
    
    if (filter !== 'todos') {
      feedbacks = feedbacks.filter(f => (f.sentimento || 'neutro').toLowerCase() === filter);
    }

    if (feedbacks.length === 0) {
      els.feedbacksTabela.innerHTML = `<tr><td colspan="3" class="no-data">Nenhum feedback encontrado para este filtro.</td></tr>`;
      return;
    }

    els.feedbacksTabela.innerHTML = feedbacks
      .map((f, i) => {
        const sentimento = (f.sentimento || 'neutro').toLowerCase();
        const badgeClass = `badge-${sentimento}`;
        const badgeLabel = sentimento.charAt(0).toUpperCase() + sentimento.slice(1);
        const textoTruncado = f.texto.length > 120 ? f.texto.substring(0, 120) + '…' : f.texto;

        return `
        <tr>
          <td class="td-index">${i + 1}</td>
          <td class="td-texto" title="${escapeHTML(f.texto)}">${escapeHTML(textoTruncado)}</td>
          <td class="td-sentimento"><span class="${badgeClass}">${badgeLabel}</span></td>
        </tr>`;
      })
      .join('');
  }

  // ─── Helpers ───

  /**
   * Escape HTML special characters to prevent XSS.
   */
  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ─── Bootstrap ───
  document.addEventListener('DOMContentLoaded', init);

  return { init };
})();
