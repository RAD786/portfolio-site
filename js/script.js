document.querySelectorAll('#offcanvasNav .nav-link').forEach(link => {
  link.addEventListener('click', () => {
    const offcanvasEl = document.getElementById('offcanvasNav');
    const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
    bsOffcanvas.hide();
  });
});


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

// Contact form submit via Netlify Function
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  const statusEl = document.getElementById('form-status');

  contactForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (statusEl) {
      statusEl.textContent = 'Sending...';
      statusEl.className = 'form-status';
    }

    const formData = new FormData(contactForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/.netlify/functions/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || 'Message failed.');
      }

      if (statusEl) {
        statusEl.textContent = 'Message sent. Thanks for reaching out!';
        statusEl.classList.add('is-success');
      }
      contactForm.reset();
    } catch (error) {
      if (statusEl) {
        statusEl.textContent = 'Something went wrong. Please try again or email directly.';
        statusEl.classList.add('is-error');
      }
    }
  });
}
