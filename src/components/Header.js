import React, { useState } from 'react';
import { checkConnection, retrievePublicKey, getBalance, sendPayment } from './freighter';
import SplitCalculator from './SplitCalculator';
import TransactionResult from './TransactionResult';

const Header = () => {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState('');
  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState('idle'); // idle, pending, success, error
  const [txHash, setTxHash] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showCalculator, setShowCalculator] = useState(false);

  const connectWallet = async () => {
    setLoading(true);
    try {
      console.log('Starting wallet connection...');
      const allowed = await checkConnection();
      console.log('Connection allowed:', allowed);

      if (!allowed) {
        alert('Permission denied - please allow access in Freighter wallet.\n\nMake sure:\n1. Freighter extension is installed\n2. You have a Freighter account\n3. Check browser console (F12) for details');
        return;
      }

      const key = await retrievePublicKey();
      const bal = await getBalance();
      setPublicKey(key);
      setBalance(Number(bal).toFixed(2));
      setConnected(true);
      setShowCalculator(true);
    } catch (e) {
      console.error('Wallet connection error:', e);
      alert(`Connection error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setConnected(false);
    setPublicKey('');
    setBalance('');
    setShowCalculator(false);
    setTxStatus('idle');
    setTxHash('');
    setErrorMessage('');
  };

  const handleCalculateAndSend = async (splitData) => {
    setTxStatus('pending');
    setErrorMessage('');

    try {
      // Send the payment
      const hash = await sendPayment(splitData.recipientAddress, splitData.shareAmount);

      // Update balance after successful transaction
      const newBalance = await getBalance();
      setBalance(Number(newBalance).toFixed(2));

      setTxHash(hash);
      setTxStatus('success');
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage(error.message || 'Transaction failed');
      setTxStatus('error');
    }
  };

  const resetTransaction = () => {
    setTxStatus('idle');
    setTxHash('');
    setErrorMessage('');
  };

  return (
    <header className="app-shell">
      <h1 className="app-title">Stellar Split Bill Calculator</h1>
      <div className="app-subtitle">Stellar DAPP - Testnet</div>

      {!connected ? (
        <div className="section-card" style={{ textAlign: 'center' }}>
          <button onClick={connectWallet} disabled={loading} className="btn btn-primary">
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
      ) : (
        <div>
          <div className="section-card wallet-card">
            {publicKey && (
              <>
                <div className="wallet-row">
                  <strong>Connected Address:</strong> {`${publicKey.slice(0, 10)}...${publicKey.slice(-10)}`}
                </div>
                <div className="wallet-row">
                  <strong>Balance:</strong> {balance} XLM
                </div>
              </>
            )}
            <button onClick={disconnectWallet} className="btn btn-neutral">
              Disconnect Wallet
            </button>
          </div>

          {showCalculator && (
            <>
              <SplitCalculator onCalculate={handleCalculateAndSend} />
              <TransactionResult status={txStatus} txHash={txHash} error={errorMessage} onReset={resetTransaction} />
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
