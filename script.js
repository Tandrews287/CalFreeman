const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const chapters = Array.from(document.querySelectorAll('.work-chapter'));
const contactButton = document.querySelector('.contact-button');
const contactModal = document.querySelector('.contact-modal');
const contactCloseTargets = Array.from(document.querySelectorAll('[data-contact-close]'));
let modalScrollY = 0;
let scrollFrame = null;

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

const revealTargets = document.querySelectorAll('.profile-panel, .work-chapter');

if (prefersReducedMotion) {
    revealTargets.forEach((element) => {
        element.classList.add('is-revealed');
    });
} else if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.16,
        rootMargin: '0px 0px -8% 0px',
    });

    revealTargets.forEach((element) => {
        revealObserver.observe(element);
    });
} else {
    revealTargets.forEach((element) => {
        element.classList.add('is-revealed');
    });
}

function updateChapterState(chapter) {
    const slides = Array.from(chapter.querySelectorAll('.work-slide'));
    if (!slides.length) {
        return;
    }

    const chapterTop = chapter.getBoundingClientRect().top + window.scrollY;
    const chapterHeight = Math.max(chapter.offsetHeight - window.innerHeight, window.innerHeight);
    const centerLine = window.scrollY + window.innerHeight * 0.5;
    const centeredStart = chapterTop - window.innerHeight * 0.5;
    const progress = Math.min(1, Math.max(0, (window.scrollY - centeredStart) / chapterHeight));
    const slideProgress = progress * (slides.length - 1);
    const chapterVisible = centerLine >= chapterTop;

    chapter.classList.toggle('is-visible', chapterVisible);

    slides.forEach((slide, index) => {
        const distance = Math.abs(slideProgress - index);
        const visibility = Math.max(0, 1 - distance * 2.4);
        const lift = Math.min(44, distance * 30);
        const scale = 1 - Math.min(distance, 1) * 0.05;
        slide.style.opacity = visibility.toFixed(3);
        slide.style.transform = `translateY(${lift}px) scale(${scale.toFixed(3)})`;
        slide.classList.toggle('is-active', distance < 0.5);

        slide.style.setProperty('--project-swipe', visibility.toFixed(3));
    });
}

function updateScrollStory() {
    chapters.forEach((chapter) => {
        updateChapterState(chapter);
    });
}

function scheduleScrollStory() {
    if (scrollFrame !== null) {
        return;
    }

    scrollFrame = window.requestAnimationFrame(() => {
        scrollFrame = null;
        updateScrollStory();
    });
}

function openContactModal() {
    if (!contactModal) {
        return;
    }

    modalScrollY = window.scrollY;
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
    contactModal.classList.add('is-open');
    contactModal.setAttribute('aria-hidden', 'false');
    contactModal.querySelector('.contact-modal-close')?.focus();
}

function closeContactModal() {
    if (!contactModal || !document.body.classList.contains('modal-open')) {
        return;
    }

    contactModal.classList.remove('is-open');
    contactModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    document.documentElement.classList.remove('modal-open');
    window.scrollTo(0, modalScrollY);
    contactButton?.focus();
}

contactButton?.addEventListener('click', (event) => {
    event.preventDefault();
    openContactModal();
});

contactCloseTargets.forEach((element) => {
    element.addEventListener('click', closeContactModal);
});

window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeContactModal();
    }
});

window.addEventListener('scroll', scheduleScrollStory, { passive: true });
window.addEventListener('resize', scheduleScrollStory);
window.addEventListener('load', updateScrollStory);
updateScrollStory();
