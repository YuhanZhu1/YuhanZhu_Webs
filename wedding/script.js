document.addEventListener("DOMContentLoaded", () => {
    // =========================================
    // Elegant Reveal Animation on Scroll
    // =========================================
    const revealElements = document.querySelectorAll('.reveal');

    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    };

    const revealOptions = {
        threshold: 0.15, // Triggers when 15% of the element is visible
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver(revealCallback, revealOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });


    // =========================================
    // Countdown Timer (Beijing Time UTC+8)
    // =========================================
    
    // Target: August 8, 2026, 11:08 AM Beijing Time
    // ISO 8601 format with +08:00 timezone offset ensures absolute accuracy worldwide
    const targetDate = new Date('2026-08-08T11:08:00+08:00').getTime();

    // Grab DOM elements
    const countdownContainer = document.getElementById('countdown');
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    const updateCountdown = () => {
        // Skip if countdown elements are missing on the page
        if (!countdownContainer || !daysEl || !hoursEl || !minutesEl || !secondsEl) return;

        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            // If the wedding time has passed, replace timer with an elegant message
            countdownContainer.innerHTML = "<h3 class='en italic' style='color: var(--color-accent); font-size: 2.5rem; font-weight: 400;'>Just Married!</h3>";
            clearInterval(timerInterval);
            return;
        }

        // Calculate time left
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

