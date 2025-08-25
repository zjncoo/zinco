/**
 * ===================================
 * SCRIPT MODULARE PER L'INTERO SITO
 * ===================================
 */

// Funzione per inizializzare il preloader
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.classList.add('loaded');
    });
  }
}

// Funzione per inizializzare il cursore personalizzato
function initCustomCursor() {
  const cursor = document.getElementById('cursor');
  if (cursor) {
    document.addEventListener('mousemove', (e) => {
      cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    });

    const targets = document.querySelectorAll('.cursor-target');
    targets.forEach(target => {
      target.addEventListener('mouseenter', () => {
        cursor.classList.add('cursor-hover');
      });
      target.addEventListener('mouseleave', () => {
        cursor.classList.remove('cursor-hover');
      });
    });
  }
}

// Funzione per inizializzare il menu a tendina
function initDropdownMenu() {
  const menuButton = document.getElementById('btnTopRight');
  const dropdownMenu = document.getElementById('dropdownMenu');
  if (menuButton && dropdownMenu) {
    menuButton.addEventListener('click', (e) => {
      e.preventDefault();
      menuButton.classList.toggle('open');
      dropdownMenu.classList.toggle('open');
    });
  }
}

// Funzione specifica per il visualizzatore PDF (ora accetta l'URL come parametro)
function initPdfViewer(pdfUrl) {
  const { pdfjsLib } = window;
  if (!pdfjsLib) {
    console.error("PDF.js non è stato caricato.");
    return;
  }
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

  const canvasLeft = document.getElementById('canvas-left');
  const ctxLeft = canvasLeft.getContext('2d');
  const canvasRight = document.getElementById('canvas-right');
  const ctxRight = canvasRight.getContext('2d');
  const pageIndicator = document.getElementById('page-indicator');
  const prevBtn = document.getElementById('prev-page');
  const nextBtn = document.getElementById('next-page');

  let pdfDoc = null;
  let currentPage = 0;
  let totalPages = 0;
  
  const loadPdfFromUrl = async (url) => {
    try {
      pdfDoc = await pdfjsLib.getDocument(url).promise;
      totalPages = pdfDoc.numPages;
      renderSpread(1);
    } catch (error) {
      console.error('Errore durante il caricamento del PDF:', error);
      if(pageIndicator) pageIndicator.textContent = 'Errore nel caricamento del PDF.';
    }
  };

  if(prevBtn) prevBtn.addEventListener('click', goPrev);
  if(nextBtn) nextBtn.addEventListener('click', goNext);
  
  loadPdfFromUrl(pdfUrl); // Usa l'URL passato come parametro

  function renderPage(canvas, ctx, pageNum) {
    return new Promise(async (resolve) => {
      if (!pdfDoc || pageNum <= 0 || pageNum > totalPages) {
        if(canvas) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          canvas.classList.add('hidden');
        }
        resolve();
        return;
      }
      
      if(canvas) canvas.classList.remove('hidden');
      const page = await pdfDoc.getPage(pageNum);
      
      const pixelRatio = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale: 1 });
      const scale = (canvas.clientHeight * pixelRatio) / viewport.height;
      const scaledViewport = page.getViewport({ scale: scale });

      canvas.height = scaledViewport.height;
      canvas.width = scaledViewport.width;
      
      const renderContext = {
        canvasContext: ctx,
        viewport: scaledViewport
      };
      await page.render(renderContext).promise;
      resolve();
    });
  }

  function renderSpread(num) {
    currentPage = num;
    const isMobile = window.innerWidth <= 767;
    
    if (isMobile) {
      renderPage(canvasLeft, ctxLeft, currentPage);
      if(pageIndicator) pageIndicator.textContent = `Pagina ${currentPage} / ${totalPages}`;
    } else {
      if (currentPage === 1) {
        renderPage(canvasLeft, ctxLeft, 0);
        renderPage(canvasRight, ctxRight, 1);
        if(pageIndicator) pageIndicator.textContent = `Pagina 1 / ${totalPages}`;
      } else {
        const leftPage = currentPage % 2 === 0 ? currentPage : currentPage - 1;
        renderPage(canvasLeft, ctxLeft, leftPage);
        renderPage(canvasRight, ctxRight, leftPage + 1);
        if (leftPage + 1 <= totalPages) {
          if(pageIndicator) pageIndicator.textContent = `Pagine ${leftPage}-${leftPage + 1} / ${totalPages}`;
        } else {
          if(pageIndicator) pageIndicator.textContent = `Pagina ${leftPage} / ${totalPages}`;
        }
      }
    }
    updateNavButtons();
  }

  function updateNavButtons() {
    const isMobile = window.innerWidth <= 767;
    if(prevBtn) prevBtn.disabled = currentPage <= 1;
    if(nextBtn) nextBtn.disabled = (currentPage + (isMobile ? 0 : 1)) >= totalPages;
  }

  function goNext() {
    const isMobile = window.innerWidth <= 767;
    if (isMobile) {
      if (currentPage < totalPages) renderSpread(currentPage + 1);
    } else {
      if (currentPage === 1) {
         renderSpread(2);
      } else if (currentPage + 2 <= totalPages) {
        renderSpread(currentPage + 2);
      }
    }
  }

  function goPrev() {
    const isMobile = window.innerWidth <= 767;
    if (isMobile) {
      if (currentPage > 1) renderSpread(currentPage - 1);
    } else {
      if (currentPage > 1) {
        renderSpread(currentPage - 2);
      }
    }
  }
}


/**
 * ===================================
 * EVENT LISTENER PRINCIPALE
 * Si avvia quando il DOM è pronto.
 * ===================================
 */
document.addEventListener('DOMContentLoaded', () => {
  // Inizializza i componenti comuni a tutte le pagine
  initPreloader();
  initCustomCursor();
  initDropdownMenu();

  // Controlla se l'elemento del lettore PDF esiste nella pagina corrente
  const bookViewer = document.getElementById('book-viewer');
  if (bookViewer) {
    // Legge l'URL del PDF dall'attributo data
    const pdfToLoad = bookViewer.getAttribute('data-pdf-url');
    if (pdfToLoad) {
      // Se l'attributo esiste, avvia la logica con quell'URL
      initPdfViewer(pdfToLoad);
    } else {
      console.error("Attributo 'data-pdf-url' non trovato sull'elemento #book-viewer.");
    }
  }
});
