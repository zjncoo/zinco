document.addEventListener('DOMContentLoaded', () => {
  fetch('branding-data.json')
    .then(response => response.json())
    .then(data => {
      const container = document.getElementById('brandingGrid');

      // Logo section
      const logo = data.find(item => item.type === 'image' && item.subtype === 'logo');
      const logoHtml = logo
        ? `<div class="${logo.class}"><img src="${logo.src}" alt="Logo of ${logo.label}" class="branding-logo"></div>`
        : '';

      // Website link section
      const website = data.find(item => item.type === 'link' && item.label === 'Visit Website');
      const websiteHtml = website
        ? `<div class="branding-link"><a href="${website.url}" target="_blank">Visit Website ↗</a></div>`
        : '';

      // Color palette section
      const colorHtml = data
        .filter(item => item.type === 'color')
        .map(color => `
          <div class="${color.class}" style="background-color: ${color.label};">
            <span>${color.label}</span>
          </div>
        `).join('');

      // Text sections (e.g., Naming, Payoff, etc.)
      const getText = label =>
        data.find(item => item.type === 'text' && item.label === label)?.content || '';

      // HTML Structure generation
      const html = `
        <div class="branding-grid">
          <div class="branding-item">
            ${logoHtml}
            ${websiteHtml}
          </div>

          <div class="branding-item">
            <h3>Color Palette</h3>
            <div class="colors">${colorHtml}</div>
          </div>

          ${data.filter(item => item.type === 'typography').map(font => `
            <div class="branding-item">
              <h3>${font.label}</h3>
              <p>${font.content}</p>
            </div>
          `).join('')}

          ${data.filter(item => item.type === 'image' && item.subtype === 'graphic').map(graphic => `
            <div class="${graphic.class}">
              <img src="${graphic.src}" alt="${graphic.label}">
            </div>
          `).join('')}

          <div class="${getClass('Naming')}"><strong>Naming:</strong> ${getText('Naming')}</div>
          <div class="${getClass('Payoff')}"><strong>Payoff:</strong> ${getText('Payoff')}</div>
          <div class="${getClass('Valori')}"><strong>Values:</strong> ${getText('Valori')}</div>
          <div class="${getClass('Mission')}"><strong>Mission:</strong> ${getText('Mission')}</div>
          <div class="${getClass('Vision')}"><strong>Vision:</strong> ${getText('Vision')}</div>
          <div class="${getClass('Brand Essence')}"><strong>Brand Essence:</strong> ${getText('Brand Essence')}</div>
          <div class="${getClass('Brand Architecture')}"><strong>Architecture:</strong> ${getText('Brand Architecture')}</div>
        </div>
      `;

      container.innerHTML = html;
    })
    .catch(error => console.error('Error loading branding project:', error));
  });
  
  
  // COOKIE BANNER
  document.addEventListener('DOMContentLoaded', () => {
    const closeButton = document.getElementById('closeCookie');
    const banner = document.getElementById('cookieBanner');
  
    closeButton.addEventListener('click', () => {
      banner.style.display = 'none';
    });
  });
  
  
  // CURSORE PERSONALIZZATO
  document.addEventListener('DOMContentLoaded', () => {
    const closeButton = document.getElementById('closeCookie');
    const banner = document.getElementById('cookieBanner');
    closeButton.addEventListener('click', () => {
      banner.style.display = 'none';
    });
  
    const cursor = document.getElementById('cursor');
  
    document.addEventListener('mousemove', (e) => {
      cursor.style.top = `${e.clientY}px`;
      cursor.style.left = `${e.clientX}px`;
    });
  
    document.addEventListener('mouseover', (e) => {
      const isInteractive = e.target.closest('a, button, .clickable, [role="button"], [onclick]');
      if (isInteractive) {
        cursor.classList.add('cursor-hover');
      } else {
        cursor.classList.remove('cursor-hover');
      }
    });
  
    document.addEventListener('mouseout', () => {
      cursor.classList.remove('cursor-hover');
    });
  });
  
  
  // MENU TOGGLE
  const moreButton = document.getElementById("btnTopRight");
  const dropdownMenu = document.getElementById("dropdownMenu");
  
  function toggleMenu(e) {
    e.preventDefault();
    const isOpen = dropdownMenu.classList.contains("open");
  
    if (isOpen) {
      dropdownMenu.classList.remove("open");
      moreButton.textContent = "more";
      moreButton.classList.remove("open");
    } else {
      dropdownMenu.classList.add("open");
      moreButton.textContent = "close";
      moreButton.classList.add("open");
    }
  }
  
  function handleClickOutside(e) {
    const isClickInsideMenu = dropdownMenu.contains(e.target);
    const isClickOnButton = moreButton.contains(e.target);
  
    if (!isClickInsideMenu && !isClickOnButton && dropdownMenu.classList.contains("open")) {
      dropdownMenu.classList.remove("open");
      moreButton.textContent = "more";
      moreButton.classList.remove("open");
    }
  }
  
  moreButton.addEventListener("click", toggleMenu);
  document.addEventListener("click", handleClickOutside);
  
  
  // RANDOM PROJECT BUTTON
  document.getElementById('randomProjectButton').addEventListener('click', () => {
    const projectLinks = Array.from(document.querySelectorAll('.projects-section .project-grid a'));
    if (projectLinks.length === 0) return;
  
    const randomIndex = Math.floor(Math.random() * projectLinks.length);
    const randomHref = projectLinks[randomIndex].getAttribute('href');
  
    if (randomHref) {
      window.location.href = randomHref;
    }
  });

  //smooth scrolling
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
  smooth: true,
  direction: 'vertical',
  gestureDirection: 'vertical',
  smoothTouch: true,
  touchMultiplier: 2,
  infinite: false,
});

// Update on each frame
function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)