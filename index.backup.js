// File: index.js (Versione Finale Completa con Database Esterno)

// --- LOGICA DI TRANSIZIONE TRA LE PAGINE ---
const setupPageTransitions = () => {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;
  const links = document.querySelectorAll('a:not([target="_blank"]):not([href^="#"]):not([download]):not([href^="mailto:"]):not([href^="tel:"]):not(.search-result-link)');
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

// --- LOGICA DEL PRELOADER (OTTIMIZZATA PER VELOCITÀ) ---

const hidePreloader = () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    // Un piccolo timeout per assicurarsi che il primo rendering della pagina sia completo
    setTimeout(() => {
      preloader.classList.add('loaded');
    }, 100);
  }
};

// MODIFICA CHIAVE: Usa 'DOMContentLoaded' invece di 'load'.
// Si attiva non appena la struttura HTML è pronta, senza aspettare le immagini.
document.addEventListener('DOMContentLoaded', hidePreloader);

// Questo gestisce il tasto "indietro" del browser, lascialo così com'è.
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    hidePreloader();
  }
});

// --- INIZIALIZZAZIONE DELLO SCROLL FLUIDO (Lenis) ---
const lenis = new Lenis();
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
// Aggiungi questa riga per rendere lenis accessibile a tutti gli altri script
window.lenis = lenis;
// --- CONTROLLO VIDEO GRIGLIA (play solo se visibile) ---
// Evita che 6 video girino in loop contemporaneamente causando lag.
// Ogni video parte solo quando entra nel viewport e si ferma quando esce.
const setupGridVideos = () => {
  const gridVideos = document.querySelectorAll('video.grid-video');
  if (!gridVideos.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.1 });

  gridVideos.forEach(video => observer.observe(video));
};

setupGridVideos();




// --- SCROLL TO HASH ALL'ARRIVO SULLA PAGINA ---
// Gestisce URL tipo: index.html#branding, index.html#contact-footer, ecc.
const scrollToHashOnLoad = () => {
  const hash = window.location.hash;
  if (!hash || hash === '#') return;
  // Aspetta che il preloader finisca (max ~1.2s) poi scrolla
  const doScroll = () => {
    try {
      if (hash === '#contact-footer') {
        // Il footer è position:fixed, non ha offsetTop utile.
        // Scrolliamo al massimo valore possibile, che rivela il footer dall'inizio.
        const maxScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        if (window.lenis) {
          window.lenis.scrollTo(maxScroll, { duration: 1.2, force: true });
        } else {
          window.scrollTo({ top: maxScroll, behavior: 'smooth' });
        }
      } else {
        const target = document.querySelector(hash);
        if (target) {
          if (window.lenis) {
            window.lenis.scrollTo(target, { offset: 0, duration: 1.2, force: true });
          } else {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
    } catch (err) { /* selettore non valido, ignora */ }
  };
  // Prima cerca di scrollare dopo il preloader (~300ms), poi un secondo tentativo di sicurezza
  setTimeout(doScroll, 350);
  setTimeout(doScroll, 900);
};

// --- NUOVA FUNZIONE PER LA PROTEZIONE DEI CONTENUTI ---
const setupContentProtection = () => {
  // 1. Disabilita il menu del click destro
  document.addEventListener('contextmenu', event => {
    event.preventDefault();
    console.log("Right-click is disabled to protect content."); // Messaggio opzionale per la console
  });

  // 2. Disabilita il trascinamento di tutte le immagini
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('dragstart', event => event.preventDefault());
  });

  // 3. Disabilita le scorciatoie da tastiera comuni per salvare/copiare
  document.addEventListener('keydown', event => {
    // Blocca Ctrl+S (Salva) e Cmd+S su Mac
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
    }
    // Blocca Ctrl+C (Copia) e Cmd+C su Mac
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
      event.preventDefault();
    }
    // Blocca Ctrl+U (Visualizza sorgente) e Cmd+U su Mac
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'u') {
      event.preventDefault();
    }
  });
};

// --- EVENT LISTENER PRINCIPALE ---
document.addEventListener('DOMContentLoaded', () => {
  setupPageTransitions();
  setupContentProtection();
  scrollToHashOnLoad();

  // --- CURSORE PERSONALIZZATO (ottimizzato: RAF si ferma quando il mouse è fermo) ---
  const cursor = document.getElementById('cursor');
  if (cursor) {
    let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
    let cursorRAF = null;
    let cursorDirty = false;
    const speed = 0.3;
    const animateCursor = () => {
      const distX = mouseX - cursorX;
      const distY = mouseY - cursorY;
      cursorX += distX * speed;
      cursorY += distY * speed;
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
      // Continua il loop solo se c'è ancora movimento percettibile
      if (Math.abs(distX) > 0.1 || Math.abs(distY) > 0.1) {
        cursorRAF = requestAnimationFrame(animateCursor);
      } else {
        cursorRAF = null; // Ferma il loop
        cursorDirty = false;
      }
    };
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Riavvia il loop RAF solo se non è già in esecuzione
      if (!cursorDirty) {
        cursorDirty = true;
        cursorRAF = requestAnimationFrame(animateCursor);
      }
    }, { passive: true });
    document.addEventListener('mouseover', (e) => { if (e.target.closest('a, button, .cursor-target')) cursor.classList.add('cursor-hover'); }, { passive: true });
    document.addEventListener('mouseout', (e) => { if (e.target.closest('a, button, .cursor-target')) cursor.classList.remove('cursor-hover'); }, { passive: true });
  }

  // --- GESTIONE MENU A TENDINA ---
  const moreButton = document.getElementById("btnTopRight");
  const dropdownMenu = document.getElementById("dropdownMenu");
  if (moreButton && dropdownMenu) {
    const toggleMenu = (e) => {
      e.preventDefault();
      const isOpen = dropdownMenu.classList.toggle("open");
      const navTop = document.getElementById("navTop");
      if (navTop) navTop.classList.toggle("open", isOpen);
      moreButton.textContent = isOpen ? "close" : "menu";
      moreButton.classList.toggle("open", isOpen);
    };
    const handleClickOutside = (e) => {
      if (dropdownMenu.classList.contains("open") && !dropdownMenu.contains(e.target) && !moreButton.contains(e.target)) {
        toggleMenu(e);
      }
    };
    moreButton.addEventListener("click", toggleMenu);
    document.addEventListener("click", handleClickOutside);
  }

  // --- GESTIONE SMOOTH SCROLL ANCORE ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || !targetId.startsWith('#') || targetId === '#') return;

      try {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();

          // Chiudi il menu a tendina se aperto
          if (dropdownMenu && dropdownMenu.classList.contains("open")) {
            dropdownMenu.classList.remove("open");
            const navTop = document.getElementById("navTop");
            if (navTop) navTop.classList.remove("open");
            if (moreButton) {
              moreButton.textContent = "menu";
              moreButton.classList.remove("open");
            }
          }

          // // Fallback/Delay: Attendiamo chiusura menu
          setTimeout(() => {
            if (targetId === '#contact-footer') {
              // Il footer è position:fixed — scrolliamo al massimo scroll possibile,
              // che corrisponde esattamente alla cima del footer rivelato.
              const maxScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight;
              if (window.lenis) {
                window.lenis.scrollTo(maxScroll, { duration: 1.2, force: true });
              } else {
                window.scrollTo({ top: maxScroll, behavior: 'smooth' });
              }
            } else {
              if (window.lenis) {
                window.lenis.scrollTo(targetElement, { offset: 0, duration: 1.2, force: true });
              } else {
                targetElement.scrollIntoView({ behavior: 'smooth' });
              }
            }
          }, 150);
        }
      } catch (err) {
        // Ignora errori di selettore se targetId non è valido
      }
    });
  });

  // --- GESTIONE COOKIE BANNER ---
  const closeCookieButton = document.getElementById('closeCookie');
  const cookieBanner = document.getElementById('cookieBanner');
  if (closeCookieButton && cookieBanner) {
    closeCookieButton.addEventListener('click', () => { cookieBanner.style.display = 'none'; });
  }

  // --- LOGICA COMPLETA PER RICERCA, FILTRI E SURPRISE ME ---
  const allProjects = typeof allProjectsData !== 'undefined' ? allProjectsData : [];
  const searchBarContainer = document.getElementById('search-bar-container');
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

      // Determine path prefix based on logo href (robust way to handle depth)
      const logo = document.getElementById('logo');
      let pathPrefix = '';
      if (logo) {
        const logoHref = logo.getAttribute('href');
        if (logoHref.startsWith('../../')) pathPrefix = '../../';
        else if (logoHref.startsWith('../')) pathPrefix = '../';
      }

      finalResults.forEach(p => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        // Handle external links vs local links
        if (p.link.startsWith('http')) {
          a.href = p.link;
          a.target = "_blank"; // Good practice for external links
        } else {
          a.href = pathPrefix + p.link;
        }
        a.textContent = p.title; a.classList.add('search-result-link');
        li.appendChild(a); suggestionsList.appendChild(li);
      });
    } else {
      const li = document.createElement('li');
      li.textContent = 'Nessun progetto trovato.';
      li.style.pointerEvents = 'none';
      suggestionsList.appendChild(li);
    }
  };

  if (searchBarContainer && searchInput) {
    const dropdownMenu = document.getElementById('dropdownMenu'); // get dropdown to add class

    const closeSearch = () => {
      suggestionsList.innerHTML = '';
      suggestionsList.classList.remove('active');
      if (dropdownMenu) dropdownMenu.classList.remove('search-is-active');
    };

    searchInput.addEventListener('input', () => {
      displayFilteredProjects();
      if (searchInput.value.trim() !== '') {
        suggestionsList.classList.add('active');
        if (dropdownMenu) dropdownMenu.classList.add('search-is-active');
      } else {
        closeSearch();
      }
    });

    // Close suggestions if clicked outside the search bar container
    document.addEventListener('click', (e) => {
      if (!searchBarContainer.contains(e.target)) {
        closeSearch();
      }
    });

    if (filterSelectBtn && filterOptionsContainer) {
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
  }

  const randomProjectButton = document.getElementById('randomProjectButton');
  if (randomProjectButton) {
    randomProjectButton.addEventListener('click', () => {
      if (allProjects.length > 0) {
        const randomIndex = Math.floor(Math.random() * allProjects.length);
        let randomUrl = allProjects[randomIndex].link;
        
        // Handle path prefix for internal links
        if (!randomUrl.startsWith('http')) {
          const logo = document.getElementById('logo');
          let pathPrefix = '';
          if (logo) {
            const logoHref = logo.getAttribute('href');
            if (logoHref && logoHref.startsWith('../../')) pathPrefix = '../../';
            else if (logoHref && logoHref.startsWith('../')) pathPrefix = '../';
          }
          randomUrl = pathPrefix + randomUrl;
        }

        const preloader = document.getElementById('preloader');
        if (preloader) preloader.classList.remove('loaded');
        setTimeout(() => { window.location.href = randomUrl; }, 800);
      }
    });
  }

  // --- GESTIONE BARRA AVANZAMENTO LETTURA (ottimizzata: RAF throttle) ---
  const progressBar = document.getElementById('scroll-progress-bar');
  if (progressBar) {
    let progressRAF = null;
    const updateProgressBar = () => {
      progressRAF = null; // Reset flag
      const scrollTotal = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercentage = scrollTotal > 0 ? (window.scrollY / scrollTotal) * 100 : 0;
      progressBar.style.width = scrollPercentage + '%';
    };
    // passive: true permette al browser di ottimizzare lo scroll senza aspettare il listener
    window.addEventListener('scroll', () => {
      if (!progressRAF) {
        progressRAF = requestAnimationFrame(updateProgressBar);
      }
    }, { passive: true });
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

  // --- REVEAL FOOTER LOGIC ---
  const siteMain = document.querySelector('.site-main-content');
  const revealFooter = document.querySelector('.reveal-footer');

  if (siteMain && revealFooter) {
    const updateFooterMargin = () => {
      // Get the height of the footer
      const footerHeight = revealFooter.offsetHeight;
      // Set the margin-bottom of the main content so the scroll goes far enough
      siteMain.style.marginBottom = `${footerHeight}px`;
    };

    // Calculate on load
    updateFooterMargin();

    // Recalculate on window resize
    window.addEventListener('resize', updateFooterMargin);

    // Fallback recalculation after a short delay (for dynamic image loading)
    setTimeout(updateFooterMargin, 500);
    setTimeout(updateFooterMargin, 1500);

    // Sometimes images load later and change footer height, so observe footer resizes
    if (window.ResizeObserver) {
      new ResizeObserver(updateFooterMargin).observe(revealFooter);

      // Also observe changes in siteMain to adjust if dynamic content is loaded (e.g. from JS)
      new ResizeObserver(updateFooterMargin).observe(siteMain);
    }

    // Hide fixed elements when footer is visible
    const footerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          document.body.classList.add('footer-visible');
        } else {
          document.body.classList.remove('footer-visible');
        }
      });
    }, {
      root: null,
      threshold: 0.1 // Trigger when at least 10% of footer is visible
    });

    footerObserver.observe(revealFooter);
  }

  // --- GESTIONE INVIO FORM CONTATTI (FETCH) ---
  const contactForm = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const successMessage = document.getElementById('successMessage');
  const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
  const btnLoader = submitBtn ? submitBtn.querySelector('.btn-loader') : null;

  if (contactForm && submitBtn) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Mostra loader
      if (btnText) btnText.style.display = 'none';
      if (btnLoader) btnLoader.style.display = 'inline-block';
      submitBtn.disabled = true;
      successMessage.style.display = 'none';

      const formData = new FormData(contactForm);
      const googleFormUrl = "https://docs.google.com/forms/u/0/d/e/1FAIpQLSdosHY4D0PIyXIjul20uFgBnjrAHutvH6bL4CPC4MuIQFfwbQ/formResponse";

      fetch(googleFormUrl, {
        method: "POST",
        mode: "no-cors",
        body: formData
      })
        .then(() => {
          // Successo
          contactForm.reset();
          successMessage.style.display = 'block';
        })
        .catch((error) => {
          console.error("Error submitting form", error);
          alert("There was an error sending your message. Please try again or email directly.");
        })
        .finally(() => {
          // Ripristina bottone
          if (btnText) btnText.style.display = 'inline-block';
          if (btnLoader) btnLoader.style.display = 'none';
          submitBtn.disabled = false;

          // Nascondi messaggio dopo 5 secondi
          setTimeout(() => {
            successMessage.style.display = 'none';
          }, 5000);
        });
    });
  }

  // --- PROJECT LINE HOVER PREVIEW (replaces cursor) ---
  const projectLines = document.querySelectorAll('.project-line[data-hover-images]');
  if (projectLines.length > 0) {
    // Create the preview element once
    const preview = document.createElement('div');
    preview.classList.add('project-line-preview');
    const previewImg = document.createElement('img');
    preview.appendChild(previewImg);
    document.body.appendChild(preview);

    projectLines.forEach(line => {
      let images;
      try { images = JSON.parse(line.dataset.hoverImages); } catch (e) { images = []; }
      if (!images.length) return;

      line.addEventListener('mouseenter', () => {
        // Usa sempre la prima immagine fornita
        const src = images[0];
        previewImg.src = src;
        preview.classList.add('visible');
        // Hide the custom cursor while hovering
        if (cursor) cursor.style.display = 'none';
      });

      line.addEventListener('mousemove', (e) => {
        // Position preview centered on cursor (replacing it)
        const x = e.clientX;
        const y = e.clientY;
        const pw = preview.offsetWidth || 220;
        const ph = preview.offsetHeight || 160;
        let left = x - pw / 2;
        let top = y - ph / 2;
        // Keep within viewport
        left = Math.max(4, Math.min(left, window.innerWidth - pw - 4));
        top = Math.max(4, Math.min(top, window.innerHeight - ph - 4));
        preview.style.left = left + 'px';
        preview.style.top = top + 'px';
      });

      line.addEventListener('mouseleave', () => {
        preview.classList.remove('visible');
        // Restore the custom cursor
        if (cursor) cursor.style.display = '';
      });
    });
  }
});
