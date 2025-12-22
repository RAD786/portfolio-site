// Auto-close Offcanvas menu on link click
document.querySelectorAll('#offcanvasNav .nav-link').forEach(link => {
  link.addEventListener('click', () => {
    const offcanvasEl = document.getElementById('offcanvasNav');
    const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
    bsOffcanvas.hide();
  });
});
