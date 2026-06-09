/**
 * FeedbackPulse — Charts Module
 * Manages Chart.js chart instances for the dashboard.
 */
const Charts = (() => {
  let pizzaChart = null;
  let barrasChart = null;

  // Dark-theme color palette
  const COLORS = {
    positive: '#10b981',
    neutral: '#f59e0b',
    negative: '#ef4444',
    textPrimary: '#e2e8f0',
    textSecondary: '#94a3b8',
    gridLine: 'rgba(255, 255, 255, 0.06)',
  };

  /**
   * Cria o gráfico de rosca (doughnut) de distribuição de sentimentos.
   * @param {number} positivos
   * @param {number} neutros
   * @param {number} negativos
   */
  function criarGraficoPizza(positivos, neutros, negativos) {
    if (pizzaChart) {
      pizzaChart.destroy();
      pizzaChart = null;
    }

    const ctx = document.getElementById('chartPizza');
    if (!ctx) return;

    const total = positivos + neutros + negativos;

    // Custom center-text plugin
    const centerTextPlugin = {
      id: 'centerText',
      afterDraw(chart) {
        const { width, height, ctx: context } = chart;
        context.save();
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        const centerX = width / 2;
        const centerY = height / 2;

        // Total number
        context.font = 'bold 28px Inter, sans-serif';
        context.fillStyle = COLORS.textPrimary;
        context.fillText(total, centerX, centerY - 10);

        // Label
        context.font = '13px Inter, sans-serif';
        context.fillStyle = COLORS.textSecondary;
        context.fillText('feedbacks', centerX, centerY + 14);

        context.restore();
      },
    };

    pizzaChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Positivos', 'Neutros', 'Negativos'],
        datasets: [
          {
            data: [positivos, neutros, negativos],
            backgroundColor: [
              COLORS.positive,
              COLORS.neutral,
              COLORS.negative,
            ],
            borderColor: 'rgba(10, 10, 26, 0.8)',
            borderWidth: 3,
            hoverBorderColor: '#fff',
            hoverBorderWidth: 2,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '65%',
        animation: {
          animateScale: true,
          animateRotate: true,
          duration: 1200,
          easing: 'easeOutQuart',
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: COLORS.textPrimary,
              font: { family: 'Inter, sans-serif', size: 13 },
              padding: 20,
              usePointStyle: true,
              pointStyleWidth: 12,
            },
          },
          tooltip: {
            backgroundColor: 'rgba(10, 10, 26, 0.9)',
            titleColor: COLORS.textPrimary,
            bodyColor: COLORS.textSecondary,
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            cornerRadius: 8,
            padding: 12,
            titleFont: { family: 'Inter, sans-serif', weight: '600' },
            bodyFont: { family: 'Inter, sans-serif' },
            callbacks: {
              label(context) {
                const value = context.parsed;
                const pct = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return ` ${context.label}: ${value} (${pct}%)`;
              },
            },
          },
        },
      },
      plugins: [centerTextPlugin],
    });
  }

  /**
   * Cria o gráfico de barras horizontais das palavras mais frequentes.
   * @param {Array<{palavra: string, contagem: number, tipo: string}>} palavrasFrequentes
   */
  function criarGraficoBarras(palavrasFrequentes) {
    if (barrasChart) {
      barrasChart.destroy();
      barrasChart = null;
    }

    const ctx = document.getElementById('chartBarras');
    if (!ctx) return;

    // Limit to top 8 words
    const palavras = (palavrasFrequentes || []).slice(0, 8);
    const labels = palavras.map((p) => p.palavra);
    const data = palavras.map((p) => p.contagem);
    const colors = palavras.map((p) =>
      p.tipo === 'negativa' ? COLORS.negative : COLORS.positive
    );

    barrasChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Frequência',
            data,
            backgroundColor: colors.map((c) => c + 'cc'),
            borderColor: colors,
            borderWidth: 1,
            borderRadius: 6,
            borderSkipped: false,
            barThickness: 28,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        indexAxis: 'y',
        animation: {
          duration: 1000,
          easing: 'easeOutQuart',
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              color: COLORS.textSecondary,
              font: { family: 'Inter, sans-serif', size: 12 },
              stepSize: 1,
            },
            grid: {
              color: COLORS.gridLine,
              drawBorder: false,
            },
          },
          y: {
            ticks: {
              color: COLORS.textPrimary,
              font: { family: 'Inter, sans-serif', size: 13, weight: '500' },
            },
            grid: {
              display: false,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: 'rgba(10, 10, 26, 0.9)',
            titleColor: COLORS.textPrimary,
            bodyColor: COLORS.textSecondary,
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            cornerRadius: 8,
            padding: 12,
            titleFont: { family: 'Inter, sans-serif', weight: '600' },
            bodyFont: { family: 'Inter, sans-serif' },
            callbacks: {
              label(context) {
                return ` Menções: ${context.parsed.x}`;
              },
            },
          },
        },
      },
    });
  }

  /**
   * Destrói os gráficos existentes (para limpeza ao iniciar nova análise).
   */
  function destruirGraficos() {
    if (pizzaChart) {
      pizzaChart.destroy();
      pizzaChart = null;
    }
    if (barrasChart) {
      barrasChart.destroy();
      barrasChart = null;
    }
  }

  return { criarGraficoPizza, criarGraficoBarras, destruirGraficos };
})();
