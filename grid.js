// File: animations.js

document.addEventListener('DOMContentLoaded', () => {

  // Esegui lo script solo se siamo in visualizzazione mobile
  if (window.innerWidth > 767) {
    return;
  }

  const photoGrid = document.querySelector('.photo-grid');
  const projectTitleElement = document.getElementById('project-title-mobile');
  const projectLinkElement = document.getElementById('project-link-mobile');
  const items = document.querySelectorAll('.grid-item');

  // Se non ci sono gli elementi necessari, interrompi
  if (!photoGrid || !projectTitleElement || !projectLinkElement || items.length === 0) {
    return;
  }
  
  // Funzione per aggiornare il titolo e il link
  const updateInfo = (item) => {
    const title = item.dataset.title;
    const link = item.dataset.link;
    if (title && link) {
      projectTitleElement.textContent = title;
      projectLinkElement.href = link;
    }
  };

  // Imposta le informazioni del primo elemento al caricamento della pagina
  updateInfo(items[0]);

  // Usa un Intersection Observer per rilevare quale elemento è al centro
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // Se un elemento è per più del 70% visibile, significa che è quello centrato
      if (entry.isIntersecting) {
        updateInfo(entry.target);
      }
    });
  }, {
    root: photoGrid, // L'osservazione avviene all'interno del carosello
    threshold: 0.7 // Soglia di visibilità alta per beccare solo quello al centro
  });

  // Applica l'observer a ogni elemento del carosello
  items.forEach(item => {
    observer.observe(item);
  });
});