// File: index.js (Versione Finale Completa con Database Esterno)

// --- LOGICA DI TRANSIZIONE TRA LE PAGINE ---
const setupPageTransitions = () => {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;
  const links = document.querySelectorAll('a:not([target="_blank"]):not([href^="#"]):not([href^="mailto:"]):not([href^="tel:"]):not(.search-result-link)');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const destination = link.getAttribute('href');
      if (destination) {
        e.preventDefault();
        preloader.classList.remove('loaded');
        setTimeout(() => { window.location.href = destination; }, 800);
      }
    });
  });
};

// --- LOGICA DEL PRELOADER ---
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(() => { preloader.classList.add('loaded'); }, 500);
  }
});

// --- INIZIALIZZAZIONE DELLO SCROLL FLUIDO (Lenis) ---
const lenis = new Lenis();
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

// --- EVENT LISTENER PRINCIPALE ---
document.addEventListener('DOMContentLoaded', () => {
  setupPageTransitions();

  // --- CURSORE PERSONALIZZATO ---
  const cursor = document.getElementById('cursor');
  if (cursor) {
    let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
    const speed = 0.3;
    document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
    const animateCursor = () => {
      const distX = mouseX - cursorX; const distY = mouseY - cursorY;
      cursorX += distX * speed; cursorY += distY * speed;
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
      requestAnimationFrame(animateCursor);
    };
    requestAnimationFrame(animateCursor);
    document.addEventListener('mouseover', (e) => { if (e.target.closest('a, button, .cursor-target')) cursor.classList.add('cursor-hover'); });
    document.addEventListener('mouseout', (e) => { if (e.target.closest('a, button, .cursor-target')) cursor.classList.remove('cursor-hover'); });
  }

  // --- GESTIONE MENU A TENDINA ---
  const moreButton = document.getElementById("btnTopRight");
  const dropdownMenu = document.getElementById("dropdownMenu");
  if (moreButton && dropdownMenu) {
    const toggleMenu = (e) => {
      e.preventDefault();
      const isOpen = dropdownMenu.classList.toggle("open");
      moreButton.textContent = isOpen ? "close" : "more";
      moreButton.classList.toggle("open");
    };
    const handleClickOutside = (e) => {
        if (dropdownMenu.classList.contains("open") && !dropdownMenu.contains(e.target) && !moreButton.contains(e.target)) {
            toggleMenu(e);
        }
    };
    moreButton.addEventListener("click", toggleMenu);
    document.addEventListener("click", handleClickOutside);
  }

  // --- GESTIONE COOKIE BANNER ---
  const closeCookieButton = document.getElementById('closeCookie');
  const cookieBanner = document.getElementById('cookieBanner');
  if (closeCookieButton && cookieBanner) {
    closeCookieButton.addEventListener('click', () => { cookieBanner.style.display = 'none'; });
  }

  // --- LOGICA COMPLETA PER RICERCA, FILTRI E SURPRISE ME ---
  const allProjects = typeof allProjectsData !== 'undefined' ? allProjectsData : [];
  const searchButton = document.getElementById('search-button');
  const searchOverlay = document.getElementById('search-overlay');
  const searchBar = document.getElementById('search-bar');
  const closeSearchButton = document.getElementById('closeSearch');
  const searchInput = document.getElementById('search-input');
  const suggestionsList = document.getElementById('search-suggestions');
  const filterSelectBtn = document.getElementById('category-select');
  const filterOptionsContainer = document.getElementById('category-select-options');
  const filterOptions = document.querySelectorAll('.filter-option');
  let currentFilter = 'all';

  const tolerantSearch = (query, text) => {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    let textIndex = 0;
    for (let i = 0; i < lowerQuery.length; i++) {
      const char = lowerQuery[i];
      const foundIndex = lowerText.indexOf(char, textIndex);
      if (foundIndex === -1) { return false; }
      textIndex = foundIndex + 1;
    }
    return true;
  };

  const displayFilteredProjects = () => {
    if (!suggestionsList || !searchInput) return;
    const query = searchInput.value.trim();
    const filteredByCategory = allProjects.filter(p => currentFilter === 'all' || p.category.includes(currentFilter));
    const finalResults = query ? filteredByCategory.filter(p => tolerantSearch(query, p.title)) : filteredByCategory;
    suggestionsList.innerHTML = '';
    if (finalResults.length > 0) {
      finalResults.forEach(p => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = p.link; a.textContent = p.title; a.classList.add('search-result-link');
        li.appendChild(a); suggestionsList.appendChild(li);
      });
    } else {
      const li = document.createElement('li');
      li.textContent = 'Nessun progetto trovato.';
      li.style.pointerEvents = 'none';
      suggestionsList.appendChild(li);
    }
  };

  if (searchButton && searchOverlay && searchBar) {
    const openSearch = () => {
      displayFilteredProjects();
      searchOverlay.classList.remove('hidden');
      searchBar.classList.remove('hidden');
      document.body.classList.add('search-is-active');
      searchInput.focus();
    };
    const closeSearch = () => {
      searchOverlay.classList.add('hidden');
      searchBar.classList.add('hidden');
      document.body.classList.remove('search-is-active');
    };
    searchButton.addEventListener('click', openSearch);
    closeSearchButton.addEventListener('click', closeSearch);
    searchOverlay.addEventListener('click', (e) => { if (e.target === searchOverlay) closeSearch(); });
    searchInput.addEventListener('input', displayFilteredProjects);
    filterSelectBtn.addEventListener('click', (e) => { e.stopPropagation(); filterOptionsContainer.classList.toggle('show'); });
    document.addEventListener('click', () => { filterOptionsContainer.classList.remove('show'); });
    filterOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        currentFilter = e.target.dataset.filter;
        if (filterSelectBtn.querySelector('span')) {
            filterSelectBtn.querySelector('span').textContent = e.target.textContent;
        }
        displayFilteredProjects();
      });
    });
  }

  const randomProjectButton = document.getElementById('randomProjectButton');
  if (randomProjectButton) {
    randomProjectButton.addEventListener('click', () => {
      if (allProjects.length > 0) {
        const randomIndex = Math.floor(Math.random() * allProjects.length);
        const randomUrl = allProjects[randomIndex].link;
        const preloader = document.getElementById('preloader');
        if (preloader) preloader.classList.remove('loaded');
        setTimeout(() => { window.location.href = randomUrl; }, 800);
      }
    });
  }

  // --- GESTIONE TITOLO CAROSELLO MOBILE ---
  if (window.innerWidth <= 767) {
    const photoGrid = document.querySelector('.photo-grid');
    const projectTitleElement = document.getElementById('project-title-mobile');
    const projectLinkElement = document.getElementById('project-link-mobile');
    const items = document.querySelectorAll('.grid-item');
    if (photoGrid && projectTitleElement && projectLinkElement && items.length > 0) {
      const updateInfo = (item) => {
        const title = item.dataset.title; const link = item.dataset.link;
        if (title && link) { projectTitleElement.textContent = title; projectLinkElement.href = link; }
      };
      updateInfo(items[0]);
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) updateInfo(entry.target); });
      }, { root: photoGrid, threshold: 0.7 });
      items.forEach(item => { observer.observe(item); });
    }
  }
});