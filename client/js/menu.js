/**
 * FeedbackPulse - Fluid Menu
 * Gerenciamento de estado do menu expansível
 */

const FluidMenu = (() => {
  let container;
  let trigger;

  function init() {
    container = document.getElementById('fluidMenuContainer');
    trigger = document.getElementById('fluidMenuTrigger');

    if (container && trigger) {
      trigger.addEventListener('click', toggleMenu);
      
      // Fechar ao clicar fora
      document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
          fecharMenu();
        }
      });
    }
  }

  function toggleMenu(e) {
    e.stopPropagation();
    const isExpanded = container.getAttribute('data-expanded') === 'true';
    if (isExpanded) {
      fecharMenu();
    } else {
      abrirMenu();
    }
  }

  function abrirMenu() {
    container.setAttribute('data-expanded', 'true');
  }

  function fecharMenu() {
    container.setAttribute('data-expanded', 'false');
  }

  return { init, abrirMenu, fecharMenu };
})();

document.addEventListener('DOMContentLoaded', FluidMenu.init);
