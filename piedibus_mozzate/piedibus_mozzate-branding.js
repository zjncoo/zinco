/**
 * piedibus_mozzate-branding.js
 * Font tester interactive controls for Piedibus Mozzate
 * (Main branding layout is powered modularly by NUS/branding-project.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  // ============================================================
  // FONT TESTER — controlli interattivi
  // ============================================================
  const display = document.getElementById('font-tester-display');
  const fontSizeSlider = document.getElementById('font-size-slider');
  const fontSizeValue = document.getElementById('font-size-value');
  const letterSpacingSlider = document.getElementById('letter-spacing-slider');
  const letterSpacingValue = document.getElementById('letter-spacing-value');
  const lineHeightSlider = document.getElementById('line-height-slider');
  const lineHeightValue = document.getElementById('line-height-value');

  if (!display || !fontSizeSlider) return;

  function updateDisplay() {
    const size = parseInt(fontSizeSlider.value, 10);
    const spacing = parseFloat(letterSpacingSlider.value);
    const lh = parseFloat(lineHeightSlider.value);

    display.style.fontSize = `${size}px`;
    display.style.letterSpacing = `${(spacing / 100).toFixed(3)}em`;
    display.style.lineHeight = lh.toFixed(2);

    fontSizeValue.textContent = `${size}px`;
    letterSpacingValue.textContent = `${spacing > 0 ? '+' : ''}${spacing}`;
    lineHeightValue.textContent = lh.toFixed(2);
  }

  fontSizeSlider.addEventListener('input', updateDisplay);
  letterSpacingSlider.addEventListener('input', updateDisplay);
  lineHeightSlider.addEventListener('input', updateDisplay);

  // Adatta la dimensione iniziale in base alla viewport
  function setInitialFontSize() {
    const vw = window.innerWidth;
    let initialSize = 80;
    if (vw <= 480) initialSize = 36;
    else if (vw <= 768) initialSize = 48;
    fontSizeSlider.value = initialSize;
    updateDisplay();
  }

  // Carica il font via FontFace API
  const fontUrls = [
    'url("PiedibusMozzate.ttf")',
    'url("PiedibusMozzate%202.54.04%20PM.ttf")'
  ];

  function loadFontAndInit(urlIndex) {
    if (urlIndex >= fontUrls.length) {
      console.warn('PiedibusFont: tutti i tentativi di caricamento falliti. Uso fallback.');
      setInitialFontSize();
      return;
    }

    const face = new FontFace('PiedibusFont', fontUrls[urlIndex]);
    face.load()
      .then(loaded => {
        document.fonts.add(loaded);
        display.style.fontFamily = 'PiedibusFont, sans-serif';
        setInitialFontSize();
      })
      .catch(() => {
        loadFontAndInit(urlIndex + 1);
      });
  }

  if (typeof FontFace !== 'undefined') {
    loadFontAndInit(0);
  } else {
    setInitialFontSize();
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setInitialFontSize, 150);
  });
});
