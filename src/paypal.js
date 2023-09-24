const paypal = require('paypal-rest-sdk');


paypal.configure({
  mode: 'sandbox', // Use 'live' for production
  client_id: process.env.PAYPALCLIENT,
  client_secret: process.env.PAYPALSECRET,
});

const createPayPalPayment = (amount, description, callbackUrl) => {
  const paymentData = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal',
    },
    redirect_urls: {
      return_url: callbackUrl,
      cancel_url: callbackUrl,
    },
    transactions: [
      {
        amount: {
          total: amount.toFixed(2),
          currency: 'USD',
        },
        description,
      },
    ],
  };

  return new Promise((resolve, reject) => {
    paypal.payment.create(paymentData, (error, payment) => {
      if (error) {
        reject(error);
      } else {
        resolve(payment);
      }
    });
  });
};

module.exports = {
  createPayPalPayment,
};