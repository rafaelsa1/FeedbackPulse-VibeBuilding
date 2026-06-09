/**
 * FeedbackPulse — API Module
 * Handles all communication with the back-end API.
 */
const API = (() => {
  const BASE_URL = '';

  /**
   * Analisa um array de feedbacks enviando ao endpoint POST /api/analisar.
   * @param {string[]} feedbacks — Array de strings de feedback
   * @returns {Promise<Object>} Objeto com os resultados da análise
   */
  async function analisarFeedbacks(feedbacks) {
    try {
      const response = await fetch(`${BASE_URL}/api/analisar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedbacks }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const message =
          errorData?.message ||
          `Erro ao analisar feedbacks (status ${response.status})`;
        throw new Error(message);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error(
          'Não foi possível conectar ao servidor. Verifique se o back-end está rodando.'
        );
      }
      throw error;
    }
  }

  /**
   * Carrega exemplos de feedback do endpoint GET /api/exemplos.
   * @returns {Promise<string[]>} Array de strings de exemplo
   */
  async function carregarExemplos() {
    try {
      const response = await fetch(`${BASE_URL}/api/exemplos`);

      if (!response.ok) {
        throw new Error(
          `Erro ao carregar exemplos (status ${response.status})`
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error(
          'Não foi possível conectar ao servidor. Verifique se o back-end está rodando.'
        );
      }
      throw error;
    }
  }

  return { analisarFeedbacks, carregarExemplos };
})();
