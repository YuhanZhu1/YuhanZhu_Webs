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

// Preload first batch of images from TravelPhotography page
window.addEventListener('load', function() {
    const imagesToPreload = [];

    // Loop through the first 50 images and dynamically add to preload array
    for (let i = 1; i <= 50; i++) {
        imagesToPreload.push(`TravelPhotography/assets/img/IMG_${i.toString().padStart(4, '0')}.jpg`);
    }

    // Preload the images
    imagesToPreload.forEach(function(src) {
        const img = new Image();
        img.src = src;
    });
});

function toggleMenu() {
    const menu = document.querySelector('nav ul');
    menu.classList.toggle('menu-active');
}

function showPage(pageId) {
    // Prevent the default anchor behavior
    event.preventDefault();

    // Get the target element by its ID
    var targetElement = document.getElementById(pageId);

    // Get the height of the navigation bar to offset the scroll
    var navBarHeight = document.querySelector('header').offsetHeight;

    // Calculate the top position of the target element with the offset
    var targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navBarHeight;

    // Scroll to the target position smoothly
    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
}

// Function to toggle the visibility of the 'Learn More' sections
function toggleDetails(id) {
    var element = document.getElementById(id);
    
    // Prevent the default anchor link behavior
    event.preventDefault();

    // Check the current scroll position
    var currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    if (element.style.display === "block") {
        element.style.display = "none";
    } else {
        element.style.display = "block";
        // Restore the original scroll position to prevent jumping
        window.scrollTo({ top: currentScroll, behavior: 'smooth' });
    }
}
