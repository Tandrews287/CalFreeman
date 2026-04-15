// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = entry.target.getAttribute('data-animation');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe portfolio items for staggered animation
document.querySelectorAll('.portfolio-item').forEach((item, index) => {
    item.setAttribute('data-animation', `fadeInUp 0.8s ease-out forwards`);
    item.style.animationDelay = `${index * 0.2}s`;
    observer.observe(item);
});

// Add parallax effect on scroll
let ticking = false;
let lastScrollY = 0;

function updateParallax() {
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${lastScrollY * 0.5}px)`;
    }
    ticking = false;
}

window.addEventListener('scroll', () => {
    lastScrollY = window.scrollY;
    if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
    }
});

// Add hover effect to portfolio videos
document.querySelectorAll('.portfolio-video').forEach(video => {
    video.addEventListener('mouseenter', function() {
        const videoElement = this.querySelector('video');
        if (videoElement) {
            videoElement.play();
        }
    });

    video.addEventListener('mouseleave', function() {
        const videoElement = this.querySelector('video');
        if (videoElement) {
            videoElement.pause();
        }
    });
});

// Navbar fade effect on scroll
let lastScrollPosition = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.borderBottom = '1px solid rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.borderBottom = '1px solid rgba(0, 0, 0, 0.05)';
    }
    lastScrollPosition = window.scrollY;
});
