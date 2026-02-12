// Auto-close Offcanvas menu on link click
document.querySelectorAll('#offcanvasNav .nav-link').forEach(link => {
  link.addEventListener('click', () => {
    const offcanvasEl = document.getElementById('offcanvasNav');
    const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
    bsOffcanvas.hide();
  });
});

// Reveal animations on scroll
const revealItems = document.querySelectorAll('.reveal');
if (revealItems.length) {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealItems.forEach(item => observer.observe(item));
}
