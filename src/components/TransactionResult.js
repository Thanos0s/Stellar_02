import React from 'react';
import { STELLAR_CONFIG } from '../config';

const TransactionResult = ({ status, txHash, error, onReset }) => {
  if (status === 'idle') {
    return null;
  }

  if (status === 'pending') {
    return (
      <div className="section-card result-card result-pending">
        <h3>⏳ Transaction Pending...</h3>
        <p>Please wait while your transaction is being submitted to the Stellar Testnet.</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="section-card result-card result-success">
        <h3>✅ Transaction Successful!</h3>
        <p>
          Transaction Hash:{' '}
          <a
            href={`${STELLAR_CONFIG.explorerUrl}/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="tx-link"
          >
            {txHash}
          </a>
        </p>
        <div className="actions-row">
          <button onClick={onReset} className="btn btn-neutral">
            Calculate Another Split
          </button>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="section-card result-card result-error">
        <h3>❌ Transaction Failed</h3>
        <p>{error}</p>
        <div className="actions-row">
          <button onClick={onReset} className="btn btn-neutral">
            Try Again
          </button>
        </div>
      </div>
    );
  }
};

export default TransactionResult;
