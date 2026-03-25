

document.addEventListener('DOMContentLoaded', () => {
  // Funzione per convertire i percorsi delle immagini in .webp
  const toWebp = (url) => {
    if (typeof url !== 'string') return '';
    // Sostituisce .jpg, .jpeg, o .png (case-insensitive) con .webp
    return url.replace(/\.(jpe?g|png)$/i, '.webp');
  };

  fetch('branding-data.json')
    .then(response => {
      if (!response.ok) throw new Error(`Errore nel caricamento: ${response.status}`);
      return response.json();
    })
    .then(data => {
      const heroTitle = document.getElementById('hero-title');
      const mainGrid = document.getElementById('brandingGrid');
      const glanceGrid = document.getElementById('glance-grid');

      const namingItem = data.find(item => item.label === 'naming');
      if (heroTitle && namingItem) {
        heroTitle.textContent = namingItem.content;
      }

      // --- PRIMO CICLO: COSTRUZIONE GRIGLIA PRINCIPALE (MODIFICATO) ---
      data.forEach((item, index) => {
        const uniqueId = `content-item-${index}`;

        // Se l'elemento è di tipo 'header', lo gestiamo separatamente
        if (item.type === 'header') {
          const headerItem = document.createElement('div');
          headerItem.classList.add('branding-header');
          headerItem.innerHTML = `<h2>${item.label}</h2>`;
          mainGrid.appendChild(headerItem);
        }
        // Per tutti gli altri elementi, creiamo un riquadro nella griglia
        else {
          let mainItem; // Dichiariamo la variabile qui

          // Se è il link a Figma, creiamo un tag <a>
          if (item.type === 'figma') {
            mainItem = document.createElement('a'); // <-- Elemento <a> cliccabile
            mainItem.href = item.embedUrl;
            mainItem.target = '_blank'; // Per aprire in una nuova scheda
            mainItem.rel = 'noopener noreferrer';
            mainItem.innerHTML = `<h3>${item.label}</h3><p>Open prototype →</p>`;
          }
          // Altrimenti, per immagini, colori, etc., creiamo un <div> come prima
          else {
            mainItem = document.createElement('div');
            if (item.type === 'color') {
              mainItem.style.backgroundColor = item.hex;
              mainItem.innerHTML = `<h3>${item.label || ''}</h3>`;
            } else if (item.type === 'image') {
              const title = document.createElement('h3');
              title.textContent = item.label;
              const img = document.createElement('img');
              img.src = toWebp(item.src);
              img.alt = item.label;
              img.loading = 'lazy';
              img.decoding = 'async';
              mainItem.append(title, img);
            } else if (item.type === 'text') {
              mainItem.innerHTML = `<h3>${item.label}</h3><p>${item.content}</p>`;
            }
          }

          // Aggiungiamo le classi comuni e l'ID a tutti i riquadri
          mainItem.id = uniqueId;
          mainItem.classList.add('branding-item', 'cursor-target');
          if (item.subtype === 'app-screenshot') {
            mainItem.classList.add('full-width-app');
          }

          mainGrid.appendChild(mainItem);
        }
      });

      // --- SECONDO CICLO: COSTRUZIONE GRIGLIA "AT A GLANCE" ---
      data.forEach((item, index) => {
        const isGraphical = item.type === 'image' || item.type === 'color' || item.type === 'figma';
        if (isGraphical) {
          const uniqueId = `content-item-${index}`;
          const glanceLink = document.createElement('a');
          glanceLink.href = `#${uniqueId}`;
          glanceLink.classList.add('glance-item', 'cursor-target');
          if (item.type === 'color') {
            glanceLink.style.backgroundColor = item.hex;
          } else if (item.type === 'image') {
            const thumbImg = document.createElement('img');
            thumbImg.src = toWebp(item.src);
            thumbImg.alt = `Anteprima di ${item.label}`;
            thumbImg.loading = 'lazy';
            thumbImg.decoding = 'async';
            glanceLink.appendChild(thumbImg);
          } else if (item.type === 'figma') {
            glanceLink.classList.add('glance-figma');
            glanceLink.innerHTML = '<span>Figma</span>';
          }
          glanceGrid.appendChild(glanceLink);
        }
      });

      // Gestione scroll con Lenis
      const allLinks = document.querySelectorAll('#glance-grid a, .scroll-down-arrow');
      allLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = link.getAttribute('href');
          if (targetId && typeof window.lenis !== 'undefined') {
            window.lenis.scrollTo(targetId, { duration: 2, offset: -20 });
          }
        });
      });
    })
    .catch(error => {
      console.error("Errore nel caricamento del progetto:", error);
    });
});
