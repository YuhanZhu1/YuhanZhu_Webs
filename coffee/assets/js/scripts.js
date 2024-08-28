import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBAjNZJAzRejznIPeai1QQ2ZFOTCNWO8Ic",
  authDomain: "yuyu-coffee.firebaseapp.com",
  databaseURL: "https://yuyu-coffee-default-rtdb.firebaseio.com",
  projectId: "yuyu-coffee",
  storageBucket: "yuyu-coffee.appspot.com",
  messagingSenderId: "701846772347",
  appId: "1:701846772347:web:1dbf3bd94f74e47135a0de",
  measurementId: "G-HNV1C3YXWD"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

function saveOrderToFirebase(orderData) {
  const ordersRef = ref(database, 'orders');
  push(ordersRef, orderData).then(() => {
    alert('Order submitted successfully!');
  }).catch((error) => {
    console.error('Error submitting order:', error);
  });
}

function calculatePrice() {
  const coffeeType = document.getElementById('coffee-type').value;
  const milkType = document.getElementById('milk-type').value;
  const quantity = parseInt(document.getElementById('quantity').value, 10);

  let pricePerCup = 0;
  switch (coffeeType) {
    case 'Espresso':
    case 'Americano':
    case 'Latte':
    case 'DecafEspresso':
    case 'DecafAmericano':
      pricePerCup = 1.1;
      break;
    case 'HandDrip':
      pricePerCup = 1.4;
      break;
    case 'Omakase':
      pricePerCup = 1.5;
      break;
  }

  const milkPrice = calculateMilkPrice(milkType);
  const totalPrice = (pricePerCup + milkPrice) * quantity;

  if (totalPrice > 25 || quantity > 15) {
    document.getElementById('price').innerText = `Whoa, ${quantity} cups of coffee? Yuhan might need an extra pair of hands to brew all that! Let's dial it back a bit. ☕️😄`;
    document.getElementById('joke-section').style.display = 'none';
    document.getElementById('payment-buttons').style.display = 'none';
  } else {
    document.getElementById('price').innerText = `Total Price: $${totalPrice.toFixed(2)}`;
    document.getElementById('joke-section').style.display = 'block';
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

function handleJoke() {
  const jokeResponse = document.getElementById('joke').value;
  const responseMessage = getJokeResponseMessage(jokeResponse);
  alert(responseMessage);

  const totalPrice = parseFloat(document.getElementById('price').innerText.replace('Total Price: $', ''));
  if (totalPrice > 0 && jokeResponse === 'pay') {
    const userName = document.getElementById('user-name').value;
    const coffeeType = document.getElementById('coffee-type').value;
    const coffeeTemp = document.getElementById('coffee-temp').value;
    const milkType = document.getElementById('milk-type').value;
    const quantity = document.getElementById('quantity').value;
    const note = document.getElementById('note').value;
    const orderNote = `Order: ${coffeeType} (${coffeeTemp}), Milk: ${milkType}, Quantity: ${quantity}, Note: ${note}, Name: ${userName}`;
    
    document.getElementById('venmo-button').setAttribute('href', `venmo://paycharge?txn=pay&recipients=Yuhan-Zhu-1&amount=${totalPrice}&note=${encodeURIComponent(orderNote)}`);
    document.getElementById('payment-buttons').style.display = 'block';
  } else {
    document.getElementById('payment-buttons').style.display = 'none';
    handleFormSubmission();
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

window.handleFormSubmission = function() {
  const userName = document.getElementById('user-name').value;
  const coffeeType = document.getElementById('coffee-type').value;
  const coffeeTemp = document.getElementById('coffee-temp').value;
  const milkType = document.getElementById('milk-type').value;
  const decaf = document.getElementById('decaf').value;
  const quantity = document.getElementById('quantity').value;
  const note = document.getElementById('note').value;
  const orderTime = new Date().toISOString();

  const orderData = {
    userName,
    coffeeType,
    coffeeTemp,
    milkType,
    decaf,
    quantity,
    note,
    orderTime
  };

  saveOrderToFirebase(orderData);
}

document.getElementById('calculate-price-button').addEventListener('click', calculatePrice);
document.getElementById('joke-button').addEventListener('click', handleJoke);
