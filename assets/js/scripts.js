const venmoUsername = 'Yuhan-Zhu-1';
const yourPhoneNumber = '+15178020375';

function calculatePrice() {
  const coffeeType = document.getElementById('coffee-type').value;
  const milkType = document.getElementById('milk-type').value;
  const quantity = parseInt(document.getElementById('quantity').value, 10);

  let price = 0;
  switch (coffeeType) {
    case 'Espresso':
    case 'Americano':
    case 'DecafEspresso':
    case 'DecafAmericano':
      price = 1.1;
      break;
    case 'HandDrip':
      price = 1.4;
      break;
    case 'Omakase':
      price = 1.5;
      break;
  }

  price += calculateMilkPrice(milkType) * quantity;

  if (price > 25 || quantity > 15) {
    displayPrice(`Total Price: $${price.toFixed(2)}\nWow, ${quantity} cups of coffee? That's a lot! Yuhan can't make that many at this moment.`, false);
  } else {
    displayPrice(`Total Price: $${price.toFixed(2)}`, true);
  }
}

function calculateMilkPrice(milkType) {
  switch (milkType) {
    case 'Whole Milk':
    case '2%Milk':
      return 0.2;
    case 'Oat Milk':
    case 'Almond Milk':
      return 0.3;
    case 'Lactose Free Milk':
    case 'Coconut Milk':
      return 0.4;
    default:
      return 0;
  }
}

function displayPrice(priceText, showJokeSection) {
  document.getElementById('price').innerText = priceText;
  document.getElementById('joke-section').style.display = showJokeSection ? 'block' : 'none';
  document.getElementById('payment-buttons').style.display = 'none';
}

function handleJoke() {
  const jokeResponse = document.getElementById('joke').value;
  const responseMessage = getJokeResponseMessage(jokeResponse);
  alert(responseMessage);
  const orderDetails = getOrderDetails();

  if (jokeResponse === 'pay') {
    document.getElementById('payment-buttons').style.display = 'block';
  } else {
    const smsLink = `sms:${yourPhoneNumber}?&body=${encodeURIComponent(`${responseMessage}\n${orderDetails}`)}`;
    window.location.href = smsLink;
  }
}

function getJokeResponseMessage(jokeResponse) {
  switch (jokeResponse) {
    case 'yes': return '☀️ Have a joyful day! Your coffee is free!';
    case 'positive': return 'Keep spreading positivity🫰 Your coffee is free!';
    case 'smile': return '😊 Keep smiling and make others smile! Your coffee is free!';
    case 'gratitude': return 'Thank you for showing gratitude❤️ Your coffee is free!';
    case 'pay': return 'Money 💵 for me!!!🤩🤩🤩 THANK YOU!!!';
    default: return '';
  }
}

function getOrderDetails() {
  const coffeeType = document.getElementById('coffee-type').value;
  const coffeeTemp = document.getElementById('coffee-temp').value;
  const milkType = document.getElementById('milk-type').value;
  const quantity = document.getElementById('quantity').value;
  return `Coffee Order: ${quantity} x ${coffeeType}, ${coffeeTemp}, ${milkType}`;
}

document.getElementById('venmo-button').addEventListener('click', () => {
  const note = getOrderDetails();
  const priceText = document.getElementById('price').innerText;
  const price = priceText.split('$')[1];
  window.location.href = `venmo://paycharge?txn=pay&recipients=${venmoUsername}&amount=${price}&note=${encodeURIComponent(note)}`;
});

