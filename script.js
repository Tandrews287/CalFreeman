const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const contactButton = document.querySelector('.contact-button');
const contactModal = document.querySelector('.contact-modal');
const contactCloseTargets = Array.from(document.querySelectorAll('[data-contact-close]'));
const revealTargets = document.querySelectorAll('.profile-panel, .project-panel');
const projectPanels = Array.from(document.querySelectorAll('[data-project-panel]'));
const filterControls = Array.from(document.querySelectorAll('[data-filter-control]'));
let modalScrollY = 0;

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

function revealElement(element) {
    element.classList.add('is-revealed');
}

if (prefersReducedMotion) {
    revealTargets.forEach(revealElement);
} else if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                revealElement(entry.target);
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.14,
        rootMargin: '0px 0px -6% 0px',
    });

    revealTargets.forEach((element) => {
        revealObserver.observe(element);
    });
} else {
    revealTargets.forEach(revealElement);
}

function setPreviewState(panel, control) {
    const previewImage = panel.querySelector('[data-project-image]');
    const previewTitle = panel.querySelector('[data-project-title]');
    const previewDate = panel.querySelector('[data-project-date]');
    const previewNumber = panel.querySelector('[data-project-number]');
    const controls = Array.from(panel.querySelectorAll('[data-preview-control]'));

    if (!previewImage || !previewTitle || !previewDate || !previewNumber) {
        return;
    }

    previewImage.src = control.dataset.previewSrc || previewImage.src;
    previewImage.alt = control.dataset.previewAlt || previewImage.alt;
    previewTitle.textContent = control.dataset.previewTitle || previewTitle.textContent;
    previewDate.textContent = control.dataset.previewDate || previewDate.textContent;
    previewNumber.textContent = control.dataset.previewNumber || previewNumber.textContent;

    controls.forEach((chip) => {
        chip.classList.toggle('is-active', chip === control);
        chip.setAttribute('aria-pressed', String(chip === control));
    });

    const playButton = panel.querySelector('.project-play-button');
    if (playButton) {
        playButton.setAttribute('aria-label', `Play preview for ${previewTitle.textContent}`);
    }
}

projectPanels.forEach((panel) => {
    const controls = Array.from(panel.querySelectorAll('[data-preview-control]'));
    if (!controls.length) {
        return;
    }

    const initialControl = controls.find((control) => control.classList.contains('is-active')) || controls[0];
    setPreviewState(panel, initialControl);

    controls.forEach((control) => {
        control.addEventListener('click', () => {
            setPreviewState(panel, control);
        });
    });

    const playButton = panel.querySelector('.project-play-button');
    if (playButton) {
        playButton.addEventListener('click', () => {
            panel.classList.add('is-playing');
            window.setTimeout(() => {
                panel.classList.remove('is-playing');
            }, 280);
        });
    }
});

function applyProjectFilter(filterValue) {
    projectPanels.forEach((panel) => {
        const categoryValue = panel.dataset.projectCategory || '';
        const panelCategories = categoryValue.split(/\s+/).filter(Boolean);
        const shouldShow = filterValue === 'all' || panelCategories.includes(filterValue);

        panel.classList.toggle('is-filtered-out', !shouldShow);
    });
}

if (filterControls.length) {
    filterControls.forEach((control) => {
        control.addEventListener('click', () => {
            const filterValue = control.dataset.filterValue || 'all';

            filterControls.forEach((chip) => {
                const isActive = chip === control;
                chip.classList.toggle('is-active', isActive);
                chip.setAttribute('aria-pressed', String(isActive));
            });

            applyProjectFilter(filterValue);
        });
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