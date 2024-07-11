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

  if (milkType === 'Whole Milk') price += 0.2;
  if (milkType === '2%Milk') price += 0.2;
  if (milkType === 'Oat Milk') price += 0.3;
  if (milkType === 'Almond Milk') price += 0.3;
  if (milkType === 'Lactose Free Milk') price += 0.4;
  if (milkType === 'Coconut Milk') price += 0.4;

  price *= quantity;

  if (price > 25 || quantity > 15) {
    document.getElementById('price').innerText = `Total Price: $${price.toFixed(2)}\nWow, ${quantity} cups of coffee? That's a lot! Yuhan can't make that many at this moment.`;
    document.getElementById('joke-section').style.display = 'none';
    document.getElementById('payment-buttons').style.display = 'none';
  } else {
    document.getElementById('price').innerText = `Total Price: $${price.toFixed(2)}`;
    document.getElementById('joke-section').style.display = 'block';
  }
}

function handleJoke() {
  const jokeResponse = document.getElementById('joke').value;
  const coffeeType = document.getElementById('coffee-type').value;
  const coffeeTemp = document.getElementById('coffee-temp').value;
  const milkType = document.getElementById('milk-type').value;
  const quantity = document.getElementById('quantity').value;
  const priceText = document.getElementById('price').innerText;
  const price = priceText.split('$')[1];

  let responseMessage = '';
  switch (jokeResponse) {
    case 'yes':
      responseMessage = '☀️ Have a joyful day! Your coffee is free!';
      break;
    case 'positive':
      responseMessage = 'Keep spreading positivity🫰 Your coffee is free!';
      break;
    case 'smile':
      responseMessage = '😊 Keep smiling and make others smile! Your coffee is free!';
      break;
    case 'gratitude':
      responseMessage = 'Thank you for showing gratitude❤️  Your coffee is free!';
      break;
    case 'pay':
      responseMessage = 'Money 💵 for me!!!🤩🤩🤩 THANK YOU!!!'
  }

  alert(responseMessage);
  const orderDetails = `Coffee Order: ${quantity} x ${coffeeType}, ${coffeeTemp}, ${milkType}`;
  const note = `${responseMessage}\n${orderDetails}`;

  if (jokeResponse === 'pay') {
    document.getElementById('payment-buttons').style.display = 'block';
  } else {
    const smsLink = `sms:${yourPhoneNumber}?&body=${encodeURIComponent(note)}`;
    window.location.href = smsLink;
  }
}

document.getElementById('venmo-button').addEventListener('click', () => {
  const coffeeType = document.getElementById('coffee-type').value;
  const coffeeTemp = document.getElementById('coffee-temp').value;
  const milkType = document.getElementById('milk-type').value;
  const quantity = document.getElementById('quantity').value;
  const priceText = document.getElementById('price').innerText;
  const price = priceText.split('$')[1];

  const note = `Coffee Order: ${quantity} x ${coffeeType}, ${coffeeTemp}, ${milkType}`;
  window.location.href = `venmo://paycharge?txn=pay&recipients=${venmoUsername}&amount=${price}&note=${encodeURIComponent(note)}`;
});
