import { useEffect, useState } from 'react';

export default function Home() {
  const [amount, setAmount] = useState('0.00');
  const [payments, setPayments] = useState(null);
  const [card, setCard] = useState(null);

  const initializeSquare = async () => {
    if (window.Square) {
      const paymentsInstance = window.Square.payments('YOUR_SQUARE_APPLICATION_ID', 'YOUR_SQUARE_LOCATION_ID');
      const cardInstance = await paymentsInstance.card();
      await cardInstance.attach('#payment-container');
      setPayments(paymentsInstance);
      setCard(cardInstance);
    }
  };

  useEffect(() => {
    if (window.Square) {
      initializeSquare();
    } else {
      const script = document.createElement('script');
      script.src = 'https://sandbox.web.squarecdn.com/v1/square.js';
      script.onload = initializeSquare;
      document.head.appendChild(script);
    }
  }, []);

  const handleKeypadClick = (value) => {
    if (value === 'C') {
      setAmount('0.00');
    } else {
      setAmount((prevAmount) => (prevAmount === '0.00' ? value : prevAmount + value));
    }
  };

  const handlePayment = async () => {
    const amountCents = Math.round(parseFloat(amount) * 100);
    if (amountCents > 0) {
      try {
        const result = await card.tokenize();
        if (result.status === 'OK') {
          const response = await fetch('/api/process-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nonce: result.token, amount: amountCents }),
          });
          const data = await response.json();
          if (data.success) {
            alert('Payment Successful!');
          } else {
            alert('Payment Failed: ' + data.error);
          }
        } else {
          console.error('Tokenization failed:', result.errors);
          alert('Tokenization failed');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Payment request failed');
      }
    } else {
      alert('Please enter a valid amount');
    }
  };

  return (
    <div>
      <div className="display" id="display">{amount}</div>
      <div className="keypad">
        {[...Array(9).keys()].map((n) => (
          <div key={n} className="key" onClick={() => handleKeypadClick((n + 1).toString())}>{n + 1}</div>
        ))}
        <div className="key" onClick={() => handleKeypadClick('0')}>0</div>
        <div className="key" onClick={() => handleKeypadClick('.')}>.</div>
        <div className="key" onClick={() => handleKeypadClick('C')}>C</div>
      </div>
      <div id="payment-container"></div>
      <button id="request-payment" onClick={handlePayment}>Request Payment</button>
      <style jsx>{`
        .keypad { display: flex; flex-wrap: wrap; width: 200px; }
        .key { flex: 1 0 33%; padding: 20px; text-align: center; cursor: pointer; border: 1px solid #ccc; }
        .display { width: 100%; text-align: right; padding: 10px; font-size: 20px; border: 1px solid #ccc; margin-bottom: 10px; }
      `}</style>
    </div>
  );
}
