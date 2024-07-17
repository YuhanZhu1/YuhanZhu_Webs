function showPage(pageId) {
    const sections = document.querySelectorAll('main section');
    sections.forEach(section => {
        if (section.id === pageId) {
            section.classList.remove('hidden');
        } else {
            section.classList.add('hidden');
        }
    });
}

// Show the home page by default
document.addEventListener('DOMContentLoaded', function() {
    showPage('home');
});

function toggleMenu() {
    const menu = document.querySelector('nav ul');
    menu.classList.toggle('menu-active');
}

