import React from 'react';
import { PayPalButton } from 'react-paypal-button-v2';

const PayPalPaymentButton = () => {
  return (
    <PayPalButton
      amount="5.00"
      onSuccess={(details, data) => {
        alert("Transaction completed by " + details.payer.name.given_name);
        console.log({ details, data });
      }}
      options={{
        clientId: "your_paypal_client_id",
      }}
    />
  );
};

export default PayPalPaymentButton;

