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

function calculatePrice() {
    const milkType = document.getElementById('milk-type').value;
    const quantity = parseInt(document.getElementById('quantity').value, 10);
    let price = 0;
    switch (milkType) {
        case 'Whole Milk':
        case '2%Milk':
            price = 0.2;
            break;
        case 'Oat Milk':
        case 'Almond Milk':
            price = 0.3;
            break;
        case 'Lactose Free Milk':
        case 'Coconut Milk':
            price = 0.4;
            break;
    }
    const totalPrice = (price * quantity).toFixed(2);
    document.getElementById('price').innerText = `Total Price: $${totalPrice}`;
    document.getElementById('joke-section').style.display = 'block';
}

function handleJoke() {
    const jokeSelect = document.getElementById('joke');
    const selectedJoke = jokeSelect.options[jokeSelect.selectedIndex].text;
    document.getElementById('price').innerText += `\n${selectedJoke}`;
    document.getElementById('payment-buttons').style.display = 'block';
}

