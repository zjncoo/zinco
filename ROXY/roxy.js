document.addEventListener("DOMContentLoaded", function () {
    let video = document.getElementById("bg-video");
    let muteBtn = document.getElementById("mute-btn");

    // Ensure the video starts muted
    video.muted = true;
    muteBtn.textContent = "🔇 Mute"; // Set initial button text

    // Button Click Event Listener
    muteBtn.addEventListener("click", function () {
        if (video.muted) {
            video.muted = false;
            video.volume = 1; // Ensure volume is set when unmuting
            muteBtn.textContent = "🔊 Unmute";
        } else {
            video.muted = true;
            muteBtn.textContent = "🔇 Mute";
        }
    });
});

document.addEventListener("DOMContentLoaded", function() {
    const sidebarBox = document.getElementById('sidebarbox');
    const toggleButton = document.getElementById('toggle-sidebar-button');

    // Initially hide the sidebar by setting left off-screen
    sidebarBox.style.left = '-250px'; 

    // Toggle sidebar visibility when the button is clicked
    toggleButton.addEventListener('click', function() {
        sidebarBox.classList.toggle('active'); // Toggle the 'active' class
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