// File: ../scripts_components/book_component.js

document.addEventListener('DOMContentLoaded', () => {
  const bookContainer = document.querySelector('.book-container');
  if (!bookContainer) return;

  const pdfUrl = bookContainer.dataset.pdfSrc;
  const layoutMode = bookContainer.dataset.layout || 'spread';

  if (!pdfUrl) {
    console.error("Attributo 'data-pdf-src' non trovato su '.book-container'.");
    return;
  }
  
  const { pdfjsLib } = window;
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

  const bookViewer = document.getElementById('book-viewer');
  const canvasLeft = document.getElementById('canvas-left');
  const ctxLeft = canvasLeft.getContext('2d');
  const canvasRight = document.getElementById('canvas-right');
  const ctxRight = canvasRight.getContext('2d');
  const pageIndicator = document.getElementById('page-indicator');
  const prevBtn = document.getElementById('prev-page');
  const nextBtn = document.getElementById('next-page');

  let pdfDoc = null;
  let currentPage = 1; // La pagina corrente si riferisce sempre alla pagina "logica" che l'utente vede
  let totalPages = 0;
  let isRendering = false;

  const renderPage = async (canvas, ctx, pageNum) => {
    // Questa funzione rimane invariata, gestisce la qualità e il ridimensionamento corretto
    try {
      if (!pdfDoc || pageNum <= 0 || pageNum > totalPages) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.classList.add('hidden');
        return;
      }
      
      canvas.classList.remove('hidden');
      const page = await pdfDoc.getPage(pageNum);
      
      const pixelRatio = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale: 1 });
      
      const maxHeight = bookViewer.clientHeight;
      const maxWidth = bookViewer.clientWidth / (layoutMode === 'spread' && window.innerWidth > 767 ? 2 : 1);

      const scale = Math.min(maxWidth / viewport.width, maxHeight / viewport.height);
      const scaledViewport = page.getViewport({ scale: scale * pixelRatio });

      canvas.height = scaledViewport.height;
      canvas.width = scaledViewport.width;
      
      canvas.style.height = `${scaledViewport.height / pixelRatio}px`;
      canvas.style.width = `${scaledViewport.width / pixelRatio}px`;
      
      const renderContext = {
        canvasContext: ctx,
        viewport: scaledViewport,
      };
      await page.render(renderContext).promise;

    } catch (error) {
      console.error(`Errore durante il rendering della pagina ${pageNum}:`, error);
    }
  };

  const renderSpread = async () => {
    if (isRendering || !pdfDoc) return;
    isRendering = true;

    const isMobile = window.innerWidth <= 767;
    const isSinglePageView = isMobile || layoutMode === 'single';

    if (isSinglePageView) {
      await renderPage(canvasLeft, ctxLeft, currentPage);
      canvasRight.classList.add('hidden');
      pageIndicator.textContent = `Pagina ${currentPage} / ${totalPages}`;
    } else {
      // Logica per la vista desktop a doppia pagina
      if (currentPage === 1) {
        // Vista Copertina: pagina 1 a destra, sinistra vuota
        await Promise.all([
          renderPage(canvasLeft, ctxLeft, 0),
          renderPage(canvasRight, ctxRight, 1)
        ]);
        pageIndicator.textContent = `Pagina 1 / ${totalPages}`;
      } else {
        // Vista interna: calcola la pagina sinistra (deve essere sempre pari)
        const leftPageNum = (currentPage % 2 === 0) ? currentPage : currentPage - 1;
        await Promise.all([
          renderPage(canvasLeft, ctxLeft, leftPageNum),
          renderPage(canvasRight, ctxRight, leftPageNum + 1)
        ]);
        
        if (leftPageNum + 1 <= totalPages) {
          pageIndicator.textContent = `Pagine ${leftPageNum}-${leftPageNum + 1} / ${totalPages}`;
        } else {
          pageIndicator.textContent = `Pagina ${leftPageNum} / ${totalPages}`;
        }
      }
    }
    updateNavButtons();
    isRendering = false;
  };

  const updateNavButtons = () => {
    const isMobile = window.innerWidth <= 767;
    const isSinglePageView = isMobile || layoutMode === 'single';
    
    prevBtn.disabled = currentPage <= 1;

    if (isSinglePageView) {
        nextBtn.disabled = currentPage >= totalPages;
    } else {
        nextBtn.disabled = currentPage >= totalPages -1;
    }
  };

  const goNext = () => {
    if (nextBtn.disabled) return;
    const isMobile = window.innerWidth <= 767;
    const isSinglePageView = isMobile || layoutMode === 'single';
    
    if (!isSinglePageView && currentPage === 1) {
      currentPage = 2; // Dalla copertina, passa a pagina 2
    } else {
      currentPage += isSinglePageView ? 1 : 2;
    }
    renderSpread();
  };

  const goPrev = () => {
    if (prevBtn.disabled) return;
    const isMobile = window.innerWidth <= 767;
    const isSinglePageView = isMobile || layoutMode === 'single';
     
    if (!isSinglePageView && currentPage === 2) {
       currentPage = 1; // Dalle pagine 2-3, torna alla copertina
    } else {
       currentPage -= isSinglePageView ? 1 : 2;
    }
    renderSpread();
  };
  
  const init = async () => {
    prevBtn.addEventListener('click', goPrev);
    nextBtn.addEventListener('click', goNext);
    
    try {
      pdfDoc = await pdfjsLib.getDocument(pdfUrl).promise;
      totalPages = pdfDoc.numPages;
      
      let initialRenderDone = false;
      const observer = new ResizeObserver(() => {
        if (!initialRenderDone) {
          renderSpread();
          initialRenderDone = true;
        }
      });
      observer.observe(bookViewer);

      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(renderSpread, 150);
      });

    } catch (error) {
      console.error('Errore durante il caricamento del PDF:', error);
      pageIndicator.textContent = 'Errore nel caricamento.';
    }
  };

  init();
});