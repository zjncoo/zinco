// File: ../scripts_components/pdf_viewer.js
// Visualizzatore PDF Presentazioni: SOLO PRIMA PAGINA (Cover Preview), NESSUNO SCROLLING INTERNO.
// Cliccando sulla copertina o sul pulsante, la presentazione si apre a tutto schermo nel browser.

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('pdfCanvas');
  if (!canvas) return;
  const url = canvas.dataset.pdfSource;
  if (!url) return;

  const container = document.getElementById('pdfViewerContainer');
  const controls = document.querySelector('.pdf-controls');
  if (controls) controls.style.display = 'none';

  if (window.pdfjsLib && !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  // Prevenzione assoluta di scrolling interno sul container
  if (container) {
    container.style.overflow = 'hidden';
    container.style.touchAction = 'pan-y';
    container.addEventListener('wheel', () => {}, { passive: true });
  }

  const renderCover = (pdfDoc) => {
    pdfDoc.getPage(1).then(page => {
      const pixelRatio = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale: 1 });
      const containerWidth = container ? (container.clientWidth || window.innerWidth * 0.7) : 800;
      const scale = (containerWidth / viewport.width) * pixelRatio;
      const scaledViewport = page.getViewport({ scale });

      canvas.height = scaledViewport.height;
      canvas.width = scaledViewport.width;
      canvas.style.height = `${scaledViewport.height / pixelRatio}px`;
      canvas.style.width = '100%';
      canvas.style.maxWidth = '100%';
      canvas.style.display = 'block';
      canvas.style.pointerEvents = 'none'; // Nessuna cattura di scroll sul canvas

      const ctx = canvas.getContext('2d');
      page.render({ canvasContext: ctx, viewport: scaledViewport });

      // Crea pulsante "Open presentation in browser ↗" se non esiste
      if (container && !container.querySelector('.pdf-open-browser-btn')) {
        const btnWrapper = document.createElement('div');
        btnWrapper.style.margin = '20px auto 0 auto';
        btnWrapper.style.textAlign = 'center';
        btnWrapper.innerHTML = `
          <a href="${url}" target="_blank" rel="noopener noreferrer" class="btn btn--outline-dark pdf-open-browser-btn cursor-target" style="padding: 10px 22px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">
            <span>Open presentation in browser</span>
            <span class="btn-arrow"><svg class="custom-arrow-icon" viewBox="0 0 10 10" width="10" height="10" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><line x1="1.5" y1="8.5" x2="8.5" y2="1.5"></line><polyline points="3.5 1.5 8.5 1.5 8.5 6.5"></polyline></svg></span>
          </a>
        `;
        container.appendChild(btnWrapper);
      }
    });
  };

  if (window.pdfjsLib) {
    pdfjsLib.getDocument(url).promise.then(pdfDoc => {
      renderCover(pdfDoc);
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => renderCover(pdfDoc), 150);
      }, { passive: true });
    }).catch(err => {
      console.warn('[pdf_viewer] Could not render page 1:', err);
    });
  }
});