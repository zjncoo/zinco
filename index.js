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