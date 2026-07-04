const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

window.scrollTo(0, 0);

if (prefersReducedMotion) {
    document.body.classList.remove('is-loading');
    document.body.classList.add('page-ready');
} else {
    window.addEventListener('load', () => {
        window.scrollTo(0, 0);
        window.setTimeout(() => {
            document.body.classList.add('page-ready');
            document.body.classList.remove('is-loading');
        }, 80);
    });
}

const topNavLinks = Array.from(document.querySelectorAll('.top-nav a[href^="#"]'));

topNavLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
        const targetId = link.getAttribute('href');
        if (!targetId) {
            return;
        }

        const target = document.querySelector(targetId);
        if (!target) {
            return;
        }

        event.preventDefault();
        target.scrollIntoView({
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
            block: 'start',
        });

        history.replaceState(null, '', targetId);
    });
});

const aboutSection = document.querySelector('.about-section');

if (aboutSection) {
    if (prefersReducedMotion) {
        aboutSection.classList.add('is-dark');
    } else if ('IntersectionObserver' in window) {
        const aboutObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    aboutSection.classList.add('is-dark');
                    aboutObserver.disconnect();
                }
            });
        }, {
            threshold: 0.35,
            rootMargin: '0px 0px -10% 0px',
        });

        aboutObserver.observe(aboutSection);
    } else {
        aboutSection.classList.add('is-dark');
    }
}

const pressTitle = document.querySelector('.press-title-text');

if (pressTitle) {
    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
        const pressObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    pressTitle.classList.add('animate-press');
                    pressObserver.disconnect();
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -10% 0px',
        });

        pressObserver.observe(pressTitle);
    } else {
        pressTitle.classList.add('animate-press');
    }
}

// Lightbox Logic
const lightbox = document.getElementById('lightbox');
if (lightbox) {
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    
    let currentGallery = [];
    let currentIndex = 0;

    const openLightbox = (index) => {
        currentIndex = index;
        lightboxImg.src = currentGallery[currentIndex].src;
        lightboxImg.alt = currentGallery[currentIndex].alt;
        lightbox.classList.add('is-open');
        document.body.classList.add('lightbox-open');
        
        prevBtn.style.display = currentGallery.length > 1 ? 'flex' : 'none';
        nextBtn.style.display = currentGallery.length > 1 ? 'flex' : 'none';
    };

    const closeLightbox = () => {
        lightbox.classList.remove('is-open');
        document.body.classList.remove('lightbox-open');
        setTimeout(() => {
            lightboxImg.src = '';
        }, 300);
    };

    const nextImage = (e) => {
        if(e) e.stopPropagation();
        if (currentGallery.length <= 1) return;
        currentIndex = (currentIndex + 1) % currentGallery.length;
        lightboxImg.src = currentGallery[currentIndex].src;
        lightboxImg.alt = currentGallery[currentIndex].alt;
    };

    const prevImage = (e) => {
        if(e) e.stopPropagation();
        if (currentGallery.length <= 1) return;
        currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
        lightboxImg.src = currentGallery[currentIndex].src;
        lightboxImg.alt = currentGallery[currentIndex].alt;
    };

    document.querySelectorAll('.work-image-item').forEach(img => {
        img.addEventListener('click', () => {
            const row = img.closest('.work-row');
            if (row) {
                currentGallery = Array.from(row.querySelectorAll('.work-image-item'));
                const index = currentGallery.indexOf(img);
                if (index !== -1) {
                    openLightbox(index);
                }
            }
        });
    });

    closeBtn.addEventListener('click', closeLightbox);
    nextBtn.addEventListener('click', nextImage);
    prevBtn.addEventListener('click', prevImage);
    
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('is-open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
    });
}

// Email Signup Form Logic
const emailForm = document.getElementById('email-signup-form');
if (emailForm) {
    const submitBtn = document.getElementById('email-submit-btn');
    const feedback = document.getElementById('form-feedback');
    const emailInput = document.getElementById('email-input');

    emailForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        if (!email) return;

        submitBtn.classList.add('is-loading');
        submitBtn.disabled = true;
        feedback.textContent = '';
        feedback.className = 'form-feedback';

        try {
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok || response.status === 201) {
                feedback.textContent = data.message === 'Already subscribed!' ? 'Already subscribed!' : 'Subscribed successfully!';
                feedback.classList.add('success');
                emailInput.value = '';
                // Turn arrow to checkmark
                submitBtn.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="#10B981" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            } else {
                feedback.textContent = data.message || data.error || 'Something went wrong. Please try again.';
                feedback.classList.add('error');
            }
        } catch (error) {
            feedback.textContent = 'Network error. Please try again later.';
            feedback.classList.add('error');
        } finally {
            submitBtn.classList.remove('is-loading');
            submitBtn.disabled = false;
        }
    });
}

// Private Viewing Modal Logic
const pvModal = document.getElementById('pv-modal');
const pvTrigger = document.querySelector('.pv-trigger');
const pvClose = document.getElementById('pv-close');
const pvForm = document.getElementById('pv-form');
const pvEmail = document.getElementById('pv-email');
const pvMarketing = document.getElementById('pv-marketing');
const pvMessage = document.getElementById('pv-message');
const pvSubmit = document.getElementById('pv-submit');

if (pvModal && pvTrigger) {
    // Open modal
    const openModal = () => {
        pvModal.classList.add('active');
        pvModal.setAttribute('aria-hidden', 'false');
        pvEmail.focus();
    };

    pvTrigger.addEventListener('click', openModal);
    pvTrigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openModal();
        }
    });

    // Close modal
    const closeModal = () => {
        pvModal.classList.remove('active');
        pvModal.setAttribute('aria-hidden', 'true');
        pvMessage.textContent = '';
        pvMessage.className = 'pv-message';
    };

    pvClose.addEventListener('click', closeModal);
    pvModal.addEventListener('click', (e) => {
        if (e.target === pvModal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && pvModal.classList.contains('active')) {
            closeModal();
        }
    });

    // Handle submission
    pvForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = pvEmail.value.trim();
        if (!email) return;

        const marketingOptIn = pvMarketing.checked;
        
        pvSubmit.textContent = 'Requesting...';
        pvSubmit.disabled = true;
        pvMessage.textContent = '';
        pvMessage.className = 'pv-message';
        
        try {
            const response = await fetch('/api/request-viewing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email, 
                    marketingOptIn,
                    title: "SOMETHING YOU CANNOT NAME"
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                pvMessage.textContent = "Request sent! Please check your email.";
                pvMessage.className = 'pv-message success';
                pvForm.reset();
                setTimeout(closeModal, 3000);
            } else {
                pvMessage.textContent = data.error || 'Something went wrong. Please try again.';
                pvMessage.className = 'pv-message error';
            }
        } catch (err) {
            pvMessage.textContent = 'Network error. Please try again later.';
            pvMessage.className = 'pv-message error';
        } finally {
            pvSubmit.textContent = 'Request Link';
            pvSubmit.disabled = false;
        }
    });
}

// Screenings Accordion Logic
const screeningsToggle = document.querySelector('.screenings-toggle');
const screeningsContent = document.querySelector('.screenings-content');

if (screeningsToggle && screeningsContent) {
    screeningsToggle.addEventListener('click', () => {
        const isExpanded = screeningsToggle.getAttribute('aria-expanded') === 'true';
        
        if (isExpanded) {
            screeningsContent.style.opacity = '0';
            screeningsContent.style.transform = 'translateY(-5px)';
            
            setTimeout(() => {
                screeningsContent.hidden = true;
                screeningsToggle.setAttribute('aria-expanded', 'false');
            }, 300);
        } else {
            screeningsContent.hidden = false;
            // Force reflow
            screeningsContent.offsetHeight;
            
            screeningsContent.style.opacity = '1';
            screeningsContent.style.transform = 'translateY(0)';
            screeningsToggle.setAttribute('aria-expanded', 'true');
        }
    });
}
