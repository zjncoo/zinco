document.addEventListener('DOMContentLoaded', () => {

  const canvas = document.getElementById('pdfCanvas');
  if (!canvas) return;
  const url = canvas.dataset.pdfSource;
  if (!url) {
    console.error("Attributo 'data-pdf-source' non trovato sull'elemento #pdfCanvas.");
    return;
  }

  let pdfDoc = null,
      pageNum = 1,
      pageRendering = false,
      pageNumPending = null,
      scale = 1.5,
      ctx = canvas.getContext('2d');

  const pageNumSpan  = document.getElementById('pageNum');
  const pageNumInput = document.getElementById('pageNumInput');
  const pageCountSpan = document.getElementById('pageCount');

  // ── Desktop: render singola pagina su canvas ──────────────────────────────
  function renderPage(num) {
    pageRendering = true;
    pdfDoc.getPage(num).then(page => {
      const viewport = page.getViewport({ scale });
      canvas.height = viewport.height;
      canvas.width  = viewport.width;
      page.render({ canvasContext: ctx, viewport }).promise.then(() => {
        pageRendering = false;
        if (pageNumPending !== null) {
          renderPage(pageNumPending);
          pageNumPending = null;
        }
      });
      pageNumSpan.textContent = num;
    });
  }

  function queueRenderPage(num) {
    if (pageRendering) { pageNumPending = num; } else { renderPage(num); }
  }

  function onPrevPage() { if (pageNum <= 1) return; pageNum--; queueRenderPage(pageNum); }
  function onNextPage() { if (pageNum >= pdfDoc.numPages) return; pageNum++; queueRenderPage(pageNum); }

  document.getElementById('prevPage').addEventListener('click', onPrevPage);
  document.getElementById('nextPage').addEventListener('click', onNextPage);

  function showPageInput() {
    pageNumSpan.style.display = 'none';
    pageNumInput.style.display = 'inline-block';
    pageNumInput.value = pageNum;
    pageNumInput.focus();
    pageNumInput.select();
  }
  function hidePageInput() {
    pageNumInput.style.display = 'none';
    pageNumSpan.style.display = 'inline-block';
  }
  function handlePageInput() {
    if (pageNumInput.style.display === 'none') return;
    let p = parseInt(pageNumInput.value, 10);
    if (isNaN(p)) p = 1;
    p = Math.max(1, Math.min(p, pdfDoc.numPages));
    pageNum = p;
    queueRenderPage(pageNum);
    hidePageInput();
  }

  pageNumSpan.addEventListener('click', showPageInput);
  pageNumInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); handlePageInput(); } });
  pageNumInput.addEventListener('blur', handlePageInput);

  // ── Caricamento documento ─────────────────────────────────────────────────
  pdfjsLib.getDocument(url).promise.then(async pdfDoc_ => {
    pdfDoc = pdfDoc_;

    if (window.innerWidth <= 768) {
      // ══════════════════════════════════════════════════════════════════════
      // MOBILE: Lazy load + Windowed unload con IntersectionObserver
      //
      // Strategia memoria:
      //  1. Crea placeholder per tutte le pagine (layout immediato)
      //  2. loadObserver  → renderizza quando una pagina si avvicina (500px)
      //  3. unloadObserver → distrugge il canvas quando è troppo lontano (2000px)
      //     e rimette il placeholder, così la memoria è sempre limitata a
      //     poche pagine alla volta indipendentemente dalla lunghezza del PDF
      // ══════════════════════════════════════════════════════════════════════

      canvas.style.display = 'none';
      const controls = document.querySelector('.pdf-controls');
      if (controls) controls.style.display = 'none';

      const container = document.getElementById('pdfViewerContainer');
      if (container) {
        container.style.maxWidth = '100%';
        container.style.padding  = '0';
        container.style.gap      = '0';
        container.style.width    = '100%';
      }

      const viewportWidth = window.innerWidth;

      // ── Calcolo scale ────────────────────────────────────────────────────
      // Non includiamo devicePixelRatio nel calcolo: useremmo troppa RAM su 3x.
      // baseScale mappa il PDF esattamente alla larghezza CSS del viewport.
      // Moltiplichiamo x1.5 per qualità accettabile, cap a 2.0.
      const firstPage       = await pdfDoc.getPage(1);
      const firstVP         = firstPage.getViewport({ scale: 1.0 });
      const baseScale       = viewportWidth / firstVP.width;
      const finalScale      = Math.min(baseScale * 1.5, 2.0);
      const pageAspectRatio = firstVP.height / firstVP.width;
      const placeholderH    = viewportWidth * pageAspectRatio;

      // ── Placeholder per tutte le pagine ──────────────────────────────────
      const fragment = document.createDocumentFragment();
      const wrappers = [];

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const wrapper = document.createElement('div');
        wrapper.className      = 'pdf-page-wrapper';
        wrapper.dataset.pageIndex  = i;
        wrapper.dataset.rendered   = 'false';
        wrapper.style.cssText = [
          'width:100%', 'display:block', 'margin:0', 'padding:0',
          'line-height:0', 'position:relative',
          `height:${placeholderH}px`, 'background-color:#f0f0f0',
        ].join(';');
        fragment.appendChild(wrapper);
        wrappers.push(wrapper);
      }
      container.appendChild(fragment);

      // ── Funzioni render / unload ──────────────────────────────────────────

      const renderOnePage = (wrapper) => {
        if (wrapper.dataset.rendered === 'true') return;
        wrapper.dataset.rendered = 'true';
        loadObserver.unobserve(wrapper);

        const pageIndex = parseInt(wrapper.dataset.pageIndex, 10);
        pdfDoc.getPage(pageIndex).then(page => {
          // Se nel frattempo è stato unloaded, non fare nulla
          if (wrapper.dataset.rendered !== 'true') return;

          const viewport    = page.getViewport({ scale: finalScale });
          const pageCanvas  = document.createElement('canvas');
          const pageCtx     = pageCanvas.getContext('2d');
          pageCanvas.height = viewport.height;
          pageCanvas.width  = viewport.width;
          pageCanvas.style.cssText = 'width:100vw;height:auto;display:block;max-width:100%;';

          // Rimuovi le dimensioni fisse del placeholder
          wrapper.style.height          = '';
          wrapper.style.backgroundColor = '';
          wrapper.appendChild(pageCanvas);

          page.render({ canvasContext: pageCtx, viewport }).promise
            .then(() => {
              // Ora che il canvas è pronto, lo osserviamo per l'eventuale unload
              unloadObserver.observe(wrapper);
            })
            .catch(err => console.warn(`PDF render error p.${pageIndex}:`, err));
        });
      };

      const unloadOnePage = (wrapper) => {
        if (wrapper.dataset.rendered !== 'true') return;

        const pageCanvas = wrapper.querySelector('canvas');
        if (pageCanvas) {
          // Azzera le dimensioni del canvas per liberare subito GPU/RAM
          pageCanvas.width  = 1;
          pageCanvas.height = 1;
          pageCanvas.remove();
        }

        // Ripristina il placeholder con le dimensioni corrette
        wrapper.style.height          = `${placeholderH}px`;
        wrapper.style.backgroundColor = '#f0f0f0';
        wrapper.dataset.rendered = 'false';

        unloadObserver.unobserve(wrapper);
        loadObserver.observe(wrapper); // Pronto per essere ricaricato al bisogno
      };

      // ── IntersectionObservers ─────────────────────────────────────────────

      // Carica le pagine entro 500px dal viewport
      const loadObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) renderOnePage(entry.target);
        });
      }, { rootMargin: '500px 0px', threshold: 0 });

      // Scarica le pagine oltre 2000px dal viewport per liberare memoria.
      // Con rootMargin '2000px', un elemento è "intersecting" se è entro 2000px.
      // Quando diventa NOT intersecting → è oltre 2000px → si può liberare.
      const unloadObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) unloadOnePage(entry.target);
        });
      }, { rootMargin: '2000px 0px', threshold: 0 });

      wrappers.forEach(w => loadObserver.observe(w));

    } else {
      // ── DESKTOP: vista paginata (invariata) ───────────────────────────────
      pageCountSpan.textContent = pdfDoc.numPages;
      renderPage(pageNum);
    }

  }).catch(error => {
    console.error(`Errore nel caricamento del PDF da "${url}":`, error);
  });

});