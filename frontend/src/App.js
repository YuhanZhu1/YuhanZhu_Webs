import React from 'react';
import ReactDOM from 'react-dom';
import PayPalButton from './PayPalButton';
import VenmoButton from './VenmoButton';
import logo from './assets/logo.png';

const App = () => {
  return (
    <div>
      <img src={logo} alt="YuYu🐨Coffee" className="logo" />
      <h1>Welcome to YuYu🐨Coffee</h1>
      <div id="payment-buttons">
        <PayPalButton />
        <VenmoButton />
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));

