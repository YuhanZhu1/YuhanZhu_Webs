function toggleMenu() {
    const menu = document.querySelector('nav ul');
    menu.classList.toggle('menu-active');
}

document.addEventListener('DOMContentLoaded', function() {
    toggleMenu(); // 初始化菜单状态
});

