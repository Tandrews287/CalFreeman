const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const profilePanel = document.querySelector('.profile-panel');
let profileFadeFrame = null;

if (prefersReducedMotion) {
    document.body.classList.remove('is-loading');
    document.body.classList.add('page-ready');
} else {
    window.addEventListener('load', () => {
        window.setTimeout(() => {
            document.body.classList.add('page-ready');
            document.body.classList.remove('is-loading');
        }, 80);
    });
}

function updateProfileFade() {
    if (!profilePanel) {
        return;
    }

    const fadeDistance = Math.max(window.innerHeight * 1.2, 600);
    const fadeProgress = Math.min(1, window.scrollY / fadeDistance);
    const opacity = Math.max(0.08, 1 - fadeProgress);
    const offset = Math.min(28, window.scrollY * 0.04);

    profilePanel.style.opacity = opacity.toFixed(3);
    profilePanel.style.transform = `translateY(${offset}px)`;
}

function scheduleProfileFade() {
    if (profileFadeFrame !== null) {
        return;
    }

    profileFadeFrame = window.requestAnimationFrame(() => {
        profileFadeFrame = null;
        updateProfileFade();
    });
}

const portfolioVideos = document.querySelectorAll('.portfolio-video video');

portfolioVideos.forEach((video) => {
    video.preload = 'metadata';

    video.addEventListener('mouseenter', () => {
        video.play().catch(() => {
            // Autoplay can be blocked until user interaction on some browsers.
        });
    });

    video.addEventListener('mouseleave', () => {
        video.pause();
    });
});

window.addEventListener('scroll', scheduleProfileFade, { passive: true });
window.addEventListener('resize', scheduleProfileFade);
window.addEventListener('load', updateProfileFade);
updateProfileFade();
