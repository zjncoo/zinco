
document.addEventListener('DOMContentLoaded', () => {
  // ============================================================
  // BRANDING GRID — carica dati dal JSON
  // ============================================================
  const toWebp = (url) => {
    if (typeof url !== 'string') return '';
    return url.replace(/\.(jpe?g|png)$/i, '.webp');
  };

  fetch('piedibus_mozzate-branding-data.json')
    .then(response => {
      if (!response.ok) throw new Error(`Errore nel caricamento: ${response.status}`);
      return response.json();
    })
    .then(data => {
      const heroTitle = document.getElementById('hero-title');
      const mainGrid = document.getElementById('brandingGrid');
      const glanceGrid = document.getElementById('glance-grid');

      // Imposta il titolo hero dal campo naming
      const namingItem = data.find(item => item.label === 'naming');
      if (heroTitle && namingItem) {
        heroTitle.textContent = namingItem.content;
      }

      // --- GRIGLIA PRINCIPALE ---
      data.forEach((item, index) => {
        const uniqueId = `content-item-${index}`;

        if (item.type === 'header') {
          const headerItem = document.createElement('div');
          headerItem.classList.add('branding-header');
          headerItem.innerHTML = `<h2>${item.label}</h2>`;
          mainGrid.appendChild(headerItem);
        } else {
          let mainItem;

          if (item.type === 'figma') {
            mainItem = document.createElement('a');
            mainItem.href = item.embedUrl;
            mainItem.target = '_blank';
            mainItem.rel = 'noopener noreferrer';
            mainItem.innerHTML = `<h3>${item.label}</h3><p>Open prototype →</p>`;
          } else {
            mainItem = document.createElement('div');
            if (item.type === 'color') {
              mainItem.style.backgroundColor = item.hex;
              mainItem.innerHTML = `<h3>${item.label || ''}</h3>`;
            } else if (item.type === 'image') {
              const title = document.createElement('h3');
              title.textContent = item.label;
              const img = document.createElement('img');
              // Usa src diretto per SVG, altrimenti prova webp
              img.src = item.src.endsWith('.svg') ? item.src : toWebp(item.src);
              img.alt = item.label;
              img.loading = 'lazy';
              img.decoding = 'async';
              mainItem.append(title, img);
            } else if (item.type === 'text') {
              mainItem.innerHTML = `<h3>${item.label}</h3><p>${item.content}</p>`;
            }
          }

          mainItem.id = uniqueId;
          mainItem.classList.add('branding-item', 'cursor-target');
          if (item.subtype === 'app-screenshot') {
            mainItem.classList.add('full-width-app');
          }

          mainGrid.appendChild(mainItem);
        }
      });

      // --- GRIGLIA "AT A GLANCE" ---
      data.forEach((item, index) => {
        const isGraphical = item.type === 'image' || item.type === 'color' || item.type === 'figma';
        if (isGraphical) {
          const uniqueId = `content-item-${index}`;
          const glanceLink = document.createElement('a');
          glanceLink.href = `#${uniqueId}`;
          glanceLink.classList.add('glance-item', 'cursor-target');
          if (item.type === 'color') {
            glanceLink.style.backgroundColor = item.hex;
          } else if (item.type === 'image') {
            const thumbImg = document.createElement('img');
            thumbImg.src = item.src.endsWith('.svg') ? item.src : toWebp(item.src);
            thumbImg.alt = `Anteprima di ${item.label}`;
            thumbImg.loading = 'lazy';
            thumbImg.decoding = 'async';
            glanceLink.appendChild(thumbImg);
          } else if (item.type === 'figma') {
            glanceLink.classList.add('glance-figma');
            glanceLink.innerHTML = '<span>Figma</span>';
          }
          glanceGrid.appendChild(glanceLink);
        }
      });

      // Smooth scroll per i link del glance grid
      const allLinks = document.querySelectorAll('#glance-grid a, .scroll-down-arrow');
      allLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = link.getAttribute('href');
          if (targetId && typeof window.lenis !== 'undefined') {
            window.lenis.scrollTo(targetId, { duration: 2, offset: -20 });
          }
        });
      });
    })
    .catch(error => {
      console.error('Errore nel caricamento del progetto:', error);
    });

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

  // Carica il font via FontFace API (più affidabile di @font-face per file://)
  // Prova prima il file senza spazi, poi con nome URL-encoded
  const fontUrls = [
    'url("PiedibusMozzate.ttf")',
    'url("PiedibusMozzate%202.54.04%20PM.ttf")'
  ];

  function loadFontAndInit(urlIndex) {
    if (urlIndex >= fontUrls.length) {
      // Fallback: inizializza comunque senza il font custom
      console.warn('PiedibusFont: tutti i tentativi di caricamento falliti. Uso fallback.');
      setInitialFontSize();
      return;
    }

    const face = new FontFace('PiedibusFont', fontUrls[urlIndex]);
    face.load()
      .then(loaded => {
        document.fonts.add(loaded);
        // Forza re-render del display con il font appena caricato
        display.style.fontFamily = 'PiedibusFont, sans-serif';
        console.log('PiedibusFont caricato con successo:', fontUrls[urlIndex]);
        setInitialFontSize();
      })
      .catch(() => {
        // Prova il prossimo URL
        loadFontAndInit(urlIndex + 1);
      });
  }

  // Avvia il caricamento del font
  if (typeof FontFace !== 'undefined') {
    loadFontAndInit(0);
  } else {
    // Browser vecchio: inizializza senza FontFace API
    setInitialFontSize();
  }

  // Aggiorna anche al resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setInitialFontSize, 150);
  });
});
