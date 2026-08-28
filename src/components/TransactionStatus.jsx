import React from 'react';
import { CONFIG } from '../config';

/**
 * Transaction status badge — pending | confirmed | failed
 */
export const TransactionStatus = ({ txHash, status }) => {
  if (!txHash && !status) return null;

  const configs = {
    submitting: {
      icon: (
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      ),
      label: 'Submitting…',
      bg: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-800',
    },
    pending: {
      icon: (
        <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      ),
      label: 'Pending Confirmation',
      bg: 'bg-yellow-50 border-yellow-200',
      textColor: 'text-yellow-800',
    },
    confirmed: {
      icon: <span className="text-green-600 text-base">✅</span>,
      label: 'Confirmed',
      bg: 'bg-green-50 border-green-200',
      textColor: 'text-green-800',
    },
    failed: {
      icon: <span className="text-red-500 text-base">❌</span>,
      label: 'Failed',
      bg: 'bg-red-50 border-red-200',
      textColor: 'text-red-800',
    },
    timeout: {
      icon: <span className="text-orange-500 text-base">⏱️</span>,
      label: 'Timed Out',
      bg: 'bg-orange-50 border-orange-200',
      textColor: 'text-orange-800',
    },
    unknown: {
      icon: <span className="text-gray-500 text-base">❓</span>,
      label: 'Status Unknown',
      bg: 'bg-gray-50 border-gray-200',
      textColor: 'text-gray-800',
    },
  };

  const cfg = configs[status] || configs.pending;

  return (
    <div className={`border rounded-xl p-4 ${cfg.bg}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">{cfg.icon}</div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm ${cfg.textColor}`}>
            Transaction {cfg.label}
          </p>
          {txHash && (
            <div className="mt-1.5 space-y-1">
              <p className="text-xs text-gray-500 font-medium">Transaction Hash:</p>
              <div className="flex items-center space-x-2">
                <code className="text-xs text-gray-700 font-mono bg-white px-2 py-1 rounded border border-gray-200 truncate max-w-xs">
                  {txHash}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(txHash)}
                  title="Copy hash"
                  className="text-gray-400 hover:text-gray-700 flex-shrink-0"
                >
                  📋
                </button>
              </div>
              <a
                href={`${CONFIG.STELLAR_EXPERT_URL}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center text-xs font-medium underline ${cfg.textColor} hover:opacity-80`}
              >
                View on Stellar Expert ↗
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
