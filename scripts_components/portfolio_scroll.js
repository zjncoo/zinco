document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('portfolioGrid');
  if (!container) return;

  const pdfUrl = container.dataset.pdfSrc || 'about/zinco_portfolio-compressed.pdf';

  const { pdfjsLib } = window;
  if (!pdfjsLib) {
    console.error('PDF.js library non trovata.');
    return;
  }

  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  pdfjsLib.getDocument(pdfUrl).promise.then(async (pdfDoc) => {
    const totalPages = pdfDoc.numPages;
    if (totalPages === 0) return;

    // Calcola il rapporto d'aspetto della prima pagina per i placeholder
    const firstPage = await pdfDoc.getPage(1);
    const firstVP = firstPage.getViewport({ scale: 1.0 });
    const pageAspectRatio = firstVP.height / firstVP.width;
    let currentWidth = window.innerWidth;
    let placeholderH = currentWidth * pageAspectRatio;

    const fragment = document.createDocumentFragment();
    const wrappers = [];

    for (let i = 1; i <= totalPages; i++) {
      const wrapper = document.createElement('div');
      wrapper.className = 'branding-item full-width-app portfolio-page-wrapper';
      wrapper.dataset.pageIndex = i;
      wrapper.dataset.rendered = 'false';
      wrapper.dataset.rendering = 'false';
      wrapper.style.height = `${placeholderH}px`;
      wrapper.style.backgroundColor = '#fafafa';

      fragment.appendChild(wrapper);
      wrappers.push(wrapper);
    }
    container.appendChild(fragment);

    // ── Render singola pagina ──────────────────────────────────────
    const renderOnePage = (wrapper) => {
      if (wrapper.dataset.rendered === 'true' || wrapper.dataset.rendering === 'true') return;
      wrapper.dataset.rendering = 'true';
      loadObserver.unobserve(wrapper);

      const pageIndex = parseInt(wrapper.dataset.pageIndex, 10);
      pdfDoc.getPage(pageIndex).then(page => {
        if (wrapper.dataset.rendered === 'unloaded') {
          wrapper.dataset.rendered = 'false';
          wrapper.dataset.rendering = 'false';
          loadObserver.observe(wrapper);
          return;
        }

        const vp1 = page.getViewport({ scale: 1.0 });
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const scale = (window.innerWidth / vp1.width) * dpr;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };

        page.render(renderContext).promise.then(() => {
          if (wrapper.dataset.rendered === 'unloaded') {
            canvas.width = 1;
            canvas.height = 1;
            wrapper.dataset.rendered = 'false';
            wrapper.dataset.rendering = 'false';
            loadObserver.observe(wrapper);
            return;
          }

          wrapper.dataset.rendered = 'true';
          wrapper.dataset.rendering = 'false';
          wrapper.style.height = '';
          wrapper.style.backgroundColor = '';
          wrapper.innerHTML = '';
          wrapper.appendChild(canvas);

          unloadObserver.observe(wrapper);
        }).catch(err => {
          console.warn(`Errore durante il render della pagina ${pageIndex}:`, err);
          wrapper.dataset.rendering = 'false';
          loadObserver.observe(wrapper);
        });
      }).catch(err => {
        console.warn(`Errore caricamento pagina ${pageIndex}:`, err);
        wrapper.dataset.rendering = 'false';
        loadObserver.observe(wrapper);
      });
    };

    // ── Unload singola pagina per risparmio memoria ────────────────
    const unloadOnePage = (wrapper) => {
      if (wrapper.dataset.rendered !== 'true') {
        if (wrapper.dataset.rendering === 'true') {
          wrapper.dataset.rendered = 'unloaded';
        }
        return;
      }

      const canvas = wrapper.querySelector('canvas');
      if (canvas) {
        canvas.width = 1;
        canvas.height = 1;
        canvas.remove();
      }

      const currentH = window.innerWidth * pageAspectRatio;
      wrapper.style.height = `${currentH}px`;
      wrapper.style.backgroundColor = '#fafafa';
      wrapper.dataset.rendered = 'false';
      wrapper.dataset.rendering = 'false';

      unloadObserver.unobserve(wrapper);
      loadObserver.observe(wrapper);
    };

    // ── Intersection Observers ────────────────────────────────────
    const loadObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          renderOnePage(entry.target);
        }
      });
    }, { rootMargin: '1200px 0px', threshold: 0 });

    const unloadObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          unloadOnePage(entry.target);
        }
      });
    }, { rootMargin: '2500px 0px', threshold: 0 });

    wrappers.forEach(w => loadObserver.observe(w));

    // ── Gestione Resize ───────────────────────────────────────────
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (Math.abs(window.innerWidth - currentWidth) < 10) return;
        currentWidth = window.innerWidth;
        const newH = currentWidth * pageAspectRatio;

        wrappers.forEach(w => {
          if (w.dataset.rendered !== 'true') {
            w.style.height = `${newH}px`;
          } else {
            // Ricarica la pagina visibile alla nuova risoluzione
            unloadOnePage(w);
          }
        });
      }, 250);
    });

  }).catch(error => {
    console.error(`Errore caricamento PDF "${pdfUrl}":`, error);
  });
});
