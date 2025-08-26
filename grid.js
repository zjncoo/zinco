// File: animations.js

// Aspetta che l'intero contenuto della pagina sia caricato prima di eseguire lo script.
document.addEventListener('DOMContentLoaded', () => {
  
  // Seleziona tutti gli elementi della griglia.
  const gridItems = document.querySelectorAll('.grid-item');

  // Se per qualche motivo non ci sono elementi, interrompi lo script.
  if (gridItems.length === 0) {
    console.log("Nessun elemento della griglia trovato da animare.");
    return;
  }

  // Imposta l'Intersection Observer, la tecnologia che rileva quando un elemento è visibile.
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      // Se l'elemento è entrato nello schermo...
      if (entry.isIntersecting) {
        // ...aggiungi la classe .is-visible per far partire l'animazione CSS.
        entry.target.classList.add('is-visible');
        // E smetti di osservarlo per non ripetere l'animazione.
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1 // L'animazione parte quando almeno il 10% dell'elemento è visibile.
  });

  // Applica l'observer a ogni elemento della griglia.
  gridItems.forEach(item => {
    observer.observe(item);
  });

});