import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBAjNZJAzRejznIPeai1QQ2ZFOTCNWO8Ic",
  authDomain: "yuyu-coffee.firebaseapp.com",
  projectId: "yuyu-coffee",
  storageBucket: "yuyu-coffee.appspot.com",
  messagingSenderId: "701846772347",
  appId: "1:701846772347:web:1dbf3bd94f74e47135a0de",
  measurementId: "G-HNV1C3YXWD"
};

// Initialize Firebase
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

function handleFormSubmission() {
  const userName = document.getElementById('user-name').value;
  const coffeeType = document.getElementById('coffee-type').value;
  const coffeeTemp = document.getElementById('coffee-temp').value;
  const milkType = document.getElementById('milk-type').value;
  const quantity = document.getElementById('quantity').value;
  const orderData = {
    userName,
    coffeeType,
    coffeeTemp,
    milkType,
    quantity
  };
  saveOrderToFirebase(orderData);
}

