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

      const namingItem = data.find(item => item.label === 'Naming');
      if (heroTitle && namingItem) {
        heroTitle.textContent = namingItem.content;
      }
      
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
          const mainItem = document.createElement('div');
          mainItem.id = uniqueId;
          if (item.type === 'header') {
            mainItem.classList.add('branding-header');
            mainItem.innerHTML = `<h2>${item.label}</h2>`;
          } else {
            mainItem.classList.add('branding-item', 'cursor-target');

            // --- MODIFICA CHIAVE ---
            // Aggiunge una classe speciale se l'item è una foto dell'app
            if (item.subtype === 'app-screenshot') {
              mainItem.classList.add('full-width-app');
            }
            
            if (item.type === 'color') {
              mainItem.style.backgroundColor = item.hex;
              mainItem.innerHTML = `<h3>${item.label || ''}</h3>`;
            } else if (item.type === 'image') {
              mainItem.innerHTML = `<h3>${item.label}</h3><img src="${item.src}" alt="${item.label}" />`;
            } else if (item.type === 'text') {
              mainItem.innerHTML = `<h3>${item.label}</h3><p>${item.content}</p>`;
            }
          }
          mainGrid.appendChild(mainItem);
        }
      });

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

      // Aggiunge gli event listener per lo scorrimento
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


// --- CONTROLLI VIDEO PERSONALIZZATI ---
const video = document.getElementById('myVideo');
const playPauseBtn = document.getElementById('playPauseBtn');
const muteBtn = document.getElementById('muteBtn');

if (video && playPauseBtn && muteBtn) {
  // Logica per il bottone Play/Pausa
  playPauseBtn.addEventListener('click', () => {
    if (video.paused) {
      video.play();
      playPauseBtn.textContent = 'Pause';
    } else {
      video.pause();
      playPauseBtn.textContent = 'Play';
    }
  });

  // Logica per il bottone Mute/Unmute
  muteBtn.addEventListener('click', () => {
    video.muted = !video.muted;
    muteBtn.textContent = video.muted ? 'Unmute' : 'Mute';
  });

  // Assicura che il testo del bottone sia corretto al caricamento
  playPauseBtn.textContent = 'Pause';
  muteBtn.textContent = 'Unmute';
}