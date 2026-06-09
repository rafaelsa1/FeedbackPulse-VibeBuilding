/**
 * FeedbackPulse - Ethereal Shadow Animation
 * Convertido para Vanilla JS puro
 */

const Ethereal = (() => {
  let hueValue = 180;
  let animationRef;
  let feColorMatrix;

  // Parâmetros de animação
  const speed = 90; // 1 to 100
  const animationDuration = mapRange(speed, 1, 100, 1000, 50); 
  const step = 360 / (animationDuration * 60 / 25); // increment per frame (assuming 60fps)

  function mapRange(value, fromLow, fromHigh, toLow, toHigh) {
    if (fromLow === fromHigh) return toLow;
    const percentage = (value - fromLow) / (fromHigh - fromLow);
    return toLow + percentage * (toHigh - toLow);
  }

  function init() {
    feColorMatrix = document.getElementById('etherealColorMatrix');
    if (feColorMatrix) {
      animate();
    }
  }

  function animate() {
    hueValue += step;
    if (hueValue >= 360) {
      hueValue -= 360; // Loop back to 0
    }
    
    if (feColorMatrix) {
      feColorMatrix.setAttribute('values', hueValue.toString());
    }

    animationRef = requestAnimationFrame(animate);
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', Ethereal.init);
