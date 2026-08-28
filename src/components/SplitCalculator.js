import React, { useState } from 'react';

const SplitCalculator = ({ onCalculate }) => {
  const [billAmount, setBillAmount] = useState('');
  const [numPeople, setNumPeople] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [error, setError] = useState('');

  const handleCalculate = () => {
    // Validate inputs
    if (!billAmount || billAmount <= 0) {
      setError('Bill amount must be greater than 0');
      return;
    }

    if (!numPeople || numPeople < 1) {
      setError('Number of people must be at least 1');
      return;
    }

    if (!recipientAddress.trim()) {
      setError('Recipient address is required');
      return;
    }

    // Validate Stellar address format (starts with G and 56 characters)
    if (!/^G[A-Z2-7]{55}$/.test(recipientAddress)) {
      setError('Invalid Stellar address format');
      return;
    }

    // Calculate per-person share (rounded to 7 decimals, Stellar's precision)
    const shareAmount = (parseFloat(billAmount) / parseInt(numPeople)).toFixed(7);

    setError('');
    onCalculate({
      billAmount: parseFloat(billAmount),
      numPeople: parseInt(numPeople),
      shareAmount: parseFloat(shareAmount),
      recipientAddress: recipientAddress.trim(),
    });
  };

  return (
    <div className="section-card">
      <h2>Split Bill Calculator</h2>

      <div className="form-grid">
        <div className="field">
          <label htmlFor="billAmount">Total Bill Amount (XLM)</label>
          <input
            id="billAmount"
            type="number"
            value={billAmount}
            onChange={(e) => setBillAmount(e.target.value)}
            placeholder="e.g., 100"
            min="0"
            step="0.01"
          />
        </div>

        <div className="field">
          <label htmlFor="numPeople">Number of People</label>
          <input
            id="numPeople"
            type="number"
            value={numPeople}
            onChange={(e) => setNumPeople(e.target.value)}
            placeholder="e.g., 4"
            min="1"
          />
        </div>

        <div className="field field-full">
          <label htmlFor="recipientAddress">Recipient Address (Stellar Address)</label>
          <input
            id="recipientAddress"
            type="text"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="G..."
          />
        </div>
      </div>

      {error && <div className="error-text">{error}</div>}

      <div className="actions-row">
        <button onClick={handleCalculate} className="btn btn-primary">
          Calculate & Send Payment
        </button>
      </div>
    </div>
  );
};

export default SplitCalculator;
