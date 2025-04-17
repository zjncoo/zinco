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

//smooth scrolling
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
  smooth: true,
  direction: 'vertical',
  gestureDirection: 'vertical',
  smoothTouch: true,
  touchMultiplier: 2,
  infinite: false,
});

// Update on each frame
function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)

//search bar
document.getElementById("search-button").addEventListener("click", function () {
  const searchBar = document.getElementById("search-bar");
  const body = document.body;
  
  searchBar.classList.toggle("show");
  body.classList.toggle("search-active");
});

document.getElementById("search-input").addEventListener("input", function () {
  const query = this.value.toLowerCase();
  const category = document.getElementById("category-select").value;
  
  // Get all project links and titles
  const projects = [
    { title: "Branding Project 1", category: "branding", link: "project1.html" },
    { title: "Branding Project 2", category: "branding", link: "project2.html" },
    { title: "Branding Project 3", category: "branding", link: "project3.html" },
    { title: "p5 Project 1", category: "p5", link: "p5_1.html" },
    { title: "p5 Project 2", category: "p5", link: "p5_2.html" },
    { title: "p5 Project 3", category: "p5", link: "p5_3.html" },
  ];

  const filteredProjects = projects.filter(project => {
    const matchesQuery = project.title.toLowerCase().includes(query);
    const matchesCategory = category ? project.category === category : true;
    return matchesQuery && matchesCategory;
  });

  // Display suggestions
  const suggestionsList = document.getElementById("search-suggestions");
  suggestionsList.innerHTML = "";
  
  filteredProjects.forEach(project => {
    const li = document.createElement("li");
    li.textContent = project.title;
    li.addEventListener("click", function () {
      window.location.href = project.link;
    });
    suggestionsList.appendChild(li);
  });
});