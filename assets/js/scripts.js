document.addEventListener('DOMContentLoaded', function() {
    showPage('home');

    // Scroll effect for header and menu icon
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        const menuIcon = document.querySelector('.menu-icon');
        const screenWidth = window.innerWidth;

        if (screenWidth >= 800 && window.scrollY > 50) {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
            menuIcon.style.display = 'none';
        } else if (screenWidth >= 800) {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            menuIcon.style.display = 'none';
        } else {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            menuIcon.style.display = 'block';
        }
    });

    // Close the menu when clicking outside of it or on a navigation link
    document.addEventListener('click', function(event) {
        const menu = document.querySelector('nav ul');
        const menuIcon = document.querySelector('.menu-icon');
        const isClickInsideMenu = menu.contains(event.target) || menuIcon.contains(event.target);

        if (!isClickInsideMenu && menu.classList.contains('menu-active')) {
            menu.classList.remove('menu-active');
        }
    });

    // Close the menu after selecting a page
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', function() {
            const menu = document.querySelector('nav ul');
            if (menu.classList.contains('menu-active')) {
                menu.classList.remove('menu-active');
            }
        });
    });
});

function toggleMenu() {
    const menu = document.querySelector('nav ul');
    menu.classList.toggle('menu-active');
}


