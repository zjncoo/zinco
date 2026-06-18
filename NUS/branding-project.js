

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
            const isFigmaUrl = item.embedUrl && item.embedUrl.includes('figma.com');
            const ctaText = isFigmaUrl ? 'Open prototype →' : 'Visit website →';
            mainItem.innerHTML = `<h3>${item.label}</h3><p>${ctaText}</p>`;
          }
          // Se è un link esterno generico
          else if (item.type === 'link') {
            mainItem = document.createElement('a');
            mainItem.href = item.href;
            mainItem.target = '_blank';
            mainItem.rel = 'noopener noreferrer';
            mainItem.innerHTML = `<h3>${item.label}</h3>${item.description ? `<p>${item.description}</p>` : ''}<p class="link-cta">View publication →</p>`;
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
        const isGraphical = item.type === 'image' || item.type === 'color' || item.type === 'figma' || item.type === 'link';
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
            const isFigmaUrl = item.embedUrl && item.embedUrl.includes('figma.com');
            glanceLink.innerHTML = `<span>${isFigmaUrl ? 'Figma' : 'Website'}</span>`;
          } else if (item.type === 'link') {
            glanceLink.classList.add('glance-figma');
            glanceLink.innerHTML = `<span>${item.label}</span>`;
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

      // --- DESCRIZIONE COLLASSABILE ---
      const descriptionText = document.querySelector('.project-info-text');
      if (descriptionText) {
        const paragraphs = Array.from(descriptionText.querySelectorAll('p'));
        // Nascondi tutti i paragrafi eccetto il primo
        const extraParagraphs = paragraphs.slice(1);
        if (extraParagraphs.length > 0) {
          extraParagraphs.forEach(p => p.classList.add('description-hidden'));

          // Crea il bottone "more"
          const moreBtn = document.createElement('button');
          moreBtn.classList.add('description-more-btn', 'cursor-target');
          moreBtn.innerHTML = 'more <span class="btn-arrow">↓</span>';

          // Inserisce il bottone dopo il primo paragrafo
          paragraphs[0].after(moreBtn);

          moreBtn.addEventListener('click', () => {
            const isExpanded = descriptionText.classList.toggle('expanded');
            moreBtn.classList.toggle('open', isExpanded);
            moreBtn.innerHTML = isExpanded
              ? 'less <span class="btn-arrow">↓</span>'
              : 'more <span class="btn-arrow">↓</span>';
          });
        }
      }
    })
    .catch(error => {
      console.error("Errore nel caricamento del progetto:", error);
    });
});
