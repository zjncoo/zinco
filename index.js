// Preloader logic (MODIFIED)
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  
  if (preloader) {
    // A short delay for a smoother effect after the loading bar animation
    setTimeout(() => {
      preloader.classList.add('loaded');
    }, 500); 
    
    // The 'transitionend' event listener has been REMOVED. That's it!
  }
});

// Page Transition logic
document.addEventListener('DOMContentLoaded', () => {
  const preloader = document.getElementById('preloader');

  // Find all internal links
  const links = document.querySelectorAll('a[href^="/"], a[href^="."], a:not([href^="http"])');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      // Get the destination URL
      const destination = link.getAttribute('href');

      // Check if it's a new tab click or a non-navigational link
      if (link.target === '_blank' || e.ctrlKey || e.metaKey || destination.startsWith('#') || destination.startsWith('mailto:') || destination.startsWith('tel:')) {
        return; // Let the browser handle it normally
      }
      
      // If it's a same-page navigation, prevent default and trigger the animation
      e.preventDefault();

      // 1. Bring the preloader back down by removing the 'loaded' class
      if (preloader) {
        preloader.classList.remove('loaded');
      }

      // 2. Wait for the animation to finish, then navigate
      setTimeout(() => {
        window.location.href = destination;
      }, 800); // This duration should match your CSS transition time (0.8s)
    });
  });
});

// --- INIZIALIZZAZIONE GLOBALE DELLO SCROLL ---
// Assegnamo lenis all'oggetto 'window' per renderlo
// esplicitamente globale e accessibile da altri script.
window.lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
});

function raf(time) {
  // Assicurati che lenis esista prima di chiamare raf
  if (window.lenis) {
    window.lenis.raf(time);
  }
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);


document.addEventListener('DOMContentLoaded', () => {

  
  // --- CURSORE PERSONALIZZATO (versione fluida e performante) ---
  const cursor = document.getElementById('cursor');
  if (cursor) {
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    const speed = 0.3;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    const animateCursor = () => {
      const distX = mouseX - cursorX;
      const distY = mouseY - cursorY;
      cursorX += distX * speed;
      cursorY += distY * speed;
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
      requestAnimationFrame(animateCursor);
    };
    requestAnimationFrame(animateCursor);

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('a, button, .cursor-target, [role="button"], [onclick]')) {
        cursor.classList.add('cursor-hover');
      }
    });
    
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest('a, button, .cursor-target, [role="button"], [onclick]')) {
        cursor.classList.remove('cursor-hover');
      }
    });
  }

  // --- GESTIONE MENU ---
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
      if (!dropdownMenu.contains(e.target) && !moreButton.contains(e.target) && dropdownMenu.classList.contains("open")) {
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
    closeCookieButton.addEventListener('click', () => {
      cookieBanner.style.display = 'none';
    });
  }


});




//filtri foto 
document.addEventListener('DOMContentLoaded', function() {

  // Seleziona tutti i bottoni dei filtri e tutti gli elementi della griglia
  const filterButtons = document.querySelectorAll('.filter-btn');
  const gridItems = document.querySelectorAll('.grid-item');

  // Aggiunge un "click listener" a ogni bottone
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      
      // Rimuove la classe 'active' da tutti i bottoni
      filterButtons.forEach(btn => btn.classList.remove('active'));
      // Aggiunge la classe 'active' solo al bottone cliccato
      button.classList.add('active');

      // Ottiene il valore del filtro dal bottone cliccato (es. 'branding', 'web', 'all')
      const filter = button.getAttribute('data-filter');

      // Scorre ogni elemento della griglia
      gridItems.forEach(item => {
        // Controlla se l'elemento deve essere mostrato o nascosto
        if (filter === 'all' || item.getAttribute('data-category') === filter) {
          item.style.display = 'block'; // Mostra l'elemento
        } else {
          item.style.display = 'none';  // Nasconde l'elemento
        }
      });
    });
  });

});


