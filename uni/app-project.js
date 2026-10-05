/**
 * app-project.js
 * Standardized Showcase Engine for Application Projects (zinco.cc)
 * Powered by JSONL (JSON Lines) data format.
 */

document.addEventListener('DOMContentLoaded', () => {
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
      console.error('[app-project] Failed to initialize app showcase:', error);
    });
});

function renderAppShowcase(data) {
  const heroTitle = document.getElementById('hero-title');
  const projectHero = document.getElementById('project-hero');
  const glanceGrid = document.getElementById('glance-grid');
  const appGrid = document.getElementById('appGrid');
  const heroMediaContainer = document.getElementById('hero-media-container');
  const projectInfoContent = document.querySelector('.project-info-content');

  const metaItem = data.find(item => item.type === 'meta') || {};
  const heroItem = data.find(item => item.type === 'hero') || {};
  const heroMediaItem = data.find(item => item.type === 'hero_media');
  const descItem = data.find(item => item.type === 'description');
  const specsItem = data.find(item => item.type === 'specs');

  // 1. Hero Title
  if (heroTitle) {
    heroTitle.textContent = heroItem.title || metaItem.name || 'App Showcase';
  }

  // 2. Grand Hero App Link (prominent CTA in the Hero)
  if (projectHero && heroItem) {
    const websiteUrl = heroItem.websiteUrl || metaItem.websiteUrl;
    const downloadUrl = heroItem.downloadUrl || metaItem.downloadUrl;

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
        websiteLink.className = 'hero-app-big-link cursor-target';
        websiteLink.id = 'heroWebAppLink';
        websiteLink.setAttribute('aria-label', `Visit official web app for ${heroItem.title || 'the app'}`);

        const domainText = heroItem.websiteDomain || websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

        websiteLink.innerHTML = `
          <div class="hero-link-badge">
            <span class="pulse-dot"></span>
            <span>${heroItem.badge || 'OFFICIAL WEB APP'}</span>
          </div>
          <div class="hero-link-main">
            <span class="hero-link-domain">${domainText}</span>
            <svg class="hero-link-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="7" y1="17" x2="17" y2="7"></line>
              <polyline points="7 7 17 7 17 7"></polyline>
            </svg>
          </div>
        `;
        heroActionBox.appendChild(websiteLink);
      }

      if (downloadUrl) {
        const downloadLink = document.createElement('a');
        downloadLink.href = downloadUrl;
        downloadLink.target = '_blank';
        downloadLink.rel = 'noopener noreferrer';
        downloadLink.className = 'hero-app-download-btn cursor-target';
        downloadLink.id = 'heroDownloadLink';
        const rawDownloadLabel = heroItem.downloadLabel || (downloadUrl.endsWith('.dmg') ? 'download DMG' : 'view source');
        const downloadLabel = rawDownloadLabel.replace(/[↓↗→←↑↔]/g, '').trim();
        const isDmg = downloadUrl.toLowerCase().endsWith('.dmg') || downloadLabel.toLowerCase().includes('dmg');
        downloadLink.innerHTML = `
          <svg class="download-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            ${isDmg ? `
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            ` : `
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            `}
          </svg>
          <span>${downloadLabel}</span>
        `;
        heroActionBox.appendChild(downloadLink);
      }
    }
  }

  // 3. Hero Media Banner (optional full preview)
  if (heroMediaContainer && heroMediaItem && heroMediaItem.src) {
    heroMediaContainer.innerHTML = `
      <div class="hero-media-wrapper cursor-target" id="heroMediaPreview" data-full-src="${heroMediaItem.src}" data-caption="${heroMediaItem.alt || ''}">
        <img src="${heroMediaItem.src}" alt="${heroMediaItem.alt || 'App preview'}" loading="eager" decoding="async">
        <div class="hero-media-overlay">
          <span class="zoom-pill">
            <svg class="zoom-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="margin-right: 6px; vertical-align: middle;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>Click to expand preview
          </span>
        </div>
      </div>
    `;
    const heroPreviewEl = heroMediaContainer.querySelector('#heroMediaPreview');
    if (heroPreviewEl) {
      heroPreviewEl.addEventListener('click', () => {
        openLightbox(heroMediaItem.src, heroItem.title || metaItem.name || 'Overview', heroMediaItem.alt || '');
      });
    }
  }

  // 4. Project Info / Editorial Description (Signature Zinco Colored Style as in NUS)
  if (projectInfoContent) {
    // If description is provided in JSONL and not already rendered statically
    if (descItem && descItem.paragraphs) {
      projectInfoContent.innerHTML = '';

      if (metaItem.icon) {
        const iconImg = document.createElement('img');
        iconImg.src = metaItem.icon;
        iconImg.alt = `${metaItem.name || 'App'} Logo`;
        iconImg.style.width = '100px';
        iconImg.style.height = '100px';
        iconImg.style.marginBottom = '2rem';
        iconImg.style.borderRadius = metaItem.icon.endsWith('.svg') ? '0' : '22px';
        iconImg.loading = 'lazy';
        iconImg.decoding = 'async';
        projectInfoContent.appendChild(iconImg);
      }

      const h2 = document.createElement('h2');
      h2.textContent = descItem.label || 'Values';
      projectInfoContent.appendChild(h2);

      const textDiv = document.createElement('div');
      textDiv.className = 'project-info-text';

      descItem.paragraphs.forEach(pContent => {
        const p = document.createElement('p');
        p.innerHTML = pContent;
        textDiv.appendChild(p);
      });

      projectInfoContent.appendChild(textDiv);
    }

    // Apply brand color override dynamically if provided
    const brandColor = metaItem.brandColor;
    if (brandColor) {
      const colorTargets = projectInfoContent.querySelectorAll('.project-info-text p, .project-info-text p strong');
      colorTargets.forEach(el => {
        el.style.color = brandColor;
      });
    }

    // --- DESCRIZIONE COLLASSABILE (ESATTAMENTE COME IN NUS) ---
    const descriptionText = projectInfoContent.querySelector('.project-info-text');
    if (descriptionText) {
      const paragraphs = Array.from(descriptionText.querySelectorAll('p'));
      const extraParagraphs = paragraphs.slice(1);
      if (extraParagraphs.length > 0) {
        extraParagraphs.forEach(p => p.classList.add('description-hidden'));

        let moreBtn = projectInfoContent.querySelector('.description-more-btn');
        if (!moreBtn) {
          moreBtn = document.createElement('button');
          moreBtn.classList.add('description-more-btn', 'cursor-target');
          const chevronDownSvg = `<svg class="btn-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
          moreBtn.innerHTML = `more ${chevronDownSvg}`;
          paragraphs[0].after(moreBtn);

          moreBtn.addEventListener('click', () => {
            const isExpanded = descriptionText.classList.toggle('expanded');
            moreBtn.classList.toggle('open', isExpanded);
            moreBtn.innerHTML = isExpanded
              ? `less ${chevronDownSvg}`
              : `more ${chevronDownSvg}`;
          });
        }
      }
    }

    // Append Technical Specifications Strip below description
    if (specsItem && Array.isArray(specsItem.items) && !projectInfoContent.querySelector('.app-specs-strip')) {
      const specsGrid = document.createElement('div');
      specsGrid.className = 'app-specs-strip';

      specsItem.items.forEach(spec => {
        const specCell = document.createElement('div');
        specCell.className = 'app-spec-cell';
        specCell.innerHTML = `
          <span class="spec-label">${spec.label}</span>
          <span class="spec-value">${spec.value}</span>
        `;
        specsGrid.appendChild(specCell);
      });

      projectInfoContent.appendChild(specsGrid);
    }
  }

  // 5. Main Grid (Screenshots, Headers, Links) & Glance Navigation
  if (appGrid) appGrid.innerHTML = '';
  if (glanceGrid) glanceGrid.innerHTML = '';

  let screenshotIndex = 0;

  data.forEach((item, index) => {
    const uniqueId = `app-item-${index}`;

    if (item.type === 'header') {
      const headerItem = document.createElement('div');
      headerItem.className = 'app-grid-header';
      headerItem.id = uniqueId;
      headerItem.innerHTML = `<h2>${item.label}</h2>`;
      if (appGrid) appGrid.appendChild(headerItem);
      return;
    }

    if (item.type === 'screenshot' || item.type === 'image') {
      screenshotIndex++;
      const card = document.createElement('article');
      card.className = 'app-screenshot-card cursor-target';
      card.id = uniqueId;

      const imgWrapper = document.createElement('div');
      imgWrapper.className = 'screenshot-frame';

      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.label || `Screenshot ${screenshotIndex}`;
      img.loading = 'lazy';
      img.decoding = 'async';

      const zoomHint = document.createElement('div');
      zoomHint.className = 'screenshot-zoom-hint';
      zoomHint.innerHTML = `<span><svg class="zoom-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="margin-right: 5px; vertical-align: middle;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>Expand view</span>`;

      imgWrapper.append(img, zoomHint);

      const metaBox = document.createElement('div');
      metaBox.className = 'screenshot-meta';

      const title = document.createElement('h3');
      title.textContent = item.label || '';
      metaBox.appendChild(title);

      if (item.subtitle) {
        const sub = document.createElement('span');
        sub.className = 'screenshot-subtitle';
        sub.textContent = item.subtitle;
        metaBox.appendChild(sub);
      }

      if (item.caption || item.description) {
        const cap = document.createElement('p');
        cap.textContent = item.caption || item.description;
        metaBox.appendChild(cap);
      }

      card.append(imgWrapper, metaBox);

      card.addEventListener('click', () => {
        openLightbox(item.src, item.label, item.caption || item.description || item.subtitle || '');
      });

      if (appGrid) appGrid.appendChild(card);

      if (glanceGrid) {
        const glanceLink = document.createElement('a');
        glanceLink.href = `#${uniqueId}`;
        glanceLink.className = 'glance-item cursor-target';
        glanceLink.setAttribute('aria-label', `Jump to ${item.label}`);

        const thumbImg = document.createElement('img');
        thumbImg.src = item.src;
        thumbImg.alt = `Thumbnail ${item.label}`;
        thumbImg.loading = 'lazy';

        glanceLink.appendChild(thumbImg);
        glanceGrid.appendChild(glanceLink);
      }
      return;
    }

    if (item.type === 'link') {
      const linkCard = document.createElement('a');
      linkCard.href = item.href;
      linkCard.target = '_blank';
      linkCard.rel = 'noopener noreferrer';
      linkCard.className = `app-link-card cursor-target ${item.primary ? 'primary' : ''}`;
      linkCard.id = uniqueId;

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

      if (appGrid) appGrid.appendChild(linkCard);

      if (glanceGrid) {
        const glanceLink = document.createElement('a');
        glanceLink.href = `#${uniqueId}`;
        glanceLink.className = 'glance-item glance-text cursor-target';
        glanceLink.setAttribute('aria-label', `Jump to ${item.label}`);
        glanceLink.innerHTML = `<span>${item.label}</span>`;
        glanceGrid.appendChild(glanceLink);
      }
      return;
    }

    if (item.type === 'color') {
      const colorItem = document.createElement('div');
      colorItem.className = 'app-color-item';
      colorItem.id = uniqueId;
      colorItem.style.backgroundColor = item.hex;
      colorItem.innerHTML = `<span class="color-label">${item.label || item.hex}</span>`;
      if (appGrid) appGrid.appendChild(colorItem);

      if (glanceGrid) {
        const glanceLink = document.createElement('a');
        glanceLink.href = `#${uniqueId}`;
        glanceLink.className = 'glance-item glance-color cursor-target';
        glanceLink.style.backgroundColor = item.hex;
        glanceGrid.appendChild(glanceLink);
      }
      return;
    }
  });

  setupSmoothScroll();
  initLightbox();
}

function setupSmoothScroll() {
  const anchors = document.querySelectorAll('#glance-grid a, .scroll-down-arrow');
  anchors.forEach(link => {
    link.addEventListener('click', e => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        if (typeof window.lenis !== 'undefined') {
          window.lenis.scrollTo(targetId, { duration: 1.6, offset: -40 });
        } else {
          const targetEl = document.querySelector(targetId);
          if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}

function initLightbox() {
  let modal = document.getElementById('screenshotLightbox');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'screenshotLightbox';
    modal.className = 'screenshot-lightbox';
    modal.innerHTML = `
      <div class="lightbox-backdrop"></div>
      <div class="lightbox-dialog" role="dialog" aria-modal="true">
        <button class="lightbox-close cursor-target" aria-label="Close dialog">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div class="lightbox-content">
          <img src="" alt="" id="lightboxImg">
          <div class="lightbox-caption-bar">
            <h4 id="lightboxTitle"></h4>
            <p id="lightboxCaption"></p>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('.lightbox-close');
    const backdrop = modal.querySelector('.lightbox-backdrop');

    const closeModal = () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  }
}

function openLightbox(src, title, caption) {
  const modal = document.getElementById('screenshotLightbox');
  if (!modal) return;

  const img = modal.querySelector('#lightboxImg');
  const titleEl = modal.querySelector('#lightboxTitle');
  const captionEl = modal.querySelector('#lightboxCaption');

  if (img) img.src = src;
  if (titleEl) titleEl.textContent = title || '';
  if (captionEl) captionEl.textContent = caption || '';

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}
