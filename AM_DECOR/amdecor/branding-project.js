document.addEventListener('DOMContentLoaded', () => {
    fetch('project-data.json')
      .then(response => response.json())
      .then(data => {
        const container = document.getElementById('brandingGrid');
  
        // Trova il logo
        const logo = data.find(item => item.type === 'image' && item.subtype === 'logo');
        const logoHtml = logo
          ? `<img src="${logo.src}" alt="Logo of ${logo.label}" class="branding-logo">`
          : '';
  
        // Trova il link al sito
        const website = data.find(item => item.type === 'link' && item.label === 'Visit Website');
        const websiteHtml = website
          ? `<a href="${website.url}" class="button-link" target="_blank">Visit Website ↗</a>`
          : '';
  
        // Colori
        const colorHtml = data
          .filter(item => item.type === 'color')
          .map(color => `
            <div class="color-swatch ${color.class}" style="background-color: ${color.label};">
              <span>${color.label}</span>
            </div>
          `).join('');
  
        // Helper per i testi
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