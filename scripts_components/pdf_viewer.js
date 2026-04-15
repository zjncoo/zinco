document.addEventListener('DOMContentLoaded', () => {

  const canvas = document.getElementById('pdfCanvas');
  if (!canvas) {
    return; 
  }
  const url = canvas.dataset.pdfSource;
  if (!url) {
    console.error("Attributo 'data-pdf-source' non trovato sull'elemento #pdfCanvas. Impossibile caricare il PDF.");
    return;
  }

  let pdfDoc = null,
      pageNum = 1,
      pageRendering = false,
      pageNumPending = null,
      scale = 1.5,
      ctx = canvas.getContext('2d');

  const pageNumSpan = document.getElementById('pageNum');
  const pageNumInput = document.getElementById('pageNumInput');
  const pageCountSpan = document.getElementById('pageCount');

  /**
   * Renderizza la pagina richiesta nel canvas (desktop).
   */
  function renderPage(num) {
    pageRendering = true;
    pdfDoc.getPage(num).then(page => {
      const viewport = page.getViewport({ scale });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };
      const renderTask = page.render(renderContext);

      renderTask.promise.then(() => {
        pageRendering = false;
        if (pageNumPending !== null) {
          renderPage(pageNumPending);
          pageNumPending = null;
        }
      });
      pageNumSpan.textContent = num;
    });
  }

  /**
   * Mette in coda il rendering di una pagina.
   */
  function queueRenderPage(num) {
    if (pageRendering) {
      pageNumPending = num;
    } else {
      renderPage(num);
    }
  }

  // Funzioni per la navigazione (desktop)
  function onPrevPage() {
    if (pageNum <= 1) return;
    pageNum--;
    queueRenderPage(pageNum);
  }

  function onNextPage() {
    if (pageNum >= pdfDoc.numPages) return;
    pageNum++;
    queueRenderPage(pageNum);
  }

  document.getElementById('prevPage').addEventListener('click', onPrevPage);
  document.getElementById('nextPage').addEventListener('click', onNextPage);
  
  // --- Logica per mostrare/nascondere l'input ---

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
    
    let desiredPage = parseInt(pageNumInput.value, 10);
    if (isNaN(desiredPage)) desiredPage = 1;
    if (desiredPage > pdfDoc.numPages) desiredPage = pdfDoc.numPages;
    if (desiredPage < 1) desiredPage = 1;

    pageNum = desiredPage;
    queueRenderPage(pageNum);
    hidePageInput();
  }

  pageNumSpan.addEventListener('click', showPageInput);
  pageNumInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handlePageInput();
    }
  });
  pageNumInput.addEventListener('blur', handlePageInput);
  
  // Carica il documento
  pdfjsLib.getDocument(url).promise.then(async pdfDoc_ => {
    pdfDoc = pdfDoc_;
    
    if (window.innerWidth <= 768) {
      // ─── MOBILE: Lazy rendering con IntersectionObserver ───────────────────
      // Strategia:
      // 1. Nascondi il canvas paginato e i controlli
      // 2. Pre-calcola le dimensioni di tutte le pagine per creare placeholder
      //    con l'altezza corretta → la pagina è subito scrollabile
      // 3. IntersectionObserver renderizza ogni canvas solo quando entra nel viewport

      canvas.style.display = 'none';
      const controls = document.querySelector('.pdf-controls');
      if (controls) controls.style.display = 'none';
      
      const container = document.getElementById('pdfViewerContainer');
      if (container) {
        container.style.maxWidth = '100%';
        container.style.padding = '0';
        container.style.gap = '0';
        container.style.width = '100%';
      }

      const viewportWidth = window.innerWidth;
      const devicePixelRatio = window.devicePixelRatio || 1;

      // Calcola lo scale una volta sola dalla prima pagina
      // (assumiamo che tutte le pagine abbiano la stessa larghezza)
      const firstPage = await pdfDoc.getPage(1);
      const firstUnscaledVP = firstPage.getViewport({ scale: 1.0 });
      const targetWidth = viewportWidth * devicePixelRatio;
      const computedScale = targetWidth / firstUnscaledVP.width;
      // Limitato a 2.0 (era 3.0): qualità ottima, RAM ~2.25x inferiore
      const finalScale = Math.max(1.0, Math.min(computedScale, 2.0));

      // Aspect ratio per i placeholder: height / width a scale 1.0
      const pageAspectRatio = firstUnscaledVP.height / firstUnscaledVP.width;
      
      // Crea tutti i wrapper/placeholder in un unico DocumentFragment (velocissimo)
      const fragment = document.createDocumentFragment();
      const wrappers = [];

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const wrapper = document.createElement('div');
        wrapper.className = 'pdf-page-wrapper';
        wrapper.style.cssText = `
          width: 100%;
          display: block;
          margin: 0;
          padding: 0;
          line-height: 0;
          position: relative;
          height: ${viewportWidth * pageAspectRatio}px;
          background-color: #f0f0f0;
        `;
        wrapper.dataset.pageIndex = i;
        fragment.appendChild(wrapper);
        wrappers.push(wrapper);
      }
      container.appendChild(fragment);

      // Set up IntersectionObserver: renderizza solo le pagine visibili
      // rootMargin: "300px" = inizia a renderizzare 300px prima che entri nel viewport
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          const wrapper = entry.target;
          // Evita doppio rendering se il canvas è già stato creato
          if (wrapper.dataset.rendered === 'true') return;
          wrapper.dataset.rendered = 'true';
          observer.unobserve(wrapper); // Non serve più osservare questa pagina

          const pageIndex = parseInt(wrapper.dataset.pageIndex, 10);

          pdfDoc.getPage(pageIndex).then(page => {
            const viewport = page.getViewport({ scale: finalScale });

            const pageCanvas = document.createElement('canvas');
            const pageCtx = pageCanvas.getContext('2d');
            pageCanvas.height = viewport.height;
            pageCanvas.width = viewport.width;
            pageCanvas.style.cssText = `
              width: 100vw;
              height: auto;
              display: block;
              max-width: 100%;
            `;

            // Rimuovi l'altezza fissa del placeholder e aggiungi il canvas
            wrapper.style.height = '';
            wrapper.style.backgroundColor = '';
            wrapper.appendChild(pageCanvas);

            page.render({
              canvasContext: pageCtx,
              viewport: viewport,
            }).promise.catch(err => {
              console.warn(`Errore rendering pagina ${pageIndex}:`, err);
            });
          });
        });
      }, {
        rootMargin: '300px 0px', // Pre-carica 300px prima che sia visibile
        threshold: 0,
      });

      // Osserva tutti i wrapper
      wrappers.forEach(wrapper => observer.observe(wrapper));

    } else {
      // ─── DESKTOP: Vista paginata (invariata) ──────────────────────────────
      pageCountSpan.textContent = pdfDoc.numPages;
      renderPage(pageNum);
    }
  }).catch(error => {
    console.error(`Errore nel caricamento del PDF da "${url}":`, error);
  });

});