/**
 * app-project.js
 * Standardized Showcase Engine for Application Projects (zinco.cc)
 * Powered by JSONL data format.
 * Features:
 * - 2-Column Editorial Layout (NUS-inspired brutalist/minimalist Swiss design)
 * - Sticky Left Column with brief intro, specs, and dynamic stacking captions
 * - Captions that appear and stack sequentially with understated animation as user scrolls
 * - Interactive synchronization between left captions and right media stream
 */

document.addEventListener('DOMContentLoaded', () => {
  const ARROW_SVG_DIAG = '<svg class="custom-arrow-icon" viewBox="0 0 10 10" width="10" height="10" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><line x1="1.5" y1="8.5" x2="8.5" y2="1.5"></line><polyline points="3.5 1.5 8.5 1.5 8.5 6.5"></polyline></svg>';
  const ARROW_SVG_DOWN = '<svg class="custom-arrow-icon" viewBox="0 0 10 10" width="10" height="10" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="1" x2="5" y2="8.5"></line><polyline points="1.5 5 5 8.5 8.5 5"></polyline></svg>';

  const dataFile = 'app-data.jsonl';

  fetch(dataFile)
    .then(response => {
      if (!response.ok) {
        return fetch('app-data.json').then(res => {
          if (!res.ok) throw new Error(`Could not load data file: ${response.status}`);
          return res.json();
        });
      }
      return response.text();
    })
    .then(rawContent => {
      let data = [];
      if (Array.isArray(rawContent)) {
        data = rawContent;
      } else if (typeof rawContent === 'string') {
        const trimmed = rawContent.trim();
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          data = JSON.parse(trimmed);
        } else {
          data = trimmed
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0 && !line.startsWith('//') && !line.startsWith('#'))
            .map((line, idx) => {
              try {
                return JSON.parse(line);
              } catch (err) {
                console.warn(`[app-project] Error parsing line ${idx + 1}:`, line, err);
                return null;
              }
            })
            .filter(Boolean);
        }
      }

      renderAppShowcase(data);
    })
    .catch(error => {
      console.warn('[app-project] Failed to fetch data, attempting embedded fallback data:', error);
      const fallbackData = [
        {"type":"meta","name":"clotho","tagline":"Digital Wardrobe & On-Device AI Outfit Studio","badge":"PROGRESSIVE WEB APP","brandColor":"#D9531E","websiteUrl":"https://info.clotho.zinco.cc","websiteDomain":"info.clotho.zinco.cc","githubUrl":"https://github.com/zjncoo/clotho","platform":"PWA • iOS • Android • macOS • Web","architecture":"100% Client-Side Local-First (IndexedDB)","stack":"Next.js 14, TypeScript, TailwindCSS, Framer Motion","privacy":"Zero Cloud Servers, Zero Trackers","license":"MIT License","icon":"img/icon.svg","year":"2026"},
        {"type":"hero","title":"clotho","badge":"PROGRESSIVE WEB APP","websiteUrl":"https://info.clotho.zinco.cc","websiteDomain":"info.clotho.zinco.cc","downloadUrl":"https://github.com/zjncoo/clotho","downloadLabel":"view source"},
        {"type":"hero_media","src":"img/clotho_preview.webp","alt":"clotho digital wardrobe app interface"},
        {"type":"description","label":"Values","paragraphs":["clotho is a <strong>private, local-first digital wardrobe</strong> and interactive outfit studio designed to turn daily dressing into a mindful, creative ritual without uploading a single photo to the cloud.","featuring <strong>instant on-device AI background removal in 0.2s</strong>, a <strong>7-slot interactive mannequin canvas</strong>, and a <strong>visual outfit calendar with style streaks</strong>, clotho gives you complete data sovereignty with zero trackers and zero cloud dependencies."]},
        {"type":"specs","title":"technical specifications","items":[{"label":"platform","value":"PWA (iOS, Android, macOS, Web)"},{"label":"architecture","value":"100% Client-Side (IndexedDB idb-keyval)"},{"label":"frameworks","value":"Next.js 14.2, TypeScript, TailwindCSS, Framer Motion"},{"label":"ai engine","value":"On-Device Background Removal (0.2s)"},{"label":"privacy","value":"Zero Cloud Servers, Zero Trackers"},{"label":"license","value":"MIT Open Source"}]},
        {"type":"header","label":"screenshots & interface"},
        {"type":"screenshot","label":"Mannequin Studio","subtitle":"7-slot interactive silhouette layering","src":"img/IMG_4002.webp","caption":"Audition layered outfits in real time across headwear, necklaces, tops, outerwear, bottoms, bags, and shoes with multi-layering support."},
        {"type":"screenshot","label":"Digital Wardrobe","subtitle":"Intelligent garment cataloging","src":"img/IMG_3998.webp","caption":"Filter and browse your digitized wardrobe by category, brand tags, color swatches, primary materials, and wear frequency counts."},
        {"type":"screenshot","label":"Style Calendar","subtitle":"Visual outfit diary & streaks","src":"img/IMG_4003.webp","caption":"Track daily looks with high-resolution collage snapshots, multi-outfit logging, and gamified style streaks to encourage intentional fashion."},
        {"type":"screenshot","label":"AI Auto-Cut","subtitle":"Instant background removal in 0.2s","src":"img/IMG_3999.webp","caption":"Snap or upload clothes on any surface; Clotho erases messy backgrounds directly on your device with interactive cutout refinement."},
        {"type":"screenshot","label":"Garment Details","subtitle":"Material, brand & wear analytics","src":"img/IMG_4001.webp","caption":"Detailed garment editor with wear frequency tracking, multi-season tags, material composition, and purchase history."},
        {"type":"screenshot","label":"Minimalist Experience","subtitle":"Dark & light mode with liquid glass aesthetic","src":"img/IMG_3997.webp","caption":"Fluid animations, crystalline Web Audio sound effects, haptic feedback, and offline Progressive Web App capability."},
        {"type":"header","label":"links & resources"},
        {"type":"link","label":"Official Web App","description":"Launch the digital wardrobe and outfit studio directly in your browser at info.clotho.zinco.cc.","href":"https://info.clotho.zinco.cc","cta":"open studio","primary":true},
        {"type":"link","label":"Privacy Policy","description":"Full GDPR and ePrivacy compliant disclosure on local-first processing, zero cloud telemetry, and on-device AI.","href":"https://info.clotho.zinco.cc/privacy.html","cta":"read privacy","primary":false},
        {"type":"link","label":"Terms & EULA","description":"End-user license agreement, trademark notices, and warranty disclaimers for Clotho.","href":"https://info.clotho.zinco.cc/terms.html","cta":"read terms","primary":false},
        {"type":"link","label":"GitHub Repository","description":"Explore the open-source Next.js 14 codebase, installable PWA configs, and issue tracker.","href":"https://github.com/zjncoo/clotho","cta":"view on GitHub","primary":false},
        {"type":"link","label":"Documentation","description":"Read full architecture documentation, feature deep dives, and data sovereignty philosophy.","href":"https://github.com/zjncoo/clotho#readme","cta":"read docs","primary":false}
      ];
      renderAppShowcase(fallbackData);
    });
});

function renderAppShowcase(data) {
  const heroTitle = document.getElementById('hero-title');
  const projectHero = document.getElementById('project-hero');
  const mainSection = document.getElementById('sezione-progetto') || document.querySelector('main');
  let projectInfoSection = document.querySelector('.project-info-section');
  const projectInfoContent = document.querySelector('.project-info-content');

  const metaItem = data.find(item => item.type === 'meta') || {};
  const heroItem = data.find(item => item.type === 'hero') || {};
  const heroMediaItem = data.find(item => item.type === 'hero_media');
  const descItem = data.find(item => item.type === 'description');
  const specsItem = data.find(item => item.type === 'specs');

  // Hide old glance container if present
  const heroGlance = document.querySelector('#hero-wrapper #glance-container, main > #glance-container');
  if (heroGlance) {
    heroGlance.style.display = 'none';
  }

  // 1. Hero Title
  if (heroTitle) {
    heroTitle.textContent = heroItem.title || metaItem.name || 'App Showcase';
  }

  // 2. Grand Hero App Link (prominent CTA in the Hero)
  if (projectHero && (heroItem || metaItem)) {
    const websiteUrl = heroItem.websiteUrl || metaItem.websiteUrl;
    const downloadUrl = heroItem.downloadUrl || metaItem.downloadUrl || heroItem.githubUrl || metaItem.githubUrl;

    if (websiteUrl || downloadUrl) {
      let heroActionBox = document.querySelector('.hero-app-cta-container');
      if (!heroActionBox) {
        heroActionBox = document.createElement('div');
        heroActionBox.className = 'hero-app-cta-container';
        const titleContainer = document.querySelector('.hero-title-container');
        if (titleContainer) {
          titleContainer.appendChild(heroActionBox);
        } else {
          projectHero.appendChild(heroActionBox);
        }
      }

      heroActionBox.innerHTML = '';

      if (websiteUrl) {
        const websiteLink = document.createElement('a');
        websiteLink.href = websiteUrl;
        websiteLink.target = '_blank';
        websiteLink.rel = 'noopener noreferrer';
        websiteLink.className = 'hero-editorial-link cursor-target';
        websiteLink.id = 'heroWebAppLink';
        websiteLink.setAttribute('aria-label', `Visit official web app for ${heroItem.title || 'the app'}`);

        const domainText = heroItem.websiteDomain || websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

        websiteLink.innerHTML = `
          <span class="pulse-dot"></span>
          <span class="hero-link-text">${domainText}</span>
          <svg class="hero-link-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="7" y1="17" x2="17" y2="7"></line>
            <polyline points="7 7 17 7 17 7"></polyline>
          </svg>
        `;
        heroActionBox.appendChild(websiteLink);
      }

      if (downloadUrl) {
        const downloadLink = document.createElement('a');
        downloadLink.href = downloadUrl;
        downloadLink.target = '_blank';
        downloadLink.rel = 'noopener noreferrer';
        downloadLink.className = 'hero-editorial-link cursor-target';
        downloadLink.id = 'heroDownloadLink';
        const isDmg = downloadUrl.endsWith('.dmg');
        const dlLabel = heroItem.downloadLabel || (isDmg ? 'download DMG' : 'view source');

        downloadLink.innerHTML = `
          <svg class="download-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            ${isDmg 
              ? '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>' 
              : '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>'
            }
          </svg>
          <span class="hero-link-text">${dlLabel}</span>
          <span class="hero-link-arrow-text">${isDmg ? '↓' : '↗'}</span>
        `;
        heroActionBox.appendChild(downloadLink);
      }
    }
  }

  // 3. Extract Screenshots and Links
  const screenshotItems = data.filter(item => item.type === 'screenshot' || item.type === 'image');
  const linkItems = data.filter(item => item.type === 'link');
  const headerItems = data.filter(item => item.type === 'header');

  // Build clean brief description text for left column
  let briefDesc = metaItem.tagline || '';
  if (descItem && Array.isArray(descItem.paragraphs) && descItem.paragraphs.length > 0) {
    const rawP = descItem.paragraphs[0].replace(/<[^>]*>/g, '');
    if (rawP.length > 10) {
      briefDesc = rawP;
    }
  }

  // Clean old elements from main
  const oldAppGrid = document.getElementById('appGrid');
  if (oldAppGrid) oldAppGrid.remove();
  const oldHeroMedia = document.getElementById('hero-media-container');
  if (oldHeroMedia) oldHeroMedia.remove();
  const oldEditorialLayout = document.querySelector('.project-editorial-layout');
  if (oldEditorialLayout) oldEditorialLayout.remove();

  // 4. Construct the 2-Column Editorial Layout
  const editorialLayout = document.createElement('div');
  editorialLayout.className = 'project-editorial-layout app-editorial-layout';

  // --- COLONNA SINISTRA (Sticky) ---
  const stickyCol = document.createElement('aside');
  stickyCol.className = 'project-sticky-col app-sticky-col';

  // 4A. App Icon / Preview Image
  const repImgSrc = metaItem.icon || (heroMediaItem && heroMediaItem.src) || (screenshotItems[0] && screenshotItems[0].src);
  if (repImgSrc) {
    const photoBox = document.createElement('div');
    photoBox.className = 'editorial-photo-box';
    const repImg = document.createElement('img');
    repImg.src = repImgSrc;
    repImg.alt = metaItem.name || 'App icon';
    repImg.className = 'editorial-rep-img';
    repImg.loading = 'eager';
    if (metaItem.icon && metaItem.icon.includes('.png')) {
      repImg.style.objectFit = 'contain';
      repImg.style.padding = '8px';
      repImg.style.boxSizing = 'border-box';
    }
    photoBox.appendChild(repImg);
    stickyCol.appendChild(photoBox);
  }

  // 4B. Breve descrizione del progetto (Allineata a sinistra)
  if (briefDesc) {
    const introBox = document.createElement('div');
    introBox.className = 'app-editorial-intro';
    introBox.innerHTML = `<p>${briefDesc}</p>`;
    stickyCol.appendChild(introBox);
  }

  // 4C. Gruppo Bottoni Azione
  const ctaGroup = document.createElement('div');
  ctaGroup.className = 'editorial-cta-group';

  const websiteUrl = heroItem.websiteUrl || metaItem.websiteUrl;
  if (websiteUrl) {
    const siteBtn = document.createElement('a');
    siteBtn.href = websiteUrl;
    siteBtn.target = '_blank';
    siteBtn.rel = 'noopener noreferrer';
    siteBtn.className = 'editorial-action-btn editorial-site-btn cursor-target';
    siteBtn.innerHTML = `
      <span>Open Web App</span>
      <span class="btn-arrow">↗</span>
    `;
    ctaGroup.appendChild(siteBtn);
  }

  const downloadUrl = heroItem.downloadUrl || metaItem.downloadUrl;
  if (downloadUrl && downloadUrl.endsWith('.dmg')) {
    const dmgBtn = document.createElement('a');
    dmgBtn.href = downloadUrl;
    dmgBtn.target = '_blank';
    dmgBtn.rel = 'noopener noreferrer';
    dmgBtn.className = 'editorial-action-btn cursor-target';
    dmgBtn.innerHTML = `
      <span>Download DMG</span>
      <span class="btn-arrow">↓</span>
    `;
    ctaGroup.appendChild(dmgBtn);
  }

  const descBtn = document.createElement('button');
  descBtn.type = 'button';
  descBtn.className = 'editorial-action-btn editorial-desc-btn cursor-target';
  descBtn.id = 'editorialDescBtn';
  descBtn.innerHTML = `
    <span>Project Description</span>
    <span class="btn-arrow">↓</span>
  `;
  ctaGroup.appendChild(descBtn);
  stickyCol.appendChild(ctaGroup);

  // 4D. Specs Table (Infogrid, max regular font weight 400)
  if (specsItem && Array.isArray(specsItem.items) && specsItem.items.length > 0) {
    const specsTable = document.createElement('div');
    specsTable.className = 'editorial-specs-table';

    const tableHeader = document.createElement('div');
    tableHeader.className = 'specs-table-header';
    tableHeader.innerHTML = `<span>infogrid</span>`;
    specsTable.appendChild(tableHeader);

    if (metaItem.year) {
      const dateRow = document.createElement('div');
      dateRow.className = 'specs-row';
      dateRow.innerHTML = `<span class="specs-label">date</span><span class="specs-value">${metaItem.year}</span>`;
      specsTable.appendChild(dateRow);
    }
    if (metaItem.badge) {
      const catRow = document.createElement('div');
      catRow.className = 'specs-row';
      catRow.innerHTML = `<span class="specs-label">category</span><span class="specs-value">${metaItem.badge.toLowerCase()}</span>`;
      specsTable.appendChild(catRow);
    }

    specsItem.items.forEach(spec => {
      const row = document.createElement('div');
      row.className = 'specs-row';
      row.innerHTML = `
        <span class="specs-label">${spec.label.toLowerCase()}</span>
        <span class="specs-value">${spec.value}</span>
      `;
      specsTable.appendChild(row);
    });
    stickyCol.appendChild(specsTable);
  }

  // 4E. Dynamic Stacking Captions Stream (Didascalie che si susseguono e si ammontano)
  let captionsStreamEl = null;
  const captionCards = [];

  if (screenshotItems.length > 0) {
    captionsStreamEl = document.createElement('div');
    captionsStreamEl.className = 'app-captions-stream';
    captionsStreamEl.id = 'appCaptionsStream';

    const streamHeader = document.createElement('div');
    streamHeader.className = 'captions-stream-header';
    streamHeader.innerHTML = `
      <span>interfaces & features</span>
      <span class="captions-counter" id="captionsCounter">0 / ${screenshotItems.length}</span>
    `;
    captionsStreamEl.appendChild(streamHeader);

    screenshotItems.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'app-caption-card cursor-target';
      card.id = `caption-card-${idx}`;
      card.dataset.index = idx;

      const numStr = String(idx + 1).padStart(2, '0');
      card.innerHTML = `
        <div class="caption-card-header">
          <span class="caption-index">${numStr}</span>
          <h4 class="caption-title">${item.label || `Feature ${numStr}`}</h4>
        </div>
        ${item.subtitle ? `<span class="caption-subtitle">${item.subtitle}</span>` : ''}
        <p class="caption-body">${item.caption || item.description || ''}</p>
      `;

      // Cliccando sulla didascalia nella colonna di sinistra, scorre alla foto a destra
      card.addEventListener('click', () => {
        const targetMedia = document.getElementById(`screenshot-item-${idx}`);
        if (!targetMedia) return;
        if (window.lenis) {
          window.lenis.scrollTo(targetMedia, { offset: -80 });
        } else {
          targetMedia.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });

      captionCards.push(card);
      captionsStreamEl.appendChild(card);
    });

    stickyCol.appendChild(captionsStreamEl);
  }

  editorialLayout.appendChild(stickyCol);

  // --- COLONNA DESTRA (Media Stream) ---
  const mediaStream = document.createElement('div');
  mediaStream.className = 'project-media-stream';

  // Se c'è una hero media preview in testata (es. dashboard.webp o clotho_preview.webp)
  if (heroMediaItem && heroMediaItem.src) {
    const heroMediaWrap = document.createElement('div');
    heroMediaWrap.className = 'project-media-item hero-media-stream-item cursor-target';
    heroMediaWrap.innerHTML = `
      <img src="${heroMediaItem.src}" alt="${heroMediaItem.alt || metaItem.name || 'Hero Preview'}" loading="eager" decoding="async">
      <div class="media-zoom-pill">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <span>expand</span>
      </div>
    `;
    heroMediaWrap.addEventListener('click', () => {
      openLightbox(heroMediaItem.src, metaItem.name || 'App Preview', metaItem.tagline || '');
    });
    mediaStream.appendChild(heroMediaWrap);
  }

  // Lista screenshot
  const screenshotEls = [];
  screenshotItems.forEach((item, idx) => {
    const mediaItem = document.createElement('div');
    mediaItem.className = 'project-media-item cursor-target';
    mediaItem.id = `screenshot-item-${idx}`;
    mediaItem.dataset.index = idx;

    mediaItem.innerHTML = `
      <img src="${item.src}" alt="${item.label || `Screenshot ${idx + 1}`}" loading="${idx === 0 ? 'eager' : 'lazy'}" decoding="async">
      <div class="media-zoom-pill">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <span>expand</span>
      </div>
      <div class="mobile-screenshot-caption" style="display: none;">
        <h4>${item.label || ''}</h4>
        ${item.subtitle ? `<span>${item.subtitle}</span>` : ''}
        <p>${item.caption || item.description || ''}</p>
      </div>
    `;

    mediaItem.addEventListener('click', () => {
      openLightbox(item.src, item.label || '', item.caption || item.description || item.subtitle || '');
    });

    screenshotEls.push(mediaItem);
    mediaStream.appendChild(mediaItem);
  });

  // Sezione Links & Resources in coda al media stream
  if (linkItems.length > 0) {
    const linksHeader = document.createElement('div');
    linksHeader.className = 'media-stream-section-header';
    const headerTitle = (headerItems.find(h => h.label && h.label.includes('link')) || {}).label || 'links & resources';
    linksHeader.innerHTML = `<h2>${headerTitle}</h2>`;
    mediaStream.appendChild(linksHeader);

    const linksGrid = document.createElement('div');
    linksGrid.className = 'app-links-grid';

    linkItems.forEach(item => {
      const linkCard = document.createElement('a');
      linkCard.href = item.href;
      linkCard.target = '_blank';
      linkCard.rel = 'noopener noreferrer';
      linkCard.className = `app-link-card cursor-target ${item.primary ? 'primary' : ''}`;

      const rawCta = item.cta || 'Open link';
      const cleanCta = rawCta.replace(/[→↗↓←↑↔]/g, '').trim();

      linkCard.innerHTML = `
        <div class="link-card-body">
          <span class="link-card-tag">${item.primary ? 'FEATURED' : 'RESOURCE'}</span>
          <h3>${item.label}</h3>
          ${item.description ? `<p>${item.description}</p>` : ''}
        </div>
        <div class="link-card-cta">
          <span>${cleanCta}</span>
          <svg class="cta-arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </div>
      `;
      linksGrid.appendChild(linkCard);
    });

    mediaStream.appendChild(linksGrid);
  }

  editorialLayout.appendChild(mediaStream);

  // Inserimento ordinato in <main>
  if (mainSection) {
    mainSection.prepend(editorialLayout);
  }

  // 5. Configurazione Sezione Descrizione Progetto in Fondo
  if (projectInfoSection) {
    projectInfoSection.id = 'project-description-section';
    if (mainSection) mainSection.appendChild(projectInfoSection);

    // Colore brand su p
    const brandColor = metaItem.brandColor;
    if (brandColor && projectInfoContent) {
      const colorTargets = projectInfoContent.querySelectorAll('.project-info-text p, .project-info-text p strong');
      colorTargets.forEach(el => {
        el.style.color = brandColor;
      });
    }
  }

  // Scroll fluido al bottone "Project Description"
  if (descBtn) {
    descBtn.addEventListener('click', () => {
      const target = document.getElementById('project-description-section');
      if (!target) return;
      if (window.lenis) {
        window.lenis.scrollTo(target, { offset: -60 });
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // 6. SYNCHRONIZED SCROLL & DYNAMIC STACKING CAPTIONS
  // Le didascalie a sinistra si susseguono e si ammontano con animazione carina ma sobria
  if (screenshotEls.length > 0 && captionCards.length > 0) {
    const counterEl = document.getElementById('captionsCounter');
    let highestVisibleIndex = -1;
    let currentActiveIndex = -1;

    const updateCaptionsState = () => {
      const windowHeight = window.innerHeight;
      const triggerThreshold = windowHeight * 0.75; // Punto di attivazione per apparire nella pila
      const focusThreshold = windowHeight * 0.45;   // Punto focale centrale per stato attivo

      let newHighest = -1;
      let closestToCenterIdx = -1;
      let minDistance = Infinity;

      screenshotEls.forEach((el, idx) => {
        const rect = el.getBoundingClientRect();

        // Se la parte superiore dello screenshot entra nel 75% inferiore del viewport
        if (rect.top <= triggerThreshold && rect.bottom >= 60) {
          if (idx > newHighest) newHighest = idx;
        }

        // Trova lo screenshot più vicino al centro focale
        const elCenter = (rect.top + rect.bottom) / 2;
        const dist = Math.abs(elCenter - focusThreshold);
        if (rect.bottom > 80 && rect.top < windowHeight - 80) {
          if (dist < minDistance) {
            minDistance = dist;
            closestToCenterIdx = idx;
          }
        }
      });

      highestVisibleIndex = newHighest;
      currentActiveIndex = closestToCenterIdx >= 0 ? closestToCenterIdx : highestVisibleIndex;

      // Aggiorna stato di ogni singola card
      captionCards.forEach((card, idx) => {
        const isVisible = idx <= highestVisibleIndex;
        const isActive = idx === currentActiveIndex;

        if (isVisible) {
          card.classList.add('is-visible');
        } else {
          card.classList.remove('is-visible');
        }

        if (isActive) {
          card.classList.add('is-active');
          // Assicura che la card attiva sia visibile nel container di scroll
          if (captionsStreamEl && isVisible) {
            card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }
        } else {
          card.classList.remove('is-active');
        }
      });

      // Aggiorna contatore
      if (counterEl) {
        const count = highestVisibleIndex >= 0 ? highestVisibleIndex + 1 : 0;
        counterEl.textContent = `${count} / ${screenshotEls.length}`;
      }
    };

    // Ascolto scroll con Lenis o nativo
    let scrollRafId = null;
    const onScroll = () => {
      if (scrollRafId) return;
      scrollRafId = requestAnimationFrame(() => {
        updateCaptionsState();
        scrollRafId = null;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    // Inizializza subito
    setTimeout(updateCaptionsState, 150);
  }

  // 7. Modale Lightbox per ingrandire screenshot
  setupLightbox();
}

function setupLightbox() {
  if (document.getElementById('appLightbox')) return;

  const lightbox = document.createElement('div');
  lightbox.id = 'appLightbox';
  lightbox.className = 'app-lightbox';
  lightbox.innerHTML = `
    <button class="lightbox-close-btn cursor-target" id="lightboxCloseBtn" aria-label="Close image">×</button>
    <div class="lightbox-image-wrap">
      <img id="lightboxImg" src="" alt="Expanded preview">
    </div>
    <div class="lightbox-caption-bar">
      <h3 id="lightboxTitle"></h3>
      <p id="lightboxCaption"></p>
    </div>
  `;

  document.body.appendChild(lightbox);

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    if (window.lenis) window.lenis.start();
  };

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.id === 'lightboxCloseBtn') {
      closeLightbox();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) {
      closeLightbox();
    }
  });
}

function openLightbox(src, title, caption) {
  const lightbox = document.getElementById('appLightbox');
  if (!lightbox) return;

  const img = document.getElementById('lightboxImg');
  const titleEl = document.getElementById('lightboxTitle');
  const captionEl = document.getElementById('lightboxCaption');

  if (img) img.src = src;
  if (titleEl) titleEl.textContent = title || '';
  if (captionEl) captionEl.textContent = caption || '';

  lightbox.classList.add('is-open');
  if (window.lenis) window.lenis.stop();
}
