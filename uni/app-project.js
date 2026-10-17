/**
 * app-project.js
 * Standardized Showcase Engine for Application Projects (zinco.cc)
 * Powered by JSONL data format.
 * Features:
 * - 2-Column Editorial Layout (Consistent with NUS / Swiss brutalist design system)
 * - Sticky Left Column with representative preview, technical infogrid, and action buttons
 * - Right Column Media Stream with image-level captions respecting the general site CSS
 * - Standardized project description section with more/less collapsible toggle
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
        {"type":"meta","name":"uni","tagline":"The native academic workspace for macOS","badge":"macOS NATIVE APPLICATION","brandColor":"#0071E3","websiteUrl":"https://uni.zinco.cc","websiteDomain":"uni.zinco.cc","downloadUrl":"https://github.com/zjncoo/uni/releases/latest/download/uni.dmg","githubUrl":"https://github.com/zjncoo/uni","platform":"macOS 14.0+","architecture":"Universal Binary (Apple Silicon & Intel)","stack":"Swift 5.10+, SwiftUI, AppKit, Combine","privacy":"100% On-Device / Zero Cloud","license":"MIT License","icon":"img/icon.png","year":"2026"},
        {"type":"hero","title":"uni","badge":"macOS NATIVE APP","websiteUrl":"https://uni.zinco.cc","websiteDomain":"uni.zinco.cc","downloadUrl":"https://github.com/zjncoo/uni/releases/latest/download/uni.dmg","downloadLabel":"download DMG"},
        {"type":"hero_media","src":"img/dashboard.webp","alt":"uni macOS app dashboard preview"},
        {"type":"description","label":"Values","paragraphs":["uni is the <strong>native academic workspace for macOS</strong>, engineered to solve the chronic fragmentation of higher education portals by unifying class timetables, faculty notices, deadlines, and GPA projections into a <strong>single fast, distraction-free command center</strong>.","built on an uncompromising <strong>local-first and zero-cloud architecture</strong>, all data stays strictly on your device: featuring <strong>intelligent 24h iCal timetable normalization</strong> that parses messy university feeds, a low-overhead <strong>AppleScript bridge for Microsoft Outlook</strong>, and <strong>zero-copy Finder links</strong> so your study materials remain untouched in their original folders."]},
        {"type":"specs","title":"technical specifications","items":[{"label":"platform","value":"macOS 14.0+ (Sonoma & Sequoia)"},{"label":"architecture","value":"Universal Binary (Apple Silicon & Intel)"},{"label":"frameworks","value":"Swift 5.10+, SwiftUI, AppKit, Combine"},{"label":"privacy","value":"100% On-Device / Zero Cloud"},{"label":"distribution","value":"Direct DMG & Open Source"},{"label":"license","value":"MIT License"}]},
        {"type":"header","label":"interfaces & screenshots"},
        {"type":"screenshot","label":"Dashboard","subtitle":"Today's schedule, deadlines & notices","src":"img/dashboard.webp","caption":"Unified daily overview highlighting today's scheduled lectures, imminent assignment deadlines, and linked teacher communications."},
        {"type":"screenshot","label":"Intelligent Calendar","subtitle":"24h timetable & iCal webcal parsing","src":"img/calendar.webp","caption":"Automated calendar normalization that turns raw university feeds into clear lecture blocks, assigned rooms, and faculty references."},
        {"type":"screenshot","label":"Deadlines & Deliveries","subtitle":"In-app solid HUD & focus sessions","src":"img/deadlines.webp","caption":"Delivery tracking with non-intrusive floating pill HUD alerts and built-in Pomodoro focus sessions for deep study blocks."},
        {"type":"screenshot","label":"Exams & Career","subtitle":"Weighted GPA & graduation baseline","src":"img/exams.webp","caption":"Comprehensive academic transcript tracking: arithmetic & weighted GPA, CFU progress, and real-time graduation score projections."},
        {"type":"screenshot","label":"Spotlight Palette (⌘F)","subtitle":"Instant keyboard search across all courses","src":"img/search.webp","caption":"Command palette invoked anywhere via ⌘F to instantly locate courses, lecture materials, exam dates, or launch context actions."},
        {"type":"screenshot","label":"macOS Distribution","subtitle":"Custom drag-and-drop installer","src":"img/dmg_showcase.webp","caption":"Custom-crafted DMG installer with branded background and seamless drag-and-drop installation into Applications."},
        {"type":"header","label":"links & resources"},
        {"type":"link","label":"Official Web App","description":"Discover the dedicated landing page and interactive interface simulator at uni.zinco.cc.","href":"https://uni.zinco.cc","cta":"visit website","primary":true}
        ,{"type":"link","label":"GitHub Repository","description":"Browse the open-source Swift 5.10+ codebase, architecture notes, and issue tracker.","href":"https://github.com/zjncoo/uni","cta":"view on GitHub","primary":false}
        ,{"type":"link","label":"Download Latest DMG","description":"Download the pre-compiled universal binary for Apple Silicon and Intel Mac devices directly.","href":"https://github.com/zjncoo/uni/releases/latest/download/uni.dmg","cta":"download release","primary":false}
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

  const isWebApp = Boolean(
    (metaItem.badge && metaItem.badge.toLowerCase().includes('pwa')) ||
    (metaItem.badge && metaItem.badge.toLowerCase().includes('web app')) ||
    (metaItem.name && metaItem.name.toLowerCase() === 'clotho')
  );

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
        const linkAriaLabel = isWebApp 
          ? `Visit official web app for ${heroItem.title || metaItem.name || 'the app'}`
          : `Visit official website for ${heroItem.title || metaItem.name || 'the app'}`;
        websiteLink.setAttribute('aria-label', linkAriaLabel);

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

  // 4B. Specs Table (Infogrid, max regular font weight 400)
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
    const siteBtnText = isWebApp ? 'Open Web App' : 'Visit Website';
    siteBtn.innerHTML = `
      <span>${siteBtnText}</span>
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

  // Lista screenshot con didascalie sotto ciascuna immagine
  screenshotItems.forEach((item, idx) => {
    const mediaItem = document.createElement('div');
    mediaItem.className = 'project-media-item';
    mediaItem.id = `screenshot-item-${idx}`;

    const imgWrap = document.createElement('div');
    imgWrap.className = 'cursor-target';
    imgWrap.style.position = 'relative';
    imgWrap.style.lineHeight = '0';
    imgWrap.innerHTML = `
      <img src="${item.src}" alt="${item.label || `Screenshot ${idx + 1}`}" loading="${idx === 0 ? 'eager' : 'lazy'}" decoding="async">
      <div class="media-zoom-pill">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <span>expand</span>
      </div>
    `;
    imgWrap.addEventListener('click', () => {
      openLightbox(item.src, item.label || '', item.caption || item.description || item.subtitle || '');
    });
    mediaItem.appendChild(imgWrap);

    // Didascalia sotto l'immagine (formattazione conforme al CSS generale del sito)
    const captionBox = document.createElement('div');
    captionBox.className = 'stream-item-caption';
    captionBox.innerHTML = `
      <div class="stream-caption-header">
        <span class="stream-caption-title">${item.label || ''}</span>
        ${item.subtitle ? `<span class="stream-caption-subtitle">— ${item.subtitle}</span>` : ''}
      </div>
      ${(item.caption || item.description) ? `<p class="stream-caption-desc">${item.caption || item.description}</p>` : ''}
    `;
    mediaItem.appendChild(captionBox);

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

  // 5. Configurazione Sezione Descrizione Progetto in Fondo (Identica a NUS e agli altri progetti)
  if (projectInfoSection) {
    projectInfoSection.id = 'project-description-section';

    // Rimuove eventuale logo/icona duplicata sopra il titolo
    const strayImg = projectInfoSection.querySelector('.project-info-content > img');
    if (strayImg) strayImg.remove();

    // Titolo formattato esattamente come DESCRIPTION / NOME
    const descTitle = projectInfoSection.querySelector('h2');
    if (descTitle) {
      descTitle.textContent = `DESCRIPTION / ${(metaItem.name || 'PROJECT').toUpperCase()}`;
    }

    // Collasso paragrafi successivi al primo (more / less)
    const descriptionText = projectInfoSection.querySelector('.project-info-text');
    if (descriptionText) {
      const paragraphs = Array.from(descriptionText.querySelectorAll('p'));
      if (paragraphs.length > 1 && !projectInfoSection.querySelector('.description-more-btn')) {
        paragraphs.slice(1).forEach(p => p.classList.add('description-hidden'));

        const moreBtn = document.createElement('button');
        moreBtn.className = 'description-more-btn cursor-target';
        moreBtn.type = 'button';
        moreBtn.innerHTML = 'more <span class="btn-arrow">↓</span>';
        descriptionText.after(moreBtn);

        moreBtn.addEventListener('click', () => {
          const isExpanded = descriptionText.classList.toggle('expanded');
          moreBtn.classList.toggle('open', isExpanded);
          moreBtn.innerHTML = isExpanded 
            ? 'less <span class="btn-arrow">↑</span>' 
            : 'more <span class="btn-arrow">↓</span>';
        });
      }
    }

    if (mainSection) {
      mainSection.appendChild(projectInfoSection);
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

  // 6. Modale Lightbox per ingrandire screenshot
  setupLightbox();
}

function setupLightbox() {
  if (document.getElementById('appLightbox')) return;

  const lightbox = document.createElement('div');
  lightbox.id = 'appLightbox';
  lightbox.className = 'app-lightbox';
  lightbox.innerHTML = `
    <button class="lightbox-close-btn cursor-target" id="lightboxCloseBtn" aria-label="Close image">×</button>
    <div class="lightbox-media-stage">
      <img id="lightboxImg" src="" alt="Expanded preview">
    </div>
    <div class="lightbox-caption-bottom">
      <div class="lightbox-caption-header">
        <span id="lightboxTitle" class="lightbox-caption-title"></span>
        <span id="lightboxSubtitle" class="lightbox-caption-subtitle"></span>
      </div>
      <p id="lightboxCaption" class="lightbox-caption-text"></p>
    </div>
  `;

  document.body.appendChild(lightbox);

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    document.body.classList.remove('lightbox-open');
    if (window.lenis) window.lenis.start();
  };

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.id === 'lightboxCloseBtn' || (e.target.closest && e.target.closest('#lightboxCloseBtn'))) {
      closeLightbox();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) {
      closeLightbox();
    }
  });
}

function openLightbox(src, title, caption, subtitle) {
  const lightbox = document.getElementById('appLightbox');
  if (!lightbox) return;

  const img = document.getElementById('lightboxImg');
  const titleEl = document.getElementById('lightboxTitle');
  const subtitleEl = document.getElementById('lightboxSubtitle');
  const captionEl = document.getElementById('lightboxCaption');

  if (img) img.src = src;
  if (titleEl) titleEl.textContent = title || '';
  if (subtitleEl) subtitleEl.textContent = subtitle ? `— ${subtitle}` : '';
  if (captionEl) captionEl.textContent = caption || '';

  lightbox.classList.add('is-open');
  document.body.classList.add('lightbox-open');

  // CRITICAL FIX: Relocate cursor to end of body so it is always on top
  const cursorEl = document.getElementById('cursor');
  if (cursorEl) {
    document.body.appendChild(cursorEl);
    cursorEl.style.zIndex = '2147483647';
  }

  if (window.lenis) window.lenis.stop();
}
