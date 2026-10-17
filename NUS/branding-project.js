/**
 * branding-project.js
 * Master Editorial Project Engine for zinco.cc branding showcases
 * Standardized 2-Column Editorial Layout
 */

document.addEventListener('DOMContentLoaded', () => {
  const ARROW_SVG_DIAG = '<svg class="custom-arrow-icon" viewBox="0 0 10 10" width="10" height="10" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><line x1="1.5" y1="8.5" x2="8.5" y2="1.5"></line><polyline points="3.5 1.5 8.5 1.5 8.5 6.5"></polyline></svg>';
  const ARROW_SVG_DOWN = '<svg class="custom-arrow-icon" viewBox="0 0 10 10" width="10" height="10" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="1" x2="5" y2="8.5"></line><polyline points="1.5 5 5 8.5 8.5 5"></polyline></svg>';

  // Funzione per convertire i percorsi delle immagini in .webp (salvaguardando svg)
  const toWebp = (url) => {
    if (typeof url !== 'string') return '';
    if (url.endsWith('.svg')) return url;
    return url.replace(/\.(jpe?g|png)$/i, '.webp');
  };

  // Determina la cartella del progetto corrente
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const currentFolder = pathParts.length > 1 ? pathParts[pathParts.length - 2] : '';
  const currentFileName = pathParts.length > 0 ? pathParts[pathParts.length - 1] : '';

  // 1. Carica i dati del progetto
  const dataPromise = fetch('branding-data.json')
    .then(response => {
      if (!response.ok) {
        return fetch('piedibus_mozzate-branding-data.json').then(r => {
          if (!r.ok) throw new Error(`HTTP error ${response.status}`);
          return r.json();
        });
      }
      return response.json();
    });

  // 2. Carica ordered-projects.json per recuperare foto rappresentativa e metadati
  const orderedPromise = fetch('../ordered-projects.json')
    .then(res => res.ok ? res.json() : [])
    .catch(() => []);

  Promise.all([dataPromise, orderedPromise])
    .then(([data, orderedProjects]) => {
      // Progetto corrispondente in ordered-projects.json
      const matchedProject = Array.isArray(orderedProjects)
        ? orderedProjects.find(p => {
            if (!p.link) return false;
            return (currentFolder && p.link.includes(currentFolder)) ||
                   (currentFileName && p.link.includes(currentFileName));
          })
        : null;

      // Imposta il titolo nella Hero
      const heroTitle = document.getElementById('hero-title');
      const namingItem = data.find(item => item.label === 'naming');
      if (heroTitle) {
        if (namingItem && namingItem.content) {
          heroTitle.textContent = namingItem.content;
        } else if (matchedProject && matchedProject.title) {
          heroTitle.textContent = matchedProject.title;
        }
      }

      // Hero pulita: nascondi l'eventuale glance-container dentro hero-wrapper
      const heroGlance = document.querySelector('#hero-wrapper #glance-container');
      if (heroGlance) {
        heroGlance.style.display = 'none';
      }

      // Sezione principale del progetto
      const mainContainer = document.getElementById('sezione-progetto') || document.querySelector('main');
      if (!mainContainer) return;

      // Elementi esistenti nell'HTML
      const videoContainer = mainContainer.querySelector('.video-container');
      let projectInfoSection = mainContainer.querySelector('.project-info-section');
      const legacyPdfContainer = document.getElementById('pdfViewerContainer');
      const legacyBrandingGrid = document.getElementById('brandingGrid');
      const legacyFigmaContainer = document.getElementById('figma-container');

      // Trova eventuale PDF di presentazione
      let pdfSource = null;
      const pdfCanvas = document.getElementById('pdfCanvas');
      if (pdfCanvas && pdfCanvas.dataset.pdfSource) {
        pdfSource = pdfCanvas.dataset.pdfSource;
      } else {
        const pdfItem = data.find(item => item.type === 'pdf' || (item.src && item.src.endsWith('.pdf')));
        if (pdfItem) pdfSource = pdfItem.src;
      }

      // Rimuovi completamente i vecchi contenitori legacy dal DOM per evitare conflitti o scroll residui
      if (pdfCanvas) pdfCanvas.remove();
      if (legacyPdfContainer) legacyPdfContainer.remove();
      if (legacyBrandingGrid) legacyBrandingGrid.remove();
      if (legacyFigmaContainer) legacyFigmaContainer.remove();

      // ============================================================
      // COSTRUZIONE LAYOUT EDITORIALE A 2 COLONNE
      // ============================================================
      const editorialLayout = document.createElement('div');
      editorialLayout.className = 'project-editorial-layout';

      // ── COLONNA SINISTRA: FISSA / STICKY ──────────────────────────
      const stickyCol = document.createElement('aside');
      stickyCol.className = 'project-sticky-col';
      stickyCol.setAttribute('data-lenis-prevent', '');

      // 1. Foto Rappresentativa (formato editoriale variabile)
      let repImageSrc = '';
      if (matchedProject && matchedProject.image) {
        let rawImg = matchedProject.image;
        if (currentFolder && rawImg.startsWith(currentFolder + '/')) {
          rawImg = rawImg.substring(currentFolder.length + 1);
        } else if (!rawImg.startsWith('../') && !rawImg.startsWith('http') && !rawImg.startsWith('img/')) {
          rawImg = '../' + rawImg;
        }
        repImageSrc = rawImg;
      }
      if (!repImageSrc) {
        const firstVisual = data.find(i => i.type === 'image' && i.subtype !== 'logo' && i.src);
        if (firstVisual) repImageSrc = toWebp(firstVisual.src);
      }

      if (repImageSrc) {
        const photoBox = document.createElement('div');
        photoBox.className = 'editorial-photo-box';
        const repImg = document.createElement('img');
        repImg.src = repImageSrc;
        repImg.alt = namingItem ? namingItem.content : 'Representative visual';
        repImg.className = 'editorial-rep-img';
        repImg.loading = 'eager';
        repImg.decoding = 'async';
        photoBox.appendChild(repImg);
        stickyCol.appendChild(photoBox);
      }

      // 2. Tabella Info / Specs (allineata a sinistra, divisa per sezioni tematiche con aria e respiro)
      const specsTable = document.createElement('div');
      specsTable.className = 'editorial-specs-table';

      const tableHeader = document.createElement('div');
      tableHeader.className = 'specs-table-header';
      tableHeader.innerHTML = `<span>infogrid</span>`;
      specsTable.appendChild(tableHeader);

      const specGroups = [
        {
          groupTitle: '01 / overview',
          specs: [
            { label: 'date', keys: ['date', 'year'] },
            { label: 'context', keys: ['context', 'course', 'client', 'typology'] },
            { label: 'category', keys: ['category', 'discipline', 'services'] },
            { label: 'team', keys: ['team', 'collaborators'] },
            { label: 'role', keys: ['role'] },
            { label: 'venue', keys: ['venue'] }
          ]
        },
        {
          groupTitle: '02 / strategy & identity',
          specs: [
            { label: 'concept', keys: ['concept'] },
            { label: 'brand essence', keys: ['brand essence', 'essence'] },
            { label: 'mission', keys: ['mission'] },
            { label: 'vision', keys: ['vision'] },
            { label: 'values', keys: ['values'] },
            { label: 'tone of voice', keys: ['tone of voice'] },
            { label: 'payoff', keys: ['payoff', 'tagline'] },
            { label: 'positioning', keys: ['positioning'] },
            { label: 'target', keys: ['target'] }
          ]
        },
        {
          groupTitle: '03 / deliverables & technical',
          specs: [
            { label: 'deliverables', keys: ['deliverables'] },
            { label: 'tools', keys: ['tools', 'software', 'stack'] },
            { label: 'languages', keys: ['languages'] },
            { label: 'dimensions', keys: ['dimensions'] },
            { label: 'paper stock', keys: ['paper stock'] },
            { label: 'binding', keys: ['binding'] },
            { label: 'fonts', keys: ['fonts', 'typeface', 'typography'] }
          ]
        }
      ];

      const handledKeys = new Set(['naming', 'description']);
      let totalSpecsCount = 0;

      specGroups.forEach(group => {
        const matchingRows = [];
        group.specs.forEach(spec => {
          spec.keys.forEach(k => handledKeys.add(k));
          const item = data.find(d => d.type === 'text' && spec.keys.includes((d.label || '').toLowerCase().trim()));
          if (item && item.content) {
            matchingRows.push({ label: spec.label, value: item.content });
          }
        });

        if (matchingRows.length > 0) {
          totalSpecsCount += matchingRows.length;
          const groupEl = document.createElement('div');
          groupEl.className = 'specs-group';

          const groupHeader = document.createElement('div');
          groupHeader.className = 'specs-group-header';
          groupHeader.textContent = group.groupTitle;
          groupEl.appendChild(groupHeader);

          matchingRows.forEach(rowItem => {
            const row = document.createElement('div');
            row.className = 'specs-row';
            row.innerHTML = `
              <span class="specs-label">${rowItem.label}</span>
              <span class="specs-value">${rowItem.value}</span>
            `;
            groupEl.appendChild(row);
          });

          specsTable.appendChild(groupEl);
        }
      });

      // Raccogli eventuali altri campi testuali non previsti nei gruppi
      const otherTextItems = data.filter(d =>
        d.type === 'text' &&
        d.label &&
        d.content &&
        !handledKeys.has(d.label.toLowerCase().trim())
      );

      if (otherTextItems.length > 0) {
        totalSpecsCount += otherTextItems.length;
        let lastGroup = specsTable.querySelector('.specs-group:last-child');
        if (!lastGroup) {
          lastGroup = document.createElement('div');
          lastGroup.className = 'specs-group';
          const header = document.createElement('div');
          header.className = 'specs-group-header';
          header.textContent = '03 / deliverables & technical';
          lastGroup.appendChild(header);
          specsTable.appendChild(lastGroup);
        }
        otherTextItems.forEach(item => {
          const row = document.createElement('div');
          row.className = 'specs-row';
          row.innerHTML = `
            <span class="specs-label">${item.label}</span>
            <span class="specs-value">${item.content}</span>
          `;
          lastGroup.appendChild(row);
        });
      }

      if (totalSpecsCount > 0) {
        stickyCol.appendChild(specsTable);
      }

      // 3. Rilevamento Sito Web per bottone "Apri il sito" sulla colonna di sinistra
      let websiteUrl = null;
      let websiteLabel = 'Open Website';

      const websiteItem = data.find(i => {
        if (i.type === 'figma' && i.embedUrl && !i.embedUrl.includes('figma.com')) return true;
        if (i.type === 'link' && i.href && i.href.startsWith('http') && !i.href.includes('github.com')) return true;
        if (i.label && (i.label.toLowerCase().includes('website') || i.label.toLowerCase().includes('sito')) && (i.embedUrl || i.href)) return true;
        return false;
      });

      if (websiteItem) {
        websiteUrl = websiteItem.embedUrl || websiteItem.href;
        websiteLabel = (websiteItem.label && !websiteItem.label.toLowerCase().includes('visit'))
          ? `Visit ${websiteItem.label}`
          : 'Visit Website';
      } else if (matchedProject) {
        if (matchedProject.category === 'websites' || (matchedProject.link && matchedProject.link.startsWith('http'))) {
          websiteUrl = matchedProject.link;
          websiteLabel = 'Open Website';
        }
      }

      // Se il progetto ha un prototipo Figma alternativo
      const figmaProtoItem = data.find(i => i.type === 'figma' && i.embedUrl && i.embedUrl.includes('figma.com'));

      // Container per i bottoni d'azione della colonna sinistra
      const ctaGroup = document.createElement('div');
      ctaGroup.className = 'editorial-cta-group';

      if (websiteUrl) {
        const siteBtn = document.createElement('a');
        siteBtn.href = websiteUrl;
        siteBtn.target = '_blank';
        siteBtn.rel = 'noopener noreferrer';
        siteBtn.className = 'editorial-action-btn editorial-site-btn cursor-target';
        siteBtn.innerHTML = `
          <span>${websiteLabel}</span>
          <span class="btn-arrow">${ARROW_SVG_DIAG}</span>
        `;
        ctaGroup.appendChild(siteBtn);
      } else if (figmaProtoItem) {
        const figmaBtn = document.createElement('a');
        figmaBtn.href = figmaProtoItem.embedUrl;
        figmaBtn.target = '_blank';
        figmaBtn.rel = 'noopener noreferrer';
        figmaBtn.className = 'editorial-action-btn editorial-site-btn cursor-target';
        figmaBtn.innerHTML = `
          <span>Open Prototype</span>
          <span class="btn-arrow">${ARROW_SVG_DIAG}</span>
        `;
        ctaGroup.appendChild(figmaBtn);
      }

      // 4. Bottone Descrizione che scrolla in fondo alla pagina
      const descBtn = document.createElement('a');
      descBtn.href = '#project-description-section';
      descBtn.className = 'editorial-action-btn editorial-desc-btn cursor-target';
      descBtn.id = 'editorialDescBtn';
      descBtn.innerHTML = `
        <span>Project Description</span>
        <span class="btn-arrow">${ARROW_SVG_DOWN}</span>
      `;
      ctaGroup.appendChild(descBtn);

      stickyCol.appendChild(ctaGroup);
      editorialLayout.appendChild(stickyCol);

      // ── COLONNA DESTRA: SCROLL MULTIMEDIALE FLUSH (SENZA SPAZI BIANCHI) ────
      const mediaStream = document.createElement('div');
      mediaStream.className = 'project-media-stream';

      // 1. Video (se presente nel progetto)
      if (videoContainer) {
        const videoEl = videoContainer.querySelector('video');
        if (!videoEl) {
          videoContainer.remove();
        } else {
          const videoSrc = videoEl.getAttribute('src') || (videoEl.querySelector('source') && videoEl.querySelector('source').getAttribute('src'));
          if (!videoSrc) {
            videoContainer.remove();
          } else {
            const handleVidError = () => {
              console.warn('[branding-project] Video source failed to load, removing video container:', videoSrc);
              videoContainer.remove();
            };
            videoEl.addEventListener('error', handleVidError);
            const sources = videoEl.querySelectorAll('source');
            sources.forEach(s => s.addEventListener('error', handleVidError));

            fetch(videoSrc, { method: 'HEAD' }).then(res => {
              if (!res.ok) handleVidError();
            }).catch(() => {
              // Ignore network check errors for local/file scenarios
            });

            mediaStream.appendChild(videoContainer);
          }
        }
      }

      // 2. Presentazione PDF: Solo Prima Pagina / Cover Preview Non Scrollabile + Open in Browser
      // Se il PDF non esiste o fallisce, scompare completamente senza mostrare blocchi o errori 404
      if (pdfSource) {
        const pdfSection = document.createElement('div');
        pdfSection.className = 'editorial-pdf-section';
        pdfSection.id = 'editorialPdfSection';
        pdfSection.innerHTML = `
          <div class="editorial-pdf-header">
            <div class="editorial-pdf-title">
              <span class="pdf-badge">PDF</span>
              <span class="pdf-name">Presentation &amp; Guidelines</span>
            </div>
            <a href="${pdfSource}" target="_blank" rel="noopener noreferrer" class="editorial-pdf-open-btn cursor-target">
              Open presentation ${ARROW_SVG_DIAG}
            </a>
          </div>
          <a href="${pdfSource}" target="_blank" rel="noopener noreferrer" class="editorial-presentation-cover-link cursor-target" title="Open presentation in browser">
            <canvas class="editorial-presentation-canvas"></canvas>
            <div class="editorial-presentation-hover-overlay">
              <span>Open presentation in browser ${ARROW_SVG_DIAG}</span>
            </div>
          </a>
        `;

        // Renderizza strictly la prima pagina su canvas
        if (window.pdfjsLib) {
          if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
          }
          window.pdfjsLib.getDocument(pdfSource).promise.then(pdf => {
            return pdf.getPage(1);
          }).then(page => {
            const canvas = pdfSection.querySelector('.editorial-presentation-canvas');
            if (!canvas) return;

            const pixelRatio = window.devicePixelRatio || 1;
            const viewport = page.getViewport({ scale: 1 });
            const containerWidth = mediaStream.clientWidth || 800;
            const scale = (containerWidth / viewport.width) * pixelRatio;
            const scaledViewport = page.getViewport({ scale: scale });

            canvas.height = scaledViewport.height;
            canvas.width = scaledViewport.width;
            canvas.style.height = `${scaledViewport.height / pixelRatio}px`;
            canvas.style.width = '100%';
            canvas.style.pointerEvents = 'none';
            canvas.style.display = 'block';

            const ctx = canvas.getContext('2d');
            page.render({ canvasContext: ctx, viewport: scaledViewport });

            // Aggiungi pdfSection a mediaStream solo quando la prima pagina si carica con successo
            if (!pdfSection.parentNode) {
              if (videoContainer && videoContainer.parentNode === mediaStream) {
                videoContainer.after(pdfSection);
              } else {
                mediaStream.prepend(pdfSection);
              }
            }
          }).catch(err => {
            console.warn('[branding-project] PDF not available or failed to load, removing section completely:', err);
            pdfSection.remove();
          });
        }
      }

      // 3. Contenuti Multimediali (immagini, mockups, color palette in quadrati con hex)
      let currentSubgrid = null;
      let currentColorsGrid = null;
      let graphicIndex = 0;

      data.forEach((item) => {
        // Ignora i campi di testo già gestiti nella tabella specs
        if (item.type === 'text') return;

        // Gestione Color Palette: quadrati a destra con il codice HEX sopra
        if (item.type === 'color') {
          currentSubgrid = null;
          if (!currentColorsGrid) {
            currentColorsGrid = document.createElement('div');
            currentColorsGrid.className = 'editorial-colors-grid';
            mediaStream.appendChild(currentColorsGrid);
          }
          const colorCard = document.createElement('div');
          colorCard.className = 'editorial-color-card';
          const hexCode = item.hex || item.label || '';
          colorCard.innerHTML = `
            <span class="color-hex-header">${hexCode}</span>
            <div class="color-square-swatch cursor-target" style="background-color: ${hexCode};" title="${item.label || hexCode}"></div>
          `;
          currentColorsGrid.appendChild(colorCard);
          return;
        }

        // Se l'elemento non è un colore, chiudi l'eventuale griglia colori aperta
        currentColorsGrid = null;

        // Header di sezione (SENZA sfondo nero, testo allineato a sinistra)
        if (item.type === 'header') {
          currentSubgrid = null;
          const headerEl = document.createElement('div');
          headerEl.className = 'editorial-stream-header';
          headerEl.innerHTML = `<h2>${item.label}</h2>`;
          mediaStream.appendChild(headerEl);
          return;
        }

        const uniqueId = `stream-item-${graphicIndex++}`;

        // Link Figma
        if (item.type === 'figma') {
          currentSubgrid = null;
          const figmaCard = document.createElement('a');
          figmaCard.id = uniqueId;
          figmaCard.href = item.embedUrl;
          figmaCard.target = '_blank';
          figmaCard.rel = 'noopener noreferrer';
          figmaCard.className = 'editorial-link-card cursor-target';
          const isFigmaUrl = item.embedUrl && item.embedUrl.includes('figma.com');
          figmaCard.innerHTML = `
            <div class="link-card-body">
              <span class="link-tag">${isFigmaUrl ? 'FIGMA PROTOTYPE' : 'LIVE WEBSITE'}</span>
              <h3>${item.label}</h3>
            </div>
            <span class="link-arrow">${ARROW_SVG_DIAG}</span>
          `;
          mediaStream.appendChild(figmaCard);
          return;
        }

        // Link generico (es. pubblicazioni)
        if (item.type === 'link') {
          currentSubgrid = null;
          const linkCard = document.createElement('a');
          linkCard.id = uniqueId;
          linkCard.href = item.href;
          linkCard.target = '_blank';
          linkCard.rel = 'noopener noreferrer';
          linkCard.className = 'editorial-link-card cursor-target';
          linkCard.innerHTML = `
            <div class="link-card-body">
              <span class="link-tag">PUBLICATION</span>
              <h3>${item.label}</h3>
              ${item.description ? `<p>${item.description}</p>` : ''}
            </div>
            <span class="link-arrow">${ARROW_SVG_DIAG}</span>
          `;
          mediaStream.appendChild(linkCard);
          return;
        }

        // Immagini e Screenshot
        if (item.type === 'image') {
          const isAppScreenshot = item.subtype === 'app-screenshot';
          const isFullWidth = isAppScreenshot || (item.label && (
            item.label.toLowerCase().includes('brochure') ||
            item.label.toLowerCase().includes('mockup') ||
            item.label.toLowerCase().includes('vetrina') ||
            item.label.toLowerCase().includes('tote') ||
            item.label.toLowerCase().includes('cart')
          ));

          if (isFullWidth) {
            currentSubgrid = null;
            const fullItem = document.createElement('div');
            fullItem.id = uniqueId;
            fullItem.className = 'editorial-stream-full-item';
            const img = document.createElement('img');
            img.src = item.src.endsWith('.svg') ? item.src : toWebp(item.src);
            img.alt = item.label;
            img.loading = 'lazy';
            img.decoding = 'async';
            fullItem.appendChild(img);
            if (item.label && !isAppScreenshot) {
              const cap = document.createElement('div');
              cap.className = 'stream-item-caption';
              cap.textContent = item.label;
              fullItem.appendChild(cap);
            }
            mediaStream.appendChild(fullItem);
          } else {
            if (!currentSubgrid) {
              currentSubgrid = document.createElement('div');
              currentSubgrid.className = 'editorial-media-subgrid';
              mediaStream.appendChild(currentSubgrid);
            }
            const gridItem = document.createElement('div');
            gridItem.id = uniqueId;
            gridItem.className = 'editorial-subgrid-item cursor-target';
            const img = document.createElement('img');
            img.src = item.src.endsWith('.svg') ? item.src : toWebp(item.src);
            img.alt = item.label;
            img.loading = 'lazy';
            img.decoding = 'async';
            gridItem.appendChild(img);
            if (item.label) {
              const cap = document.createElement('span');
              cap.className = 'subgrid-caption';
              cap.textContent = item.label;
              gridItem.appendChild(cap);
            }
            currentSubgrid.appendChild(gridItem);
          }
        }
      });

      editorialLayout.appendChild(mediaStream);

      // ── SEZIONE DESCRIZIONE: IN FONDO ALLA PAGINA ─────────────────
      if (!projectInfoSection) {
        const descTextItem = data.find(d => d.type === 'text' && (d.label === 'description' || d.label === 'values' || d.label === 'mission'));
        if (descTextItem) {
          projectInfoSection = document.createElement('section');
          projectInfoSection.className = 'project-info-section';
          const logoItem = data.find(d => d.type === 'image' && d.subtype === 'logo');
          projectInfoSection.innerHTML = `
            <div class="project-info-content">
              ${logoItem ? `<img src="${logoItem.src}" alt="${namingItem ? namingItem.content : 'Logo'}" style="width: 100px; margin-bottom: 2rem;" loading="lazy">` : ''}
              <h2>Values</h2>
              <div class="project-info-text">
                <p>${descTextItem.content}</p>
              </div>
            </div>
          `;
        }
      }

      if (projectInfoSection) {
        projectInfoSection.id = 'project-description-section';
      }

      // Inserimento ordinato nel DOM: layout 2 colonne prima, poi descrizione in fondo
      mainContainer.prepend(editorialLayout);
      if (projectInfoSection) {
        mainContainer.appendChild(projectInfoSection);
      }

      // ── GESTIONE SCROLL INTERATTIVO (LENIS) ────────────────────────
      const descScrollBtn = document.getElementById('editorialDescBtn');
      if (descScrollBtn && projectInfoSection) {
        descScrollBtn.addEventListener('click', (e) => {
          e.preventDefault();
          if (typeof window.lenis !== 'undefined' && window.lenis) {
            window.lenis.scrollTo(projectInfoSection, { duration: 1.5, offset: -40 });
          } else {
            projectInfoSection.scrollIntoView({ behavior: 'smooth' });
          }
        });
      }

      // ── DESCRIZIONE COLLASSABILE (MORE / LESS) ─────────────────────
      if (projectInfoSection) {
        const descriptionText = projectInfoSection.querySelector('.project-info-text');
        if (descriptionText) {
          const paragraphs = Array.from(descriptionText.querySelectorAll('p'));
          const extraParagraphs = paragraphs.slice(1);
          if (extraParagraphs.length > 0 && !projectInfoSection.querySelector('.description-more-btn')) {
            extraParagraphs.forEach(p => p.classList.add('description-hidden'));

            const moreBtn = document.createElement('button');
            moreBtn.classList.add('description-more-btn', 'cursor-target');
            moreBtn.innerHTML = `more <span class="btn-arrow">${ARROW_SVG_DOWN}</span>`;
            paragraphs[0].after(moreBtn);

            moreBtn.addEventListener('click', () => {
              const isExpanded = descriptionText.classList.toggle('expanded');
              moreBtn.classList.toggle('open', isExpanded);
              moreBtn.innerHTML = isExpanded
                ? `less <span class="btn-arrow">${ARROW_SVG_DOWN}</span>`
                : `more <span class="btn-arrow">${ARROW_SVG_DOWN}</span>`;
            });
          }
        }
      }
    })
    .catch(error => {
      console.error('Errore nel caricamento del progetto editoriale:', error);
    });
});
