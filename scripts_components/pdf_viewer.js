document.addEventListener('DOMContentLoaded', () => {

  // Cerca il canvas nella pagina
  const canvas = document.getElementById('pdfCanvas');
  
  // Se non c'è un canvas, interrompi lo script per evitare errori
  if (!canvas) {
    return; 
  }

  // 1. Leggiamo l'URL dall'attributo "data-pdf-source" del canvas
  const url = canvas.dataset.pdfSource;

  // 2. Aggiungiamo un controllo di sicurezza
  // Se l'attributo non è stato specificato nell'HTML, mostra un errore e fermati.
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

  /**
   * Renderizza la pagina richiesta nel canvas.
   * @param {number} num Il numero della pagina da renderizzare.
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

      document.getElementById('pageNum').textContent = num;
    });
  }

  /**
   * Mette in coda il rendering di una pagina se un'altra è già in corso.
   * @param {number} num Il numero della pagina.
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

  // Collega gli eventi ai bottoni
  document.getElementById('prevPage').addEventListener('click', onPrevPage);
  document.getElementById('nextPage').addEventListener('click', onNextPage);
  
  // 3. Carica il documento usando l'URL ottenuto dall'HTML
  pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_;
    document.getElementById('pageCount').textContent = pdfDoc.numPages;
    renderPage(pageNum);
  }).catch(error => {
    console.error(`Errore nel caricamento del PDF da "${url}":`, error);
    // Potresti mostrare un messaggio di errore all'utente qui
  });

});