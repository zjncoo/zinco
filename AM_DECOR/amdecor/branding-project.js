document.addEventListener('DOMContentLoaded', () => {
    fetch('project-data.json') // <-- se è in una cartella tipo /data, scrivi 'data/project-data.json'
      .then(response => response.json())
      .then(data => {
        const container = document.getElementById('brandingProject');
  
        data.forEach(project => {
          const html = `
            <div class="branding-grid">
              <div class="logo-box">
                <img src="${project.logo}" alt="Logo of ${project.brandName}">
                <a href="${project.websiteLink}" class="button-link" target="_blank">Visit Website</a>
              </div>
  
              <div class="typography-box">
                <h3>Typography</h3>
                <ul>${project.typography.map(font => `<li>${font}</li>`).join('')}</ul>
              </div>
  
              <div class="color-box">
                <h3>Color Palette</h3>
                <div class="colors">
                  ${project.pantoneColors.map(color => `
                    <div class="color-swatch" style="background-color: ${color.hex}">
                      <span>${color.name}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
  
              <div class="info-box"><strong>Naming:</strong> ${project.naming}</div>
              <div class="info-box"><strong>Payoff:</strong> ${project.payoff}</div>
              <div class="info-box"><strong>Values:</strong> ${project.values.join(', ')}</div>
              <div class="info-box"><strong>Mission:</strong> ${project.mission}</div>
              <div class="info-box"><strong>Vision:</strong> ${project.vision}</div>
              <div class="info-box"><strong>Brand Essence:</strong> ${project.brandEssence}</div>
              <div class="info-box"><strong>Architecture:</strong> ${project.brandArchitecture}</div>
              <div class="info-box"><strong>Graphic Elements:</strong> ${project.graphicElements.join(', ')}</div>
            </div>
          `;
          container.innerHTML += html;
        });
      })
      .catch(error => console.error('Error loading branding project:', error));
  });


  document.addEventListener('DOMContentLoaded', () => {
    const closeButton = document.getElementById('closeCookie');
    const banner = document.getElementById('cookieBanner');
  
    closeButton.addEventListener('click', () => {
      banner.style.display = 'none';
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Close cookie banner
    const closeButton = document.getElementById('closeCookie');
    const banner = document.getElementById('cookieBanner');
    closeButton.addEventListener('click', () => {
      banner.style.display = 'none';
    });
  
    // Custom cursor
    const cursor = document.getElementById('cursor');
  
    // Move the cursor
    document.addEventListener('mousemove', (e) => {
      cursor.style.top = `${e.clientY}px`;
      cursor.style.left = `${e.clientX}px`;
    });
  
    // Detect interactive elements
    document.addEventListener('mouseover', (e) => {
      const isInteractive = e.target.closest('a, button, .clickable, [role="button"], [onclick]');
      if (isInteractive) {
        cursor.classList.add('cursor-hover');
      } else {
        cursor.classList.remove('cursor-hover');
      }
    });
  
    // Remove class on mouseout to avoid stickiness
    document.addEventListener('mouseout', (e) => {
      cursor.classList.remove('cursor-hover');
    });
});

//open menu

const moreButton = document.getElementById("btnTopRight");
const dropdownMenu = document.getElementById("dropdownMenu");

function toggleMenu(e) {
  e.preventDefault();
  const isOpen = dropdownMenu.classList.contains("open");

  if (isOpen) {
    dropdownMenu.classList.remove("open");
    moreButton.textContent = "more";
    moreButton.classList.remove("open");
  } else {
    dropdownMenu.classList.add("open");
    moreButton.textContent = "close";
    moreButton.classList.add("open");
  }
}

function handleClickOutside(e) {
  const isClickInsideMenu = dropdownMenu.contains(e.target);
  const isClickOnButton = moreButton.contains(e.target);

  if (!isClickInsideMenu && !isClickOnButton && dropdownMenu.classList.contains("open")) {
    dropdownMenu.classList.remove("open");
    moreButton.textContent = "more";
    moreButton.classList.remove("open");
  }
}

moreButton.addEventListener("click", toggleMenu);
document.addEventListener("click", handleClickOutside);


//random project
document.getElementById('randomProjectButton').addEventListener('click', () => {
  const projectLinks = Array.from(document.querySelectorAll('.projects-section .project-grid a'));
  if (projectLinks.length === 0) return;

  const randomIndex = Math.floor(Math.random() * projectLinks.length);
  const randomHref = projectLinks[randomIndex].getAttribute('href');

  if (randomHref) {
    window.location.href = randomHref;
  }
});