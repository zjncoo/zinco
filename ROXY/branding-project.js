document.addEventListener('DOMContentLoaded', () => {
  
  // Carica i dati JSON e costruisce la pagina
  fetch('branding-data.json')
    .then(response => {
      if (!response.ok) throw new Error(`Errore nel caricamento: ${response.status}`);
      return response.json();
    })
    .then(data => {
      const heroTitle = document.getElementById('hero-title');
      const mainGrid = document.getElementById('brandingGrid');
      const figmaSection = document.getElementById('figma-container');
      const glanceGrid = document.getElementById('glance-grid');

      // Imposta il titolo principale
      const namingItem = data.find(item => item.label === 'Naming');
      if (heroTitle && namingItem) {
        heroTitle.textContent = namingItem.content;
      }
      
      // --- CREAZIONE GRIGLIA PRINCIPALE (MODIFICATA) ---
      data.forEach((item, index) => {
        const uniqueId = `content-item-${index}`;
        
        if (item.type === 'figma') {
          if (figmaSection) {
            figmaSection.id = uniqueId;
            figmaSection.innerHTML = `
              <div class="branding-header"><h2>${item.label}</h2></div>
              <div class="figma-embed-wrapper"><iframe src="${item.embedUrl}" allowfullscreen></iframe></div>`;
          }
        } else {
          // Crea l'elemento contenitore. Sarà un <div>.
          const itemContainer = document.createElement('div');
          itemContainer.id = uniqueId;

          // Se l'elemento ha una 'linkUrl' nel JSON, rendiamo l'intera card cliccabile
          if (item.linkUrl) {
            // Applichiamo la tecnica della card cliccabile
            itemContainer.classList.add('branding-item-container'); // Classe per position: relative
            
            // Crea il link che copre tutta la card
            const link = document.createElement('a');
            link.href = item.linkUrl;
            link.classList.add('card-link'); // Classe per position: absolute
            // Aggiungi target="_blank" se vuoi aprire in una nuova scheda
            // link.target = '_blank'; 
            itemContainer.appendChild(link);
          }

          // Crea il contenuto visibile della card (il div interno)
          const mainItemContent = document.createElement('div');

          if (item.type === 'header') {
            itemContainer.classList.add('branding-header');
            itemContainer.innerHTML = `<h2>${item.label}</h2>`;
          } else {
            mainItemContent.classList.add('branding-item', 'cursor-target');
            if (item.type === 'color') {
              mainItemContent.style.backgroundColor = item.hex;
              mainItemContent.innerHTML = `<h3>${item.label || ''}</h3>`;
            } else if (item.type === 'image') {
              mainItemContent.innerHTML = `<h3>${item.label}</h3><img src="${item.src}" alt="${item.label}" />`;
            } else if (item.type === 'text') {
              mainItemContent.innerHTML = `<h3>${item.label}</h3><p>${item.content}</p>`;
            }
            itemContainer.appendChild(mainItemContent);
          }
          mainGrid.appendChild(itemContainer);
        }
      });

      // --- CREAZIONE GRIGLIA "AT A GLANCE" (INVARIATA) ---
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
            glanceLink.innerHTML = `<img src="${item.src}" alt="Anteprima di ${item.label}" />`;
          } else if (item.type === 'figma') {
            glanceLink.classList.add('glance-figma');
            glanceLink.innerHTML = '<span>Figma</span>';
          }
          glanceGrid.appendChild(glanceLink);
        }
      });

      // --- GESTIONE CLICK PER SCORRIMENTO (INVARIATA) ---
      // Questo codice ora si applica solo ai link di navigazione interna
      const scrollLinks = document.querySelectorAll('#glance-grid a, .scroll-down-arrow');
      scrollLinks.forEach(link => {
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


// --- CONTROLLI VIDEO PERSONALIZZATI (INVARIATO) ---
const video = document.getElementById('myVideo');
const playPauseBtn = document.getElementById('playPauseBtn');
const muteBtn = document.getElementById('muteBtn');

if (video && playPauseBtn && muteBtn) {
  playPauseBtn.addEventListener('click', () => {
    video.paused ? video.play() : video.pause();
    playPauseBtn.textContent = video.paused ? 'Play' : 'Pause';
  });

  muteBtn.addEventListener('click', () => {
    video.muted = !video.muted;
    muteBtn.textContent = video.muted ? 'Unmute' : 'Mute';
  });

  playPauseBtn.textContent = 'Pause';
  muteBtn.textContent = 'Unmute';
}
