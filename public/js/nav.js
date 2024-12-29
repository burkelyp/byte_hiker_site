// listener to keep nav "active" for current page


document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('nav#mainNav ul li a');
    const currentPath = window.location.pathname;

    // adds "active" if current page, use with nav CSS
    navLinks.forEach(link => {
      if (link.getAttribute('href') === currentPath) {
        link.classList.add('active');
      }
    });
  });