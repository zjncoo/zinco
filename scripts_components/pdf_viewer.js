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
   * Renderizza la pagina richiesta nel canvas.
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

  // Funzioni per la navigazione
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

  // --- MODIFICA: Funzione unificata per gestire l'input ---
  function handlePageInput() {
    // Controlla se l'input è visibile, altrimenti esci
    if (pageNumInput.style.display === 'none') return;
    
    let desiredPage = parseInt(pageNumInput.value, 10);

    // Validazione
    if (isNaN(desiredPage)) desiredPage = 1;
    if (desiredPage > pdfDoc.numPages) desiredPage = pdfDoc.numPages;
    if (desiredPage < 1) desiredPage = 1;

    pageNum = desiredPage;
    queueRenderPage(pageNum);
    
    hidePageInput(); // Nasconde l'input
  }
  // --- FINE MODIFICA ---

  // Attiva l'input quando si clicca sul numero
  pageNumSpan.addEventListener('click', showPageInput);

  // Gestisce il "salto" alla pagina quando si preme Invio
  pageNumInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      handlePageInput(); // <-- Usa la nuova funzione
    }
  });

  // Gestisce il "clic fuori" (blur)
  pageNumInput.addEventListener('blur', handlePageInput); // <-- Usa la nuova funzione
  
  // Carica il documento
  pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_;
    pageCountSpan.textContent = pdfDoc.numPages;
    renderPage(pageNum);
  }).catch(error => {
    console.error(`Errore nel caricamento del PDF da "${url}":`, error);
  });

});