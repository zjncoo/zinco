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

