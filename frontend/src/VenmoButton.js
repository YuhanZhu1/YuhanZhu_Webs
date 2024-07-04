import React from 'react';

const VenmoButton = () => {
  return (
    <div>
      <a href="venmo://paycharge?txn=pay&recipients=your_venmo_username&amount=5&note=Coffee%20Order">
        <button>Pay with Venmo</button>
      </a>
    </div>
  );
};

export default VenmoButton;

