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
            if (window.timerInterval) clearInterval(window.timerInterval);
            return;
        }

        // Calculate time left
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Update UI with zero-padding (e.g., 05 instead of 5)
        daysEl.innerText = String(days).padStart(3, '0');
        hoursEl.innerText = String(hours).padStart(2, '0');
        minutesEl.innerText = String(minutes).padStart(2, '0');
        secondsEl.innerText = String(seconds).padStart(2, '0');
    };

    // Run immediately to prevent flash, then update every second
    updateCountdown();
    window.timerInterval = setInterval(updateCountdown, 1000);

    // =========================================
    // Message Wall Static Interaction
    // =========================================
    const sendBtn = document.getElementById('sendMessageBtn');
    const nameInput = document.getElementById('guestName');
    const messageInput = document.getElementById('guestMessage');
    const formStatus = document.getElementById('formStatus');

    if (sendBtn) {
        sendBtn.addEventListener('click', () => {
            const name = nameInput.value.trim();
            const msg = messageInput.value.trim();

            if (!name || !msg) {
                formStatus.style.display = 'block';
                formStatus.innerHTML = '<span style="color: #c94c4c;">Please enter both your name and a message. / 请填写完整姓名与留言。</span>';
                return;
            }

            // Show an elegant confirmation message
            formStatus.style.display = 'block';
            formStatus.innerHTML = `
                <div class="elegant-confirmation" style="margin-top: 1.5rem; padding: 1.5rem; background-color: var(--color-bg-white); border: 1px solid var(--color-accent); border-radius: 4px;">
                    <p class="en italic" style="color: var(--color-accent); font-size: 1.2rem; margin-bottom: 0.5rem;">Thank you, ${name}!</p>
                    <p class="en">To ensure we receive your beautiful blessings, please copy your message and send it directly to Yuhan or Geunyoung via WeChat!</p>
                    <p class="zh" style="margin-top: 0.5rem;">感谢您的祝福！为了确保我们能妥善珍藏您的心意，请将这段留言直接复制并发送至我们的微信，谢谢！</p>
                </div>
            `;
            
            // Clear inputs
            nameInput.value = '';
            messageInput.value = '';
        });
    }
});
