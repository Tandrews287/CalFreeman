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

// Image swap functionality for work rows
document.querySelectorAll('.work-image-stack img').forEach((smallImg) => {
    smallImg.style.cursor = 'pointer';
    smallImg.addEventListener('click', () => {
        const row = smallImg.closest('.work-row');
        const largeImg = row.querySelector('.work-image-large');
        const largeSrc = largeImg.src;
        const largeAlt = largeImg.alt;
        largeImg.src = smallImg.src;
        largeImg.alt = smallImg.alt;
        smallImg.src = largeSrc;
        smallImg.alt = largeAlt;
    });
});
