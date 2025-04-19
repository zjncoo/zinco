document.addEventListener('DOMContentLoaded', () => {
  // Branding data
  fetch('project-data.json')
    .then(response => response.json())
    .then(data => {
      const container = document.getElementById('brandingGrid');

      const logo = data.find(item => item.type === 'image' && item.subtype === 'logo');
      const logoHtml = logo ? `<img src="${logo.src}" alt="Logo of ${logo.label}" class="branding-logo">` : '';

      const website = data.find(item => item.type === 'link' && item.label === 'Visit Website');
      const websiteHtml = website ? `<a href="${website.url}" class="button-link" target="_blank">Visit Website ↗</a>` : '';

      const colorHtml = data
        .filter(item => item.type === 'color')
        .map(color => `
          <div class="color-swatch ${color.class}" style="background-color: ${color.label};">
            <span>${color.label}</span>
          </div>
        `).join('');

      const getText = label =>
        data.find(item => item.type === 'text' && item.label === label)?.content || '';

      const html = `
        <div class="branding-grid">
          <div class="logo-box">
            ${logoHtml}
            ${websiteHtml}
          </div>

          <div class="color-box">
            <h3>Color Palette</h3>
            <div class="colors">${colorHtml}</div>
          </div>

          <div class="info-box"><strong>Naming:</strong> ${getText('Naming')}</div>
          <div class="info-box"><strong>Payoff:</strong> ${getText('Payoff')}</div>
          <div class="info-box"><strong>Values:</strong> ${getText('Valori')}</div>
          <div class="info-box"><strong>Mission:</strong> ${getText('Mission')}</div>
          <div class="info-box"><strong>Vision:</strong> ${getText('Vision')}</div>
          <div class="info-box"><strong>Brand Essence:</strong> ${getText('Brand Essence')}</div>
          <div class="info-box"><strong>Architecture:</strong> ${getText('Brand Architecture')}</div>
        </div>
      `;

      container.innerHTML = html;
    })
    .catch(error => console.error('Error loading branding project:', error));

  // PDF.js Viewer
  const pdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
  let pdfDoc = null, currentPage = 1, totalPages = 0, pageRendering = false;
  const canvas = document.getElementById('pdf-canvas');
  const ctx = canvas?.getContext('2d');

  if (canvas && window.pdfjsLib) {
    pdfjsLib.getDocument(pdfUrl).promise.then((doc) => {
      pdfDoc = doc;
      totalPages = pdfDoc.numPages;
      document.getElementById('total-pages').textContent = totalPages;
      renderPage(currentPage);
    });

    function renderPage(pageNumber) {
      pageRendering = true;
      pdfDoc.getPage(pageNumber).then((page) => {
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport
        };

        page.render(renderContext).promise.then(() => {
          pageRendering = false;
        });

        document.getElementById('current-page').textContent = pageNumber;
      });
    }

    document.getElementById('prev-page')?.addEventListener('click', () => {
      if (currentPage <= 1 || pageRendering) return;
      currentPage--;
      renderPage(currentPage);
    });

    document.getElementById('next-page')?.addEventListener('click', () => {
      if (currentPage >= totalPages || pageRendering) return;
      currentPage++;
      renderPage(currentPage);
    });
  }

  // Cookie banner
  const closeButton = document.getElementById('closeCookie');
  const banner = document.getElementById('cookieBanner');
  if (closeButton && banner) {
    closeButton.addEventListener('click', () => {
      banner.style.display = 'none';
    });
  }

  // Custom cursor
  const cursor = document.getElementById('cursor');
  if (cursor) {
    document.addEventListener('mousemove', (e) => {
      cursor.style.top = `${e.clientY}px`;
      cursor.style.left = `${e.clientX}px`;
    });

    document.addEventListener('mouseover', (e) => {
      const isInteractive = e.target.closest('a, button, .clickable, [role="button"], [onclick]');
      cursor.classList.toggle('cursor-hover', Boolean(isInteractive));
    });

    document.addEventListener('mouseout', () => {
      cursor.classList.remove('cursor-hover');
    });
  }

  // Random project button
  const randomBtn = document.getElementById('randomProjectButton');
  if (randomBtn) {
    randomBtn.addEventListener('click', () => {
      const projectLinks = Array.from(document.querySelectorAll('.projects-section .project-grid a'));
      if (projectLinks.length === 0) return;

      const randomIndex = Math.floor(Math.random() * projectLinks.length);
      const randomHref = projectLinks[randomIndex].getAttribute('href');
      if (randomHref) window.location.href = randomHref;
    });
  }
});

// Menu toggle (non ha bisogno di DOMContentLoaded)
const moreButton = document.getElementById("btnTopRight");
const dropdownMenu = document.getElementById("dropdownMenu");

if (moreButton && dropdownMenu) {
  moreButton.addEventListener("click", (e) => {
    e.preventDefault();
    const isOpen = dropdownMenu.classList.contains("open");
    dropdownMenu.classList.toggle("open", !isOpen);
    moreButton.textContent = isOpen ? "more" : "close";
    moreButton.classList.toggle("open", !isOpen);
  });

  document.addEventListener("click", (e) => {
    const isClickInsideMenu = dropdownMenu.contains(e.target);
    const isClickOnButton = moreButton.contains(e.target);

    if (!isClickInsideMenu && !isClickOnButton && dropdownMenu.classList.contains("open")) {
      dropdownMenu.classList.remove("open");
      moreButton.textContent = "more";
      moreButton.classList.remove("open");
    }
  });
}

// Lenis smooth scrolling
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
  direction: 'vertical',
  gestureDirection: 'vertical',
  smoothTouch: true,
  touchMultiplier: 2,
  infinite: false,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

