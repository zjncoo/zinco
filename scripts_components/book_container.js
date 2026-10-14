// File: ../scripts_components/book_component.js (Con "Invio" su blur)

document.addEventListener('DOMContentLoaded', () => {
  const bookContainer = document.querySelector('.book-container');
  if (!bookContainer) return;

  const pdfUrl = bookContainer.dataset.pdfSrc;
  const layoutMode = bookContainer.dataset.layout || 'spread';

  if (!pdfUrl) {
    console.error("Attributo 'data-pdf-src' non trovato su '.book-container'.");
    return;
  }

  // --- 1. COSTRUZIONE DEL LAYOUT EDITORIALE A 2 COLONNE PER LE PUBBLICAZIONI ---
  const buildPublicationEditorialLayout = () => {
    if (document.querySelector('.project-editorial-layout')) return;

    const heroTitleEl = document.getElementById('hero-title');
    const projectTitle = heroTitleEl ? heroTitleEl.textContent.trim() : 'Publication';

    const viewerHeader = document.getElementById('viewer-header');
    let descriptionText = '';
    if (viewerHeader) {
      const p = viewerHeader.querySelector('p');
      if (p) descriptionText = p.textContent.trim();
    }

    const brandingGrid = document.querySelector('.branding-grid');
    const mockupImgs = brandingGrid ? Array.from(brandingGrid.querySelectorAll('img')) : [];
    const videos = Array.from(document.querySelectorAll('.video-container, video'));

    // Prima foto mockup per la colonna sinistra sticky
    const firstImg = mockupImgs.length > 0 ? mockupImgs[0] : null;
    const repImgSrc = firstImg ? firstImg.src : '';
    const repImgAlt = firstImg ? (firstImg.alt || projectTitle) : projectTitle;

    // Contenitore Layout Editoriale a 2 Colonne
    const editorialLayout = document.createElement('div');
    editorialLayout.className = 'project-editorial-layout publication-editorial-layout';

    // Colonna Sinistra Sticky (Allineata a Sinistra)
    const stickyCol = document.createElement('div');
    stickyCol.className = 'project-sticky-col';

    // Box Foto Rappresentativa
    if (repImgSrc) {
      const photoBox = document.createElement('div');
      photoBox.className = 'editorial-photo-box';
      const repImg = document.createElement('img');
      repImg.src = repImgSrc;
      repImg.alt = repImgAlt;
      repImg.className = 'editorial-rep-img';
      photoBox.appendChild(repImg);
      stickyCol.appendChild(photoBox);
    }

    // Tabella Specifiche / Metadati
    const specsTable = document.createElement('div');
    specsTable.className = 'editorial-specs-table';
    specsTable.innerHTML = `
      <div class="specs-row">
        <span class="specs-label">PROJECT</span>
        <span class="specs-value">${projectTitle}</span>
      </div>
      <div class="specs-row">
        <span class="specs-label">DISCIPLINE</span>
        <span class="specs-value">Publication &amp; Editorial</span>
      </div>
      <div class="specs-row">
        <span class="specs-label">FORMAT</span>
        <span class="specs-value">${layoutMode === 'single' ? 'Single Page' : 'Spread Flipbook'}</span>
      </div>
      <div class="specs-row">
        <span class="specs-label">ARCHIVE</span>
        <span class="specs-value">Print Book &amp; Digital Archive</span>
      </div>
    `;
    stickyCol.appendChild(specsTable);

    // Gruppo Bottoni Azione
    const ctaGroup = document.createElement('div');
    ctaGroup.className = 'editorial-cta-group';
    ctaGroup.innerHTML = `
      <button class="editorial-action-btn editorial-reader-btn cursor-target" id="editorialScrollReaderBtn" type="button">
        <span>Read Publication</span>
        <span class="btn-arrow">↓</span>
      </button>
      <button class="editorial-action-btn editorial-desc-btn cursor-target" id="editorialScrollDescBtn" type="button">
        <span>Project Description</span>
        <span class="btn-arrow">↓</span>
      </button>
    `;
    stickyCol.appendChild(ctaGroup);
    editorialLayout.appendChild(stickyCol);

    // Colonna Destra Media Stream (Flush, senza spazi bianchi)
    const mediaStream = document.createElement('div');
    mediaStream.className = 'project-media-stream';

    // Aggiungi video se presente (es. zoom)
    videos.forEach(v => {
      const mediaItem = document.createElement('div');
      mediaItem.className = 'project-media-item';
      mediaItem.style.lineHeight = '0';
      mediaItem.style.width = '100%';
      mediaItem.style.borderBottom = '1px solid black';

      const vid = v.tagName === 'VIDEO' ? v : (v.querySelector('video') || v);
      vid.style.width = '100%';
      vid.style.maxWidth = '100%';
      vid.style.height = 'auto';
      vid.style.display = 'block';

      mediaItem.appendChild(vid);
      mediaStream.appendChild(mediaItem);
    });

    // Aggiungi mockups a tutta larghezza flush
    mockupImgs.forEach(img => {
      const mediaItem = document.createElement('div');
      mediaItem.className = 'project-media-item';
      mediaItem.style.lineHeight = '0';
      mediaItem.style.width = '100%';
      mediaItem.style.borderBottom = '1px solid black';

      const clone = img.cloneNode(true);
      clone.style.width = '100%';
      clone.style.height = 'auto';
      clone.style.display = 'block';
      clone.style.maxHeight = 'none';
      clone.style.maxWidth = 'none';
      clone.removeAttribute('width');
      clone.removeAttribute('height');

      mediaItem.appendChild(clone);
      mediaStream.appendChild(mediaItem);
    });
    editorialLayout.appendChild(mediaStream);

    // Sezione Descrizione Progetto in basso
    const descSection = document.createElement('section');
    descSection.id = 'project-description-section';
    descSection.className = 'project-info-section';
    descSection.innerHTML = `
      <div class="project-info-content">
        <h2>DESCRIPTION / ${projectTitle.toUpperCase()}</h2>
        <div class="project-info-text">
          <p>${descriptionText || 'Editorial publication exploring typography, pacing, and visual layout.'}</p>
        </div>
      </div>
    `;

    // Sezione Flipbook Reader in fondo
    const readerSection = document.createElement('section');
    readerSection.id = 'project-publication-reader';
    readerSection.className = 'publication-reader-section';
    readerSection.innerHTML = `
      <div class="publication-reader-header">
        <div class="publication-reader-badge">ARCHIVE // INTERACTIVE FLIPBOOK</div>
        <h2 class="publication-reader-title">${projectTitle} — Complete Publication</h2>
      </div>
    `;

    // Sposta bookContainer dentro readerSection
    readerSection.appendChild(bookContainer);

    // Rimuovi vecchio viewer-header e branding-grid
    if (viewerHeader) viewerHeader.remove();
    if (brandingGrid) brandingGrid.remove();

    // Inserisci ordinatamente all'interno di <main>
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.innerHTML = '';
      mainEl.appendChild(editorialLayout);
      mainEl.appendChild(descSection);
      mainEl.appendChild(readerSection);
    } else {
      const siteMain = document.querySelector('.site-main-content') || document.body;
      const footer = document.querySelector('zinco-footer') || siteMain.lastElementChild;
      siteMain.insertBefore(editorialLayout, footer);
      siteMain.insertBefore(descSection, footer);
      siteMain.insertBefore(readerSection, footer);
    }

    // Handlers per scroll fluido ai bottoni
    const scrollReaderBtn = document.getElementById('editorialScrollReaderBtn');
    if (scrollReaderBtn) {
      scrollReaderBtn.addEventListener('click', () => {
        const target = document.getElementById('project-publication-reader');
        if (!target) return;
        if (window.lenis) {
          window.lenis.scrollTo(target, { offset: -60 });
        } else {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    const scrollDescBtn = document.getElementById('editorialScrollDescBtn');
    if (scrollDescBtn) {
      scrollDescBtn.addEventListener('click', () => {
        const target = document.getElementById('project-description-section');
        if (!target) return;
        if (window.lenis) {
          window.lenis.scrollTo(target, { offset: -60 });
        } else {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  };

  buildPublicationEditorialLayout();

  const { pdfjsLib } = window;
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

  const bookViewer = document.getElementById('book-viewer');
  const canvasLeft = document.getElementById('canvas-left');
  const ctxLeft = canvasLeft.getContext('2d');
  const canvasRight = document.getElementById('canvas-right');
  const ctxRight = canvasRight.getContext('2d');

  const pageLabel = document.getElementById('pageLabel');
  const pageNumbers = document.getElementById('pageNumbers');
  const pageTotal = document.getElementById('pageTotal');
  const pageInput = document.getElementById('pageInput');

  const prevBtn = document.getElementById('prev-page');
  const nextBtn = document.getElementById('next-page');

  let pdfDoc = null;
  let currentPage = 1;
  let totalPages = 0;
  let isRendering = false;

  const renderPage = async (canvas, ctx, pageNum) => {
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

      const isMobile = window.innerWidth <= 767;
      const isSinglePageView = isMobile || layoutMode === 'single';

      // Dimensioni ampie ed editoriali per riempire lo schermo
      const viewerWidth = bookViewer.clientWidth || (window.innerWidth - 60);
      const availableWidth = Math.min(viewerWidth > 100 ? viewerWidth : (window.innerWidth - 60), 1480);
      const maxHeight = Math.max(window.innerHeight * 0.85, 680);
      const maxWidth = isSinglePageView ? availableWidth : availableWidth / 2;

      // Su mobile scala a larghezza schermo intera (100vw), su desktop sfrutta l'altezza generosa dell'85vh
      const scale = isMobile
        ? window.innerWidth / viewport.width
        : Math.min(maxWidth / viewport.width, maxHeight / viewport.height);
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
      console.error(`Errore during il rendering della pagina ${pageNum}:`, error);
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
      pageLabel.textContent = 'Page ';
      pageNumbers.textContent = currentPage;
      pageTotal.textContent = ` / ${totalPages}`;
    } else {
      if (currentPage === 1) {
        await Promise.all([
          renderPage(canvasLeft, ctxLeft, 0),
          renderPage(canvasRight, ctxRight, 1)
        ]);
        pageLabel.textContent = 'Page ';
        pageNumbers.textContent = '1';
        pageTotal.textContent = ` / ${totalPages}`;
      } else {
        const leftPageNum = (currentPage % 2 === 0) ? currentPage : currentPage - 1;
        await Promise.all([
          renderPage(canvasLeft, ctxLeft, leftPageNum),
          renderPage(canvasRight, ctxRight, leftPageNum + 1)
        ]);

        if (leftPageNum + 1 <= totalPages) {
          pageLabel.textContent = 'Pagine ';
          pageNumbers.textContent = `${leftPageNum}-${leftPageNum + 1}`;
          pageTotal.textContent = ` / ${totalPages}`;
        } else {
          pageLabel.textContent = 'Page ';
          pageNumbers.textContent = leftPageNum;
          pageTotal.textContent = ` / ${totalPages}`;
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
      nextBtn.disabled = currentPage >= totalPages - 1;
    }
  };

  const goNext = () => {
    if (nextBtn.disabled) return;
    const isMobile = window.innerWidth <= 767;
    const isSinglePageView = isMobile || layoutMode === 'single';

    if (!isSinglePageView && currentPage === 1) {
      currentPage = 2;
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
      currentPage = 1;
    } else {
      currentPage -= isSinglePageView ? 1 : 2;
    }
    renderSpread();
  };

  const init = async () => {
    // --- INIEZIONE DEL BOTTONE GRID VIEW E DEL MODALE ---
    const bookControls = document.getElementById('book-controls');
    if (bookControls && !document.getElementById('grid-view-btn')) {
      const gridBtn = document.createElement('button');
      gridBtn.id = 'grid-view-btn';
      gridBtn.className = 'btn btn--outline-dark cursor-target';
      gridBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" stroke-linejoin="miter">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      `;
      gridBtn.style.padding = '10px 16px';
      bookControls.appendChild(gridBtn);
    }

    if (!document.getElementById('pdfGridModal')) {
      const modalHtml = `
        <div id="pdfGridModal" data-lenis-prevent>
          <div class="pdf-grid-header">
            <h2>Pages overview</h2>
            <button id="closePdfGrid" class="cursor-target">Close</button>
          </div>
          <div id="pdfThumbnailsContainer" data-lenis-prevent></div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    const gridModal = document.getElementById('pdfGridModal');
    const closeGridBtn = document.getElementById('closePdfGrid');
    const thumbnailsContainer = document.getElementById('pdfThumbnailsContainer');
    const gridViewBtn = document.getElementById('grid-view-btn');
    let thumbnailsRendered = false;

    const renderThumbnails = async () => {
      if (!pdfDoc || thumbnailsRendered) return;
      thumbnailsContainer.innerHTML = ''; // Pulisce il contenitore

      for (let i = 1; i <= totalPages; i++) {
        const wrapper = document.createElement('div');
        wrapper.className = `pdf-thumbnail-wrapper ${i === currentPage ? 'active' : ''}`;
        wrapper.dataset.page = i;

        const canvas = document.createElement('canvas');
        canvas.className = 'pdf-thumbnail';

        const numberSpan = document.createElement('span');
        numberSpan.className = 'pdf-thumbnail-number';
        numberSpan.textContent = i;

        wrapper.appendChild(canvas);
        wrapper.appendChild(numberSpan);
        thumbnailsContainer.appendChild(wrapper);

        // Renderizza la pagina per la thumbnail in background (Qualita bilanciata)
        pdfDoc.getPage(i).then(page => {
          const viewport = page.getViewport({ scale: 0.6 }); // Qualita media: veloce ma più nitido di 0.3
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          // CSS width 100% will down-scale the high-res canvas into the grid box
          const renderContext = {
            canvasContext: canvas.getContext('2d'),
            viewport: viewport,
          };
          page.render(renderContext);
        });

        // Click event per navigare alla pagina e chiudere il modale
        wrapper.addEventListener('click', () => {
          currentPage = i;
          renderSpread();
          closeGridModal();
        });
      }
      thumbnailsRendered = true;
    };

    const updateActiveThumbnail = () => {
      if (!thumbnailsRendered) return;
      const wrappers = document.querySelectorAll('.pdf-thumbnail-wrapper');
      wrappers.forEach(wrap => {
        if (parseInt(wrap.dataset.page) === currentPage) {
          wrap.classList.add('active');
          wrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          wrap.classList.remove('active');
        }
      });
    };

    const openGridModal = () => {
      gridModal.classList.add('open');
      renderThumbnails().then(updateActiveThumbnail);
      document.body.style.overflow = 'hidden'; // Blocca lo scroll della pagina principale
      if (window.lenis) window.lenis.stop(); // Ferma Lenis
    };

    const closeGridModal = () => {
      gridModal.classList.remove('open');
      document.body.style.overflow = ''; // Ripristina lo scroll
      if (window.lenis) window.lenis.start(); // Ripristina Lenis
    };

    if (gridViewBtn) gridViewBtn.addEventListener('click', openGridModal);
    if (closeGridBtn) closeGridBtn.addEventListener('click', closeGridModal);

    // Sovrascrive i metodi existeng per aggiornare la thumbnail attiva
    const originalRenderSpread = renderSpread;
    // --- FINE INIEZIONE ---

    prevBtn.addEventListener('click', goPrev);
    nextBtn.addEventListener('click', goNext);

    // --- Logica per input pagina (aggiornata) ---
    const showInput = () => {
      pageNumbers.style.display = 'none';
      pageLabel.style.display = 'inline';
      pageTotal.style.display = 'inline';
      pageInput.style.display = 'inline-block';
      pageInput.value = currentPage;
      pageInput.focus();
      pageInput.select();
    };

    const hideInput = () => {
      pageInput.style.display = 'none';
      pageNumbers.style.display = 'inline-block';
      pageLabel.style.display = 'inline';
      pageTotal.style.display = 'inline';
    };

    // --- NUOVA FUNZIONE PER GESTIRE L'INPUT ---
    const handlePageInput = () => {
      // Controlla se l'input è visibile, altrimenti esci
      if (pageInput.style.display === 'none') return;

      let desiredPage = parseInt(pageInput.value, 10);

      // Validazione
      if (isNaN(desiredPage)) desiredPage = 1;
      if (desiredPage > totalPages) desiredPage = totalPages;
      if (desiredPage < 1) desiredPage = 1;

      currentPage = desiredPage;
      renderSpread();
      hideInput();
    };
    // --- FINE NUOVA FUNZIONE ---

    pageNumbers.addEventListener('click', showInput);

    // Gestisce il tasto "Invio"
    pageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handlePageInput(); // <-- Usa la nuova funzione
      }
    });

    // Gestisce il "clic fuori" (blur)
    pageInput.addEventListener('blur', handlePageInput); // <-- Usa la nuova funzione
    // --- FINE MODIFICA ---

    const loadPdfWithRetry = async (url, retries = 3, delay = 500) => {
      for (let i = 0; i < retries; i++) {
        try {
          return await pdfjsLib.getDocument(url).promise;
        } catch (error) {
          console.warn(`Tentativo ${i + 1} fallito per il caricamento del PDF:`, error);
          if (i === retries - 1) throw error;
          await new Promise(res => setTimeout(res, delay));
        }
      }
    };

    try {
      pdfDoc = await loadPdfWithRetry(pdfUrl);
      totalPages = pdfDoc.numPages;
      pageTotal.textContent = ` / ${totalPages}`;

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
      console.error('Errore definitivo durante il caricamento del PDF dopo vari tentativi:', error);
      pageLabel.textContent = 'Errore nel caricamento.';
      pageNumbers.style.display = 'none';
      pageTotal.style.display = 'none';
    }
  };

  init();
});