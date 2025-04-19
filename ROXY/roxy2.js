document.addEventListener("DOMContentLoaded", function () {
    let video = document.getElementById("bg-video");
    let muteBtn = document.getElementById("mute-btn");

    // Ensure the video starts muted
    video.muted = true;
    muteBtn.textContent = "🔊 Unmute"; // Initial button text is "Unmute"

    // Button Click Event Listener
    muteBtn.addEventListener("click", function () {
        if (video.muted) {
            video.muted = false; // Unmute the video
            muteBtn.textContent = "🔇 Mute"; // Change button text to "Mute"
        } else {
            video.muted = true; // Mute the video
            muteBtn.textContent = "🔊 Unmute"; // Change button text to "Unmute"
        }
    });
});


  
// Wait for the page to load and trigger the initial transition animation
window.addEventListener('load', () => {
    const transitionCover = document.getElementById('transition-cover');
    
    // Initially, transition cover takes up the entire screen
    transitionCover.classList.add('show');

    // After the page has loaded, start the transition to move it down
    setTimeout(() => {
      transitionCover.classList.add('move-down');
    }, 50); // Small delay to ensure page load is fully processed
  });

  // For external link navigation (handling exit transition before page load)
  const transitionCover = document.getElementById('transition-cover');
  const externalLinks = document.querySelectorAll('.home_button, #backtoprojects');

  externalLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault(); // Prevent default link behavior
      document.body.classList.add('locked'); // Lock the page to prevent interaction

      // Trigger the exit transition (slide-up)
      transitionCover.classList.remove('move-down'); // Remove 'move-down' if already applied
      transitionCover.classList.add('move-up'); // Apply move-up transition to cover the screen

      // Wait for the exit animation to finish before navigating
      setTimeout(() => {
        window.location.href = link.href; // Navigate to the external link
      }, 1000); // Match this time with the duration of your animation
    });
});

// Overlay Toggle Function
function toggleOverlay() {
  const overlay = document.getElementById('overlay');
  if (overlay.classList.contains('active')) {
    overlay.classList.remove('active');
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 300);
  } else {
    overlay.style.display = 'flex';
    setTimeout(() => overlay.classList.add('active'), 10);
  }
}

function closeOverlay(event) {
  if (event.target === event.currentTarget) {
    toggleOverlay();
  }
}

// PDF.js Variables
const pdfUrl = 'roxy.pdf';
let pdfDoc = null, currentPage = 1, totalPages = 0, pageRendering = false;
const canvas = document.getElementById('pdf-canvas');
const ctx = canvas.getContext('2d');

// Load the PDF
pdfjsLib.getDocument(pdfUrl).promise.then((doc) => {
  pdfDoc = doc;
  totalPages = pdfDoc.numPages;
  document.getElementById('total-pages').textContent = totalPages;
  renderPage(currentPage);
  renderThumbnails();
});

// Render a specific page on the main canvas
function renderPage(pageNumber) {
  pageRendering = true;
  pdfDoc.getPage(pageNumber).then((page) => {
    const viewport = page.getViewport({ scale: 1.5 });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };

    page.render(renderContext).promise.then(() => {
      pageRendering = false;
    });

    document.getElementById('current-page').textContent = pageNumber;
  });
}

// Render thumbnails for all pages
function renderThumbnails() {
  const thumbnailsContainer = document.getElementById('thumbnails-container');
  for (let i = 1; i <= totalPages; i++) {
    const thumbnailCanvas = document.createElement('canvas');
    const thumbnailCtx = thumbnailCanvas.getContext('2d');
    pdfDoc.getPage(i).then((page) => {
      const viewport = page.getViewport({ scale: 0.1 });
      thumbnailCanvas.height = viewport.height;
      thumbnailCanvas.width = viewport.width;

      const renderContext = {
        canvasContext: thumbnailCtx,
        viewport: viewport
      };

      page.render(renderContext).promise.then(() => {
        thumbnailCanvas.style.marginRight = '10px';
        thumbnailCanvas.style.cursor = 'pointer';
        thumbnailCanvas.addEventListener('click', () => {
          currentPage = i;
          renderPage(currentPage);
        });

        thumbnailsContainer.appendChild(thumbnailCanvas);
      });
    });
  }
}

// Navigation buttons for PDF
document.getElementById('prev-page').addEventListener('click', () => {
  if (currentPage <= 1 || pageRendering) return;
  currentPage--;
  renderPage(currentPage);
});

document.getElementById('next-page').addEventListener('click', () => {
  if (currentPage >= totalPages || pageRendering) return;
  currentPage++;
  renderPage(currentPage);
});

// PDF.js Navigation with Magnifier
document.querySelectorAll('.page canvas').forEach((canvas) => {
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    magnifier.style.display = 'flex';
    magnifier.style.left = `${e.clientX - magnifier.offsetWidth / 2}px`;
    magnifier.style.top = `${e.clientY - magnifier.offsetHeight / 2}px`;
    magnifierCtx.clearRect(0, 0, magnifierCanvas.width, magnifierCanvas.height);
    magnifierCtx.drawImage(
      canvas,
      x - magnifierCanvas.width / 4,
      y - magnifierCanvas.height / 4,
      magnifierCanvas.width / 2,
      magnifierCanvas.height / 2,
      0,
      0,
      magnifierCanvas.width,
      magnifierCanvas.height
    );
  });

  canvas.addEventListener('mouseenter', () => {
    document.body.style.cursor = 'none';
    magnifier.style.display = 'block';
  });

  canvas.addEventListener('mouseleave', () => {
    document.body.style.cursor = 'default';
    magnifier.style.display = 'none';
  });
});

// Sidebar Highlighting on Scroll
document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('.sidebar-link');
  const sections = document.querySelectorAll('.section');

  const highlightLink = () => {
    const scrollPos = window.scrollY + window.innerHeight / 2;

    sections.forEach((section, index) => {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;

      if (scrollPos >= top && scrollPos <= bottom) {
        links.forEach((link) => link.classList.remove('highlight'));
        links[index].classList.add('highlight');
      }
    });
  };

  window.addEventListener('scroll', highlightLink);
  highlightLink(); // Initial highlight
});

// Smooth Scroll to Sections
document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const targetId = link.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        customScrollTo(targetElement);
      }
    });
  });

  function customScrollTo(targetElement) {
    const start = window.scrollY;
    const h2Element = targetElement.querySelector("h2");
    const h2OffsetTop = h2Element
      ? h2Element.getBoundingClientRect().top + window.scrollY
      : targetElement.getBoundingClientRect().top + window.scrollY;

    const viewportHeight = window.innerHeight;
    const end = h2OffsetTop - viewportHeight / 2 + (h2Element ? h2Element.offsetHeight / 2 : 0);

    const distance = Math.abs(end - start);
    const baseDuration = 400;
    const maxExtraDuration = 600;
    const duration = baseDuration + (distance / viewportHeight) * maxExtraDuration;

    const easingFunction = (t) => t * t * (3 - 2 * t);

    let startTime;
    function scrollAnimation(currentTime) {
      if (!startTime) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const easingProgress = easingFunction(progress);
      window.scrollTo(0, start + (end - start) * easingProgress);

      if (timeElapsed < duration) {
        requestAnimationFrame(scrollAnimation);
      }
    }

    requestAnimationFrame(scrollAnimation);
  }
});